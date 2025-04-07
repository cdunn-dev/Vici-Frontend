import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { RateLimitMonitoringService } from './rateLimitMonitoringService';
import { ErrorHandlingService, ErrorCategory, ErrorSeverity } from './errorHandlingService';
import { RedisService } from './redis';

export interface RateLimitAlertConfig {
  notificationChannels: {
    email: boolean;
    slack: boolean;
    webhook: boolean;
  };
  alertThresholds: {
    rateLimitHits: number;
    latency: number;
    errorRate: number;
  };
  cooldownPeriod: number;
  maxAlertsPerPeriod: number;
  alertRetentionPeriod: number;
}

export interface RateLimitAlert {
  id: string;
  type: 'HIGH_RATE_LIMIT_HITS' | 'HIGH_LATENCY' | 'HIGH_ERROR_RATE' | 'UNUSUAL_PATTERN';
  severity: 'warning' | 'error' | 'critical';
  message: string;
  details: {
    identifier?: string;
    tier?: string;
    value: number;
    threshold: number;
    timestamp: Date;
  };
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const DEFAULT_CONFIG: RateLimitAlertConfig = {
  notificationChannels: {
    email: true,
    slack: true,
    webhook: false
  },
  alertThresholds: {
    rateLimitHits: 0.1, // 10% rate limit hits
    latency: 1000, // 1 second
    errorRate: 0.01 // 1% error rate
  },
  cooldownPeriod: 300000, // 5 minutes
  maxAlertsPerPeriod: 5,
  alertRetentionPeriod: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export class RateLimitAlertingService extends EventEmitter {
  private static instance: RateLimitAlertingService;
  private config: RateLimitAlertConfig;
  private rateLimitMonitoringService: RateLimitMonitoringService;
  private errorHandlingService: ErrorHandlingService;
  private redis: RedisService;
  private alerts: Map<string, RateLimitAlert> = new Map();
  private alertCounts: Map<string, number> = new Map();
  private alertTimestamps: Map<string, number> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor(
    rateLimitMonitoringService: RateLimitMonitoringService,
    errorHandlingService: ErrorHandlingService,
    config: Partial<RateLimitAlertConfig> = {}
  ) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.rateLimitMonitoringService = rateLimitMonitoringService;
    this.errorHandlingService = errorHandlingService;
    this.redis = RedisService.getInstance();
    this.startMonitoring();
  }

  public static getInstance(
    rateLimitMonitoringService: RateLimitMonitoringService,
    errorHandlingService: ErrorHandlingService,
    config?: Partial<RateLimitAlertConfig>
  ): RateLimitAlertingService {
    if (!RateLimitAlertingService.instance) {
      RateLimitAlertingService.instance = new RateLimitAlertingService(
        rateLimitMonitoringService,
        errorHandlingService,
        config
      );
    }
    return RateLimitAlertingService.instance;
  }

  private startMonitoring(): void {
    // Subscribe to rate limit monitoring events
    this.rateLimitMonitoringService.on('alert', (alert) => {
      this.handleAlert(alert);
    });

    // Set up cleanup interval
    this.cleanupInterval = setInterval(
      () => this.cleanupOldAlerts(),
      3600000 // 1 hour
    );
  }

  private async handleAlert(alert: any): Promise<void> {
    try {
      const alertId = this.generateAlertId(alert);
      const now = Date.now();

      // Check cooldown period
      const lastAlert = this.alertTimestamps.get(alertId) || 0;
      if (now - lastAlert < this.config.cooldownPeriod) {
        // Increment count
        const count = (this.alertCounts.get(alertId) || 0) + 1;
        this.alertCounts.set(alertId, count);

        // Skip if below threshold
        if (count < this.config.maxAlertsPerPeriod) {
          return;
        }
      }

      // Create alert
      const rateLimitAlert: RateLimitAlert = {
        id: alertId,
        type: alert.type,
        severity: this.determineSeverity(alert),
        message: alert.message,
        details: {
          identifier: alert.details.identifier,
          tier: alert.details.tier,
          value: alert.details.value || 0,
          threshold: alert.details.threshold || 0,
          timestamp: new Date()
        },
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store alert
      this.alerts.set(alertId, rateLimitAlert);
      await this.storeAlert(rateLimitAlert);

      // Update timestamps and reset count
      this.alertTimestamps.set(alertId, now);
      this.alertCounts.set(alertId, 0);

      // Send notifications
      await this.sendNotifications(rateLimitAlert);

      // Emit alert
      this.emit('alert', rateLimitAlert);
    } catch (error) {
      logger.error('Failed to handle rate limit alert:', error);
      await this.errorHandlingService.handleError(error instanceof Error ? error : new Error(String(error)), {
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.HIGH,
        source: 'RateLimitAlertingService'
      });
    }
  }

  private generateAlertId(alert: any): string {
    const base = `${alert.type}:${alert.details.identifier || 'global'}:${alert.details.tier || 'default'}`;
    return `${base}:${Date.now()}`;
  }

  private determineSeverity(alert: any): RateLimitAlert['severity'] {
    const value = alert.details.value || 0;
    const threshold = alert.details.threshold || 0;
    const ratio = value / threshold;

    if (ratio >= 2) return 'critical';
    if (ratio >= 1.5) return 'error';
    return 'warning';
  }

  private async storeAlert(alert: RateLimitAlert): Promise<void> {
    try {
      const key = `ratelimit:alert:${alert.id}`;
      await this.redis.set(key, JSON.stringify(alert), this.config.alertRetentionPeriod / 1000);
    } catch (error) {
      logger.error('Failed to store alert:', error);
    }
  }

  private async sendNotifications(alert: RateLimitAlert): Promise<void> {
    try {
      if (this.config.notificationChannels.email) {
        await this.sendEmailNotification(alert);
      }

      if (this.config.notificationChannels.slack) {
        await this.sendSlackNotification(alert);
      }

      if (this.config.notificationChannels.webhook) {
        await this.sendWebhookNotification(alert);
      }
    } catch (error) {
      logger.error('Failed to send notifications:', error);
    }
  }

  private async sendEmailNotification(alert: RateLimitAlert): Promise<void> {
    // TODO: Implement email notification
    logger.info('Sending email notification:', alert);
  }

  private async sendSlackNotification(alert: RateLimitAlert): Promise<void> {
    // TODO: Implement Slack notification
    logger.info('Sending Slack notification:', alert);
  }

  private async sendWebhookNotification(alert: RateLimitAlert): Promise<void> {
    // TODO: Implement webhook notification
    logger.info('Sending webhook notification:', alert);
  }

  private async cleanupOldAlerts(): Promise<void> {
    try {
      const cutoffTime = Date.now() - this.config.alertRetentionPeriod;
      for (const [id, alert] of this.alerts.entries()) {
        if (alert.createdAt.getTime() < cutoffTime) {
          this.alerts.delete(id);
          this.alertCounts.delete(id);
          this.alertTimestamps.delete(id);
          await this.redis.del(`ratelimit:alert:${id}`);
        }
      }
    } catch (error) {
      logger.error('Failed to cleanup old alerts:', error);
    }
  }

  public async acknowledgeAlert(alertId: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = 'acknowledged';
      alert.updatedAt = new Date();
      await this.storeAlert(alert);
      this.emit('alertUpdated', alert);
    }
  }

  public async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = 'resolved';
      alert.updatedAt = new Date();
      await this.storeAlert(alert);
      this.emit('alertUpdated', alert);
    }
  }

  public getAlerts(): RateLimitAlert[] {
    return Array.from(this.alerts.values());
  }

  public getActiveAlerts(): RateLimitAlert[] {
    return this.getAlerts().filter(alert => alert.status === 'active');
  }

  public async stop(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
} 
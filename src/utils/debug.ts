import { developmentConfig } from '../config/development';
import { logger } from './logger';

interface ExtendedXMLHttpRequest extends XMLHttpRequest {
  _url?: string;
  _method?: string;
  _startTime?: number;
}

class DebugUtils {
  private static instance: DebugUtils;
  private networkRequests: Array<{
    url: string;
    method: string;
    startTime: number;
    endTime?: number;
    status?: number;
  }> = [];

  private constructor() {
    if (developmentConfig.network.logging) {
      this.setupNetworkLogging();
    }
  }

  public static getInstance(): DebugUtils {
    if (!DebugUtils.instance) {
      DebugUtils.instance = new DebugUtils();
    }
    return DebugUtils.instance;
  }

  private setupNetworkLogging(): void {
    if (typeof XMLHttpRequest !== 'undefined') {
      const originalXHR = XMLHttpRequest.prototype as unknown as ExtendedXMLHttpRequest;
      const originalOpen = originalXHR.open;
      const originalSend = originalXHR.send;

      originalXHR.open = function (method: string, url: string) {
        this._url = url;
        this._method = method;
        this._startTime = Date.now();
        return originalOpen.apply(this, arguments as any);
      };

      originalXHR.send = function () {
        this.addEventListener('load', () => {
          const endTime = Date.now();
          const duration = endTime - (this._startTime || 0);
          
          DebugUtils.instance.networkRequests.push({
            url: this._url || '',
            method: this._method || '',
            startTime: this._startTime || 0,
            endTime,
            status: this.status,
          });

          logger.debug('Network Request', {
            url: this._url,
            method: this._method,
            status: this.status,
            duration,
          });
        });

        return originalSend.apply(this, arguments as any);
      };
    }
  }

  public getNetworkRequests(): Array<{
    url: string;
    method: string;
    startTime: number;
    endTime?: number;
    status?: number;
  }> {
    return this.networkRequests;
  }

  public clearNetworkRequests(): void {
    this.networkRequests = [];
  }

  public enablePerformanceMonitoring(): void {
    if (developmentConfig.performance.monitoring) {
      // TODO: Implement performance monitoring
      logger.info('Performance monitoring enabled');
    }
  }

  public enableReduxDevTools(): void {
    if (developmentConfig.redux.devTools) {
      // TODO: Configure Redux DevTools
      logger.info('Redux DevTools enabled');
    }
  }
}

export const debugUtils = DebugUtils.getInstance(); 
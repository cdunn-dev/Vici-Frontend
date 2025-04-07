type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
  message: string;
  data?: any;
  timestamp: string;
  level: LogLevel;
}

class Logger {
  private static instance: Logger;
  private logs: LogMessage[] = [];

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): LogMessage {
    return {
      message,
      data,
      timestamp: new Date().toISOString(),
      level,
    };
  }

  public debug(message: string, data?: any): void {
    const logMessage = this.formatMessage('debug', message, data);
    this.logs.push(logMessage);
    console.debug(`[DEBUG] ${message}`, data);
  }

  public info(message: string, data?: any): void {
    const logMessage = this.formatMessage('info', message, data);
    this.logs.push(logMessage);
    console.info(`[INFO] ${message}`, data);
  }

  public warn(message: string, data?: any): void {
    const logMessage = this.formatMessage('warn', message, data);
    this.logs.push(logMessage);
    console.warn(`[WARN] ${message}`, data);
  }

  public error(message: string, data?: any): void {
    const logMessage = this.formatMessage('error', message, data);
    this.logs.push(logMessage);
    console.error(`[ERROR] ${message}`, data);
  }

  public getLogs(): LogMessage[] {
    return this.logs;
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

export const logger = Logger.getInstance(); 
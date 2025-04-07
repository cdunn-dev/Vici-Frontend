import { env } from './env';

export interface DevelopmentConfig {
  debugger: {
    enabled: boolean;
    port: number;
    host: string;
  };
  network: {
    logging: boolean;
    inspector: boolean;
    throttling: boolean;
  };
  redux: {
    devTools: boolean;
    monitor: boolean;
  };
  performance: {
    monitoring: boolean;
    profiling: boolean;
  };
}

export const developmentConfig: DevelopmentConfig = {
  debugger: {
    enabled: env.ENV !== 'production',
    port: 8081,
    host: 'localhost',
  },
  network: {
    logging: env.ENV !== 'production',
    inspector: env.ENV !== 'production',
    throttling: env.ENV === 'development',
  },
  redux: {
    devTools: env.ENV !== 'production',
    monitor: env.ENV === 'development',
  },
  performance: {
    monitoring: env.ENV !== 'production',
    profiling: env.ENV === 'development',
  },
}; 
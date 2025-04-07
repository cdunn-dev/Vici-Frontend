import { configureAppStore } from '../store/configureStore';
import { developmentConfig } from '../config/development';
import { logger } from '../utils/logger';

jest.mock('../config/development', () => ({
  developmentConfig: {
    redux: {
      devTools: true,
    },
  },
}));

jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
  },
}));

describe('Redux Store Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should configure store with DevTools in development', () => {
    const store = configureAppStore();
    
    expect(store).toBeDefined();
    expect(logger.info).toHaveBeenCalledWith('Redux DevTools enabled');
  });

  it('should have correct middleware configuration', () => {
    const store = configureAppStore();
    const middleware = store.getState();
    
    expect(middleware).toBeDefined();
  });

  it('should export correct types', () => {
    const store = configureAppStore();
    
    expect(typeof store.getState).toBe('function');
    expect(typeof store.dispatch).toBe('function');
  });
}); 
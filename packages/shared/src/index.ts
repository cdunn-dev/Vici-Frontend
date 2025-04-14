// Export components
export * from './components';

// Export hooks
export * from './hooks';

// Export services
export * from './services';

// Export types
export * from './types';

// Export utils - resolve isNumber ambiguity
import * as utils from './utils';
export { utils };

// Export theme - resolve Theme ambiguity
import * as themeExports from './theme';
export { themeExports };

// Export store - fix store not being a module
// export * from './store';

// Format utilities are already exported through utils
// export * from './utils/format';

export const add = (a: number, b: number): number => {
  return a + b;
}; 
// Theme definition for the application
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    error: string;
    warning: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      displayLarge: number;
      displayMedium: number;
      displaySmall: number;
      bodyLarge: number;
      bodyMedium: number;
      bodySmall: number;
      label: number;
    };
  };
}

// Default theme configuration
export const defaultTheme: Theme = {
  colors: {
    primary: '#5224EF',
    secondary: '#4318C9',
    accent: '#E0D8FD',
    success: '#16A34A',
    error: '#DC2626',
    warning: '#F59E0B',
    background: '#F9FAFB',
    text: '#11182C',
  },
  typography: {
    fontFamily: 'Inter',
    fontSize: {
      displayLarge: 24,
      displayMedium: 20,
      displaySmall: 18,
      bodyLarge: 16,
      bodyMedium: 14,
      bodySmall: 12,
      label: 12,
    },
  },
};

// Simple function to merge themes
export const mergeTheme = (theme?: Partial<Theme>): Theme => {
  if (!theme) return defaultTheme;
  
  return {
    ...defaultTheme,
    ...theme,
    colors: {
      ...defaultTheme.colors,
      ...theme?.colors,
    },
    typography: {
      ...defaultTheme.typography,
      ...theme?.typography,
    },
  };
}; 
// Theme definition for the application
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    background: string;
    backgroundSecondary: string;
    text: string;
    white: string;
    textSecondary: string;
    border: string;
    shadow: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      displayLarge: number;
      displayMedium: number;
      displaySmall: number;
      headingLarge: number;
      headingMedium: number;
      headingSmall: number;
      bodyLarge: number;
      bodyMedium: number;
      bodySmall: number;
      label: number;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
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
    info: '#3B82F6',
    background: '#F9FAFB',
    backgroundSecondary: '#F3F4F6',
    text: '#11182C',
    white: '#FFFFFF',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  typography: {
    fontFamily: 'Inter',
    fontSize: {
      displayLarge: 24,
      displayMedium: 20,
      displaySmall: 18,
      headingLarge: 22,
      headingMedium: 18,
      headingSmall: 16,
      bodyLarge: 16,
      bodyMedium: 14,
      bodySmall: 12,
      label: 12,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
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
    spacing: {
      ...defaultTheme.spacing,
      ...theme?.spacing,
    },
    borderRadius: {
      ...defaultTheme.borderRadius,
      ...theme?.borderRadius,
    },
  };
}; 
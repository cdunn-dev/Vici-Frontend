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
    textSecondary: string;
    border: string;
    backgroundAlt: string;
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
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
} 
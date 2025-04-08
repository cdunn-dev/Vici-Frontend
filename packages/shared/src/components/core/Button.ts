export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  width?: string;
  type?: 'button' | 'submit' | 'reset';
}

// This is a stub component for now
export const Button = (props: ButtonProps) => {
  return null;
}; 
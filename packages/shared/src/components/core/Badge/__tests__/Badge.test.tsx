import React from 'react';
import { render } from '@testing-library/react-native';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders correctly with default props', () => {
    const { getByTestId } = render(<Badge>1</Badge>);
    expect(getByTestId('badge')).toBeTruthy();
    expect(getByTestId('badge-text')).toBeTruthy();
  });

  it('renders text content correctly', () => {
    const { getByText } = render(<Badge>New</Badge>);
    expect(getByText('New')).toBeTruthy();
  });

  it('renders as a dot when dot prop is true', () => {
    const { queryByTestId } = render(<Badge dot>1</Badge>);
    expect(queryByTestId('badge-text')).toBeNull();
  });

  it('applies variant styles correctly', () => {
    const variants: ('primary' | 'success' | 'warning' | 'error' | 'info')[] = [
      'primary',
      'success',
      'warning',
      'error',
      'info',
    ];

    variants.forEach((variant) => {
      const { getByTestId } = render(<Badge variant={variant}>1</Badge>);
      const badge = getByTestId('badge');
      
      // Check if the badge has the correct background color
      const variantColors = {
        primary: '#5224EF',
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#DC2626',
        info: '#3B82F6',
      };
      
      expect(badge.props.style).toContainEqual(
        expect.objectContaining({
          backgroundColor: variantColors[variant],
        })
      );
    });
  });

  it('applies size styles correctly', () => {
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
    const sizeStyles = {
      small: { padding: 4, fontSize: 10 },
      medium: { padding: 6, fontSize: 12 },
      large: { padding: 8, fontSize: 14 },
    };

    sizes.forEach((size) => {
      const { getByTestId } = render(<Badge size={size}>1</Badge>);
      const badge = getByTestId('badge');
      const text = getByTestId('badge-text');
      
      expect(badge.props.style).toContainEqual(
        expect.objectContaining({
          paddingVertical: sizeStyles[size].padding,
          paddingHorizontal: sizeStyles[size].padding * 2,
        })
      );
      
      expect(text.props.style).toContainEqual(
        expect.objectContaining({
          fontSize: sizeStyles[size].fontSize,
        })
      );
    });
  });

  it('applies outlined styles correctly', () => {
    const { getByTestId } = render(<Badge outlined>1</Badge>);
    const badge = getByTestId('badge');
    const text = getByTestId('badge-text');
    
    expect(badge.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: 'transparent',
        borderWidth: 1,
      })
    );
    
    expect(text.props.style).toContainEqual(
      expect.objectContaining({
        color: '#5224EF', // primary color for outlined variant
      })
    );
  });

  it('applies custom styles', () => {
    const customStyle = { margin: 10 };
    const customTextStyle = { letterSpacing: 1 };
    
    const { getByTestId } = render(
      <Badge style={customStyle} textStyle={customTextStyle}>
        1
      </Badge>
    );
    
    const badge = getByTestId('badge');
    const text = getByTestId('badge-text');
    
    expect(badge.props.style).toContainEqual(customStyle);
    expect(text.props.style).toContainEqual(customTextStyle);
  });

  it('handles empty or null children', () => {
    const { queryByTestId } = render(<Badge />);
    expect(queryByTestId('badge-text')).toBeNull();
  });
}); 
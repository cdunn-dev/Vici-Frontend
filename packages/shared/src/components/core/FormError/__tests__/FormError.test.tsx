import React from 'react';
import { render } from '@testing-library/react-native';
import { FormError } from '../FormError';
import { useTheme } from "@/theme/useTheme";

jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('FormError', () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({
      colors: {
        error: '#FF0000',
      },
    });
  });

  it('renders correctly with error message', () => {
    const { getByText, getByTestId } = render(
      <FormError error="Test Error" testID="form-error" />
    );
    expect(getByTestId('form-error')).toBeTruthy();
    expect(getByText('Test Error')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const { getByTestId } = render(
      <FormError
        error="Test Error"
        style={{ marginTop: 10 }}
        testID="form-error"
      />
    );
    const component = getByTestId('form-error');
    expect(component.props.style).toContainEqual({ marginTop: 10 });
  });
}); 
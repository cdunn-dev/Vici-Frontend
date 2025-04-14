import React from 'react';
import { render } from '@testing-library/react-native';
import { FormLabel } from '../FormLabel';
import { useTheme } from "@/theme/useTheme";

jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('FormLabel', () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({
      colors: {
        text: '#000000',
        error: '#FF0000',
      },
    });
  });

  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <FormLabel label="Test Label" testID="form-label" />
    );
    expect(getByTestId('form-label')).toBeTruthy();
  });

  it('renders with required indicator', () => {
    const { getByText } = render(
      <FormLabel label="Test Label" required />
    );
    expect(getByText('*')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const { getByTestId } = render(
      <FormLabel
        label="Test Label"
        style={{ marginTop: 10 }}
        testID="form-label"
      />
    );
    const component = getByTestId('form-label');
    expect(component.props.style).toContainEqual({ marginTop: 10 });
  });
}); 
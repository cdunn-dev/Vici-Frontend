import React from 'react';
import { render } from '@testing-library/react-native';
import { FormHelperText } from '../FormHelperText';
import { useTheme } from "@/theme/useTheme";

jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('FormHelperText', () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({
      colors: {
        text: '#000000',
      },
    });
  });

  it('renders correctly with helper text', () => {
    const { getByText, getByTestId } = render(
      <FormHelperText text="Test Helper" testID="form-helper-text" />
    );
    expect(getByTestId('form-helper-text')).toBeTruthy();
    expect(getByText('Test Helper')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const { getByTestId } = render(
      <FormHelperText
        text="Test Helper"
        style={{ marginTop: 10 }}
        testID="form-helper-text"
      />
    );
    const component = getByTestId('form-helper-text');
    expect(component.props.style).toContainEqual({ marginTop: 10 });
  });
}); 
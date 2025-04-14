import React from 'react';
import { render } from '@testing-library/react-native';
import { FormField } from '../FormField';
import { useTheme } from "@/theme/useTheme";

jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('FormField', () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({
      colors: {
        text: '#000000',
        error: '#FF0000',
        secondary: '#666666',
      },
    });
  });

  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <FormField testID="form-field">
        <></>
      </FormField>
    );
    expect(getByTestId('form-field')).toBeTruthy();
  });

  it('renders with label', () => {
    const { getByText } = render(
      <FormField label="Test Label">
        <></>
      </FormField>
    );
    expect(getByText('Test Label')).toBeTruthy();
  });

  it('renders with required indicator', () => {
    const { getByText } = render(
      <FormField label="Test Label" required>
        <></>
      </FormField>
    );
    expect(getByText('*')).toBeTruthy();
  });

  it('renders with error message', () => {
    const { getByText } = render(
      <FormField error="Test Error">
        <></>
      </FormField>
    );
    expect(getByText('Test Error')).toBeTruthy();
  });

  it('renders with helper text', () => {
    const { getByText } = render(
      <FormField helperText="Test Helper">
        <></>
      </FormField>
    );
    expect(getByText('Test Helper')).toBeTruthy();
  });

  it('renders children correctly', () => {
    const { getByTestId } = render(
      <FormField>
        <View testID="child-component" />
      </FormField>
    );
    expect(getByTestId('child-component')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const { getByTestId } = render(
      <FormField style={{ marginTop: 10 }} testID="form-field">
        <></>
      </FormField>
    );
    const component = getByTestId('form-field');
    expect(component.props.style).toContainEqual({ marginTop: 10 });
  });
}); 
import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import { FormGroup } from '../FormGroup';
import { useTheme } from '../../../../hooks/useTheme';

jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('FormGroup', () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({
      colors: {
        text: '#000000',
      },
    });
  });

  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <FormGroup testID="form-group">
        <></>
      </FormGroup>
    );
    expect(getByTestId('form-group')).toBeTruthy();
  });

  it('renders with label', () => {
    const { getByText } = render(
      <FormGroup label="Test Group">
        <></>
      </FormGroup>
    );
    expect(getByText('Test Group')).toBeTruthy();
  });

  it('renders children correctly', () => {
    const { getByTestId } = render(
      <FormGroup>
        <View testID="child-component" />
      </FormGroup>
    );
    expect(getByTestId('child-component')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const { getByTestId } = render(
      <FormGroup style={{ marginTop: 10 }} testID="form-group">
        <></>
      </FormGroup>
    );
    const component = getByTestId('form-group');
    expect(component.props.style).toContainEqual({ marginTop: 10 });
  });
}); 
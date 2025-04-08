import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import { Container } from '../Container';
import { useTheme } from '../../../../hooks/useTheme';

jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('Container', () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({
      colors: {
        background: '#FFFFFF',
      },
    });
  });

  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <Container testID="container">
        <></>
      </Container>
    );
    expect(getByTestId('container')).toBeTruthy();
  });

  it('renders with custom maxWidth', () => {
    const { getByTestId } = render(
      <Container maxWidth={800} testID="container">
        <></>
      </Container>
    );
    const component = getByTestId('container');
    expect(component.props.style).toContainEqual({ maxWidth: 800 });
  });

  it('renders with custom padding', () => {
    const { getByTestId } = render(
      <Container padding={24} testID="container">
        <></>
      </Container>
    );
    const component = getByTestId('container');
    expect(component.props.style).toContainEqual({ padding: 24 });
  });

  it('renders children correctly', () => {
    const { getByTestId } = render(
      <Container>
        <View testID="child-component" />
      </Container>
    );
    expect(getByTestId('child-component')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const { getByTestId } = render(
      <Container style={{ marginTop: 10 }} testID="container">
        <></>
      </Container>
    );
    const component = getByTestId('container');
    expect(component.props.style).toContainEqual({ marginTop: 10 });
  });
}); 
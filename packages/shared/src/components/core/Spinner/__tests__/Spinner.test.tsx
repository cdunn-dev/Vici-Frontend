import React from 'react';
import { render } from '@testing-library/react-native';
import { Spinner } from '../Spinner';

// Mock the useTheme hook
jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#5224EF',
    },
  }),
}));

describe('Spinner', () => {
  it('renders correctly with default props', () => {
    const { getByTestId } = render(<Spinner />);
    const spinner = getByTestId('spinner');
    const indicator = getByTestId('spinner-indicator');
    expect(spinner).toBeTruthy();
    expect(indicator).toBeTruthy();
  });

  it('renders with custom size', () => {
    const { getByTestId } = render(<Spinner size="large" />);
    const indicator = getByTestId('spinner-indicator');
    expect(indicator.props.size).toBe(48);
  });

  it('renders with custom numeric size', () => {
    const { getByTestId } = render(<Spinner size={100} />);
    const indicator = getByTestId('spinner-indicator');
    expect(indicator.props.size).toBe(100);
  });

  it('renders with custom color', () => {
    const { getByTestId } = render(<Spinner color="#FF0000" />);
    const indicator = getByTestId('spinner-indicator');
    expect(indicator.props.color).toBe('#FF0000');
  });

  it('uses theme color when no color is provided', () => {
    const { getByTestId } = render(<Spinner />);
    const indicator = getByTestId('spinner-indicator');
    expect(indicator.props.color).toBe('#5224EF');
  });

  it('renders with custom style', () => {
    const customStyle = { marginTop: 10 };
    const { getByTestId } = render(<Spinner style={customStyle} />);
    const spinner = getByTestId('spinner');
    expect(spinner.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining(customStyle)])
    );
  });

  it('renders with custom testID', () => {
    const { getByTestId } = render(<Spinner testID="custom-spinner" />);
    const spinner = getByTestId('custom-spinner');
    const indicator = getByTestId('custom-spinner-indicator');
    expect(spinner).toBeTruthy();
    expect(indicator).toBeTruthy();
  });
}); 
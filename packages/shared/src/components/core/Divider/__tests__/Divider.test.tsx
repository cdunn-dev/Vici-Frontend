import React from 'react';
import { render } from '@testing-library/react-native';
import { Divider } from '../Divider';
import { useTheme } from '../../../../hooks/useTheme';

jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('Divider', () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({
      colors: {
        border: '#E5E7EB',
      },
    });
  });

  it('renders correctly with default props', () => {
    const { getByTestId } = render(<Divider testID="divider" />);
    expect(getByTestId('divider')).toBeTruthy();
  });

  it('renders with custom color', () => {
    const { getByTestId } = render(
      <Divider color="#FF0000" testID="divider" />
    );
    const component = getByTestId('divider');
    expect(component.props.style).toContainEqual({ backgroundColor: '#FF0000' });
  });

  it('renders with custom thickness', () => {
    const { getByTestId } = render(
      <Divider thickness={2} testID="divider" />
    );
    const component = getByTestId('divider');
    expect(component.props.style).toContainEqual({ height: 2 });
  });

  it('renders with custom margin', () => {
    const { getByTestId } = render(
      <Divider margin={24} testID="divider" />
    );
    const component = getByTestId('divider');
    expect(component.props.style).toContainEqual({ marginVertical: 24 });
  });

  it('applies custom styles', () => {
    const { getByTestId } = render(
      <Divider style={{ marginTop: 10 }} testID="divider" />
    );
    const component = getByTestId('divider');
    expect(component.props.style).toContainEqual({ marginTop: 10 });
  });
}); 
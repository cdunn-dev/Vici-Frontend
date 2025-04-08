import React from 'react';
import { render } from '@testing-library/react-native';
import { Icon } from '../Icon';

// Mock the useTheme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#11182C',
    },
  }),
}));

describe('Icon', () => {
  it('renders correctly with default props', () => {
    const { getByTestId } = render(<Icon name="home" />);
    const icon = getByTestId('icon');
    expect(icon).toBeTruthy();
  });

  it('renders with custom size', () => {
    const { getByTestId } = render(<Icon name="home" size={32} />);
    const icon = getByTestId('icon');
    expect(icon.props.style).toEqual(
      expect.objectContaining({
        fontSize: 32,
      })
    );
  });

  it('renders with custom color', () => {
    const { getByTestId } = render(<Icon name="home" color="#FF0000" />);
    const icon = getByTestId('icon');
    expect(icon.props.style).toEqual(
      expect.objectContaining({
        color: '#FF0000',
      })
    );
  });

  it('renders with material-community family', () => {
    const { getByTestId } = render(
      <Icon name="home" family="material-community" />
    );
    const icon = getByTestId('icon');
    expect(icon).toBeTruthy();
  });

  it('renders with font-awesome family', () => {
    const { getByTestId } = render(
      <Icon name="home" family="font-awesome" />
    );
    const icon = getByTestId('icon');
    expect(icon).toBeTruthy();
  });

  it('renders with ionicons family', () => {
    const { getByTestId } = render(
      <Icon name="home" family="ionicons" />
    );
    const icon = getByTestId('icon');
    expect(icon).toBeTruthy();
  });

  it('applies custom styles', () => {
    const customStyle = { margin: 10 };
    const { getByTestId } = render(
      <Icon name="home" style={customStyle} />
    );
    const icon = getByTestId('icon');
    expect(icon.props.style).toEqual(
      expect.objectContaining(customStyle)
    );
  });

  it('applies custom icon styles', () => {
    const customIconStyle = { opacity: 0.5 };
    const { getByTestId } = render(
      <Icon name="home" iconStyle={customIconStyle} />
    );
    const icon = getByTestId('icon');
    expect(icon.props.style).toEqual(
      expect.objectContaining(customIconStyle)
    );
  });

  it('uses theme text color when no color prop is provided', () => {
    const { getByTestId } = render(<Icon name="home" />);
    const icon = getByTestId('icon');
    expect(icon.props.style).toEqual(
      expect.objectContaining({
        color: '#11182C',
      })
    );
  });
}); 
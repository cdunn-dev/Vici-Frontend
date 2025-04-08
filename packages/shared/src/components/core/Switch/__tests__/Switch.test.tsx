import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Switch } from '../Switch';

// Mock the useTheme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#5224EF',
      text: '#11182C',
      background: '#FFFFFF',
    },
  }),
}));

describe('Switch', () => {
  const onValueChange = jest.fn();

  beforeEach(() => {
    onValueChange.mockClear();
  });

  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <Switch value={false} onValueChange={onValueChange} />
    );
    const switchComponent = getByTestId('switch');
    expect(switchComponent).toBeTruthy();
  });

  it('renders in on state', () => {
    const { getByTestId } = render(
      <Switch value={true} onValueChange={onValueChange} />
    );
    const switchComponent = getByTestId('switch');
    expect(switchComponent).toBeTruthy();
  });

  it('calls onValueChange when pressed', () => {
    const { getByTestId } = render(
      <Switch value={false} onValueChange={onValueChange} />
    );
    const switchComponent = getByTestId('switch');
    fireEvent.press(switchComponent);
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('does not call onValueChange when disabled', () => {
    const { getByTestId } = render(
      <Switch value={false} onValueChange={onValueChange} disabled />
    );
    const switchComponent = getByTestId('switch');
    fireEvent.press(switchComponent);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('renders with different sizes', () => {
    const { getByTestId } = render(
      <Switch value={false} onValueChange={onValueChange} size="small" />
    );
    const switchComponent = getByTestId('switch');
    expect(switchComponent).toBeTruthy();
  });

  it('applies custom styles', () => {
    const customStyle = { margin: 10 };
    const { getByTestId } = render(
      <Switch
        value={false}
        onValueChange={onValueChange}
        style={customStyle}
      />
    );
    const switchComponent = getByTestId('switch');
    expect(switchComponent.props.style).toEqual(
      expect.objectContaining(customStyle)
    );
  });

  it('toggles between states correctly', () => {
    const { getByTestId, rerender } = render(
      <Switch value={false} onValueChange={onValueChange} />
    );
    const switchComponent = getByTestId('switch');
    
    // Toggle on
    fireEvent.press(switchComponent);
    expect(onValueChange).toHaveBeenCalledWith(true);
    
    // Rerender with new value
    rerender(<Switch value={true} onValueChange={onValueChange} />);
    
    // Toggle off
    fireEvent.press(switchComponent);
    expect(onValueChange).toHaveBeenCalledWith(false);
  });
}); 
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Slider } from '../Slider';

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

describe('Slider', () => {
  const onValueChange = jest.fn();

  beforeEach(() => {
    onValueChange.mockClear();
  });

  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <Slider value={50} onValueChange={onValueChange} />
    );
    const slider = getByTestId('slider');
    expect(slider).toBeTruthy();
  });

  it('renders with custom min and max values', () => {
    const { getByTestId } = render(
      <Slider value={5} min={0} max={10} onValueChange={onValueChange} />
    );
    const slider = getByTestId('slider');
    expect(slider).toBeTruthy();
  });

  it('renders with step value', () => {
    const { getByTestId } = render(
      <Slider value={5} step={5} onValueChange={onValueChange} />
    );
    const slider = getByTestId('slider');
    expect(slider).toBeTruthy();
  });

  it('hides value label when showValue is false', () => {
    const { queryByText } = render(
      <Slider value={50} showValue={false} onValueChange={onValueChange} />
    );
    expect(queryByText('50')).toBeNull();
  });

  it('renders in disabled state', () => {
    const { getByTestId } = render(
      <Slider value={50} disabled onValueChange={onValueChange} />
    );
    const slider = getByTestId('slider');
    expect(slider).toBeTruthy();
  });

  it('applies custom styles', () => {
    const customStyle = { margin: 10 };
    const { getByTestId } = render(
      <Slider
        value={50}
        onValueChange={onValueChange}
        style={customStyle}
      />
    );
    const slider = getByTestId('slider');
    expect(slider.props.style).toEqual(
      expect.objectContaining(customStyle)
    );
  });

  it('updates value when thumb is moved', () => {
    const { getByTestId } = render(
      <Slider value={50} onValueChange={onValueChange} />
    );
    const slider = getByTestId('slider');
    fireEvent(slider, 'layout', {
      nativeEvent: { layout: { width: 300 } },
    });
    fireEvent(slider, 'responderGrant', {
      touchHistory: { touchBank: [] },
    });
    fireEvent(slider, 'responderMove', {
      touchHistory: { touchBank: [] },
      moveX: 150,
    });
    expect(onValueChange).toHaveBeenCalled();
  });

  it('does not update value when disabled', () => {
    const { getByTestId } = render(
      <Slider value={50} disabled onValueChange={onValueChange} />
    );
    const slider = getByTestId('slider');
    fireEvent(slider, 'layout', {
      nativeEvent: { layout: { width: 300 } },
    });
    fireEvent(slider, 'responderGrant', {
      touchHistory: { touchBank: [] },
    });
    fireEvent(slider, 'responderMove', {
      touchHistory: { touchBank: [] },
      moveX: 150,
    });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('respects step value when updating', () => {
    const { getByTestId } = render(
      <Slider value={0} step={10} onValueChange={onValueChange} />
    );
    const slider = getByTestId('slider');
    fireEvent(slider, 'layout', {
      nativeEvent: { layout: { width: 300 } },
    });
    fireEvent(slider, 'responderGrant', {
      touchHistory: { touchBank: [] },
    });
    fireEvent(slider, 'responderMove', {
      touchHistory: { touchBank: [] },
      moveX: 150,
    });
    expect(onValueChange).toHaveBeenCalledWith(50);
  });
}); 
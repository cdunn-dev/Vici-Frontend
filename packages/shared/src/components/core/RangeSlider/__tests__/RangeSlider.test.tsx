import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { RangeSlider } from '../RangeSlider';

// Mock the theme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#5224EF',
      secondary: '#4318C9',
      text: '#11182C',
      background: '#FFFFFF',
      error: '#DC2626',
    },
    typography: {
      fontSize: {
        bodyMedium: 14,
        bodySmall: 12,
      },
    },
  }),
}));

// Mock Animated
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Animated: {
      ...RN.Animated,
      Value: jest.fn((value) => ({
        _value: value,
        setValue: jest.fn(function(newValue) {
          this._value = newValue;
        }),
        getValue: jest.fn(function() {
          return this._value;
        }),
      })),
      subtract: jest.fn((a, b) => a),
      timing: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback()),
      })),
      createAnimatedComponent: jest.fn((component) => component),
      View: RN.View,
    },
    PanResponder: {
      create: jest.fn(() => ({
        panHandlers: {},
      })),
    },
  };
});

describe('RangeSlider Component', () => {
  const defaultProps = {
    min: 0,
    max: 100,
  };

  it('renders with default props', () => {
    const { getByTestId, queryByTestId } = render(
      <RangeSlider {...defaultProps} />
    );
    
    expect(getByTestId('range-slider')).toBeTruthy();
    expect(getByTestId('range-slider-track')).toBeTruthy();
    expect(getByTestId('range-slider-high-thumb')).toBeTruthy();
    // Single slider mode shouldn't have low thumb
    expect(queryByTestId('range-slider-low-thumb')).toBeNull();
  });

  it('renders with a label', () => {
    const { getByTestId, getByText } = render(
      <RangeSlider {...defaultProps} label="Select a value" />
    );
    
    expect(getByTestId('range-slider-label')).toBeTruthy();
    expect(getByText('Select a value')).toBeTruthy();
  });

  it('renders with required indicator', () => {
    const { getByText } = render(
      <RangeSlider {...defaultProps} label="Select a value" required />
    );
    
    expect(getByText('*')).toBeTruthy();
  });

  it('renders with value labels', () => {
    const { getByTestId, queryByTestId } = render(
      <RangeSlider {...defaultProps} value={50} />
    );
    
    expect(getByTestId('range-slider-value-labels')).toBeTruthy();
    expect(getByTestId('range-slider-high-value')).toBeTruthy();
    expect(queryByTestId('range-slider-low-value')).toBeNull(); // Single slider has no low value
  });

  it('renders as a range slider', () => {
    const { getByTestId } = render(
      <RangeSlider {...defaultProps} range value={[25, 75]} />
    );
    
    expect(getByTestId('range-slider-low-thumb')).toBeTruthy();
    expect(getByTestId('range-slider-high-thumb')).toBeTruthy();
    expect(getByTestId('range-slider-low-value')).toBeTruthy();
    expect(getByTestId('range-slider-high-value')).toBeTruthy();
  });

  it('renders with custom labels format', () => {
    const formatLabel = (value: number) => `${value}%`;
    const { getByText } = render(
      <RangeSlider {...defaultProps} value={50} formatLabel={formatLabel} />
    );
    
    expect(getByText('50%')).toBeTruthy();
    expect(getByText('0%')).toBeTruthy();
    expect(getByText('100%')).toBeTruthy();
  });

  it('renders with error message', () => {
    const { getByTestId, getByText } = render(
      <RangeSlider {...defaultProps} error="Please select a valid range" />
    );
    
    expect(getByTestId('range-slider-error')).toBeTruthy();
    expect(getByText('Please select a valid range')).toBeTruthy();
  });

  it('renders with helper text', () => {
    const { getByTestId, getByText } = render(
      <RangeSlider {...defaultProps} helperText="Drag to select a value" />
    );
    
    expect(getByTestId('range-slider-helper-text')).toBeTruthy();
    expect(getByText('Drag to select a value')).toBeTruthy();
  });

  it('updates internal value when prop changes', () => {
    const { getByTestId, rerender } = render(
      <RangeSlider {...defaultProps} value={25} />
    );
    
    const initialText = getByTestId('range-slider-high-value').props.children;
    
    rerender(<RangeSlider {...defaultProps} value={75} />);
    
    const updatedText = getByTestId('range-slider-high-value').props.children;
    expect(initialText).toBe('25');
    expect(updatedText).toBe('75');
  });

  it('handles track layout', () => {
    const { getByTestId } = render(
      <RangeSlider {...defaultProps} />
    );
    
    const trackContainer = getByTestId('range-slider-track-container');
    
    // Simulate onLayout event
    act(() => {
      trackContainer.props.onLayout({
        nativeEvent: { layout: { width: 300, height: 20 } }
      });
    });
    
    // The component should now have a track width set
    // Since we're not actually testing the UI update, we just verify it doesn't throw
    expect(trackContainer).toBeTruthy();
  });

  it('applies custom styles', () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId } = render(
      <RangeSlider {...defaultProps} style={customStyle} />
    );
    
    const container = getByTestId('range-slider');
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customStyle)
      ])
    );
  });

  it('hides labels when showLabels is false', () => {
    const { queryByTestId } = render(
      <RangeSlider {...defaultProps} showLabels={false} />
    );
    
    expect(queryByTestId('range-slider-value-labels')).toBeNull();
    expect(queryByTestId('range-slider-min-max-labels')).toBeNull();
  });
}); 
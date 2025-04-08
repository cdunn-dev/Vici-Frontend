import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Tooltip } from '../Tooltip';

// Mock the useTheme hook
jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      background: '#FFFFFF',
      text: '#000000',
    },
  }),
}));

describe('Tooltip', () => {
  const onDismiss = jest.fn();

  beforeEach(() => {
    onDismiss.mockClear();
  });

  it('renders correctly with default props', () => {
    const { getByTestId, getByText } = render(
      <Tooltip
        visible={true}
        content="Test Tooltip"
        onDismiss={onDismiss}
        testID="tooltip"
      />
    );

    expect(getByTestId('tooltip')).toBeTruthy();
    expect(getByText('Test Tooltip')).toBeTruthy();
  });

  it('renders with different positions', () => {
    const positions = ['top', 'bottom', 'left', 'right'] as const;

    positions.forEach((position) => {
      const { getByTestId } = render(
        <Tooltip
          visible={true}
          content="Test Tooltip"
          position={position}
          onDismiss={onDismiss}
          testID={`tooltip-${position}`}
        />
      );

      expect(getByTestId(`tooltip-${position}`)).toBeTruthy();
    });
  });

  it('calls onDismiss when clicked', () => {
    const { getByTestId } = render(
      <Tooltip
        visible={true}
        content="Test Tooltip"
        onDismiss={onDismiss}
        testID="tooltip"
      />
    );

    fireEvent.press(getByTestId('tooltip'));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <Tooltip
        visible={true}
        content="Test Tooltip"
        onDismiss={onDismiss}
        style={customStyle}
        testID="tooltip"
      />
    );

    const tooltip = getByTestId('tooltip');
    expect(tooltip.props.style).toContain(customStyle);
  });

  it('does not render when visible is false', () => {
    const { queryByTestId } = render(
      <Tooltip
        visible={false}
        content="Test Tooltip"
        onDismiss={onDismiss}
        testID="tooltip"
      />
    );

    expect(queryByTestId('tooltip')).toBeNull();
  });
}); 
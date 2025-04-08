import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Dropdown } from '../Dropdown';

// Mock the theme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#5224EF',
      secondary: '#4318C9',
      accent: '#E0D8FD',
      success: '#16A34A',
      error: '#DC2626',
      warning: '#F59E0B',
      background: '#FFFFFF',
      text: '#11182C',
    },
    typography: {
      fontSize: {
        displayLarge: 24,
        displayMedium: 20,
        displaySmall: 18,
        bodyLarge: 16,
        bodyMedium: 14,
        bodySmall: 12,
        label: 12,
      },
    },
  }),
}));

// Mock the Icon component
jest.mock('../../../../components/core/Icon', () => ({
  Icon: ({ name, size, color }: { name: string; size: number; color: string }) => (
    <div data-testid={`icon-${name}`}>
      {name}
    </div>
  ),
}));

// Mock layout measurements
const mockLayout = { x: 0, y: 0, width: 200, height: 40 };
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Dimensions: {
      ...RN.Dimensions,
      get: () => ({ width: 400, height: 800 }),
    },
    TouchableOpacity: ({ children, onPress, style, testID, disabled, ref }: any) => {
      return (
        <div
          onClick={!disabled ? onPress : undefined}
          data-testid={testID}
          style={style}
          ref={(el: any) => {
            if (ref && el) {
              ref.current = {
                measure: (callback: any) => {
                  callback(0, 0, mockLayout.width, mockLayout.height, mockLayout.x, mockLayout.y);
                },
              };
            }
          }}
        >
          {children}
        </div>
      );
    },
    Modal: ({ children, visible }: any) => (
      visible ? <div data-testid="modal">{children}</div> : null
    ),
    Animated: {
      ...RN.Animated,
      View: ({ children, style }: any) => (
        <div style={style} data-testid="animated-view">
          {children}
        </div>
      ),
      timing: () => ({
        start: (callback?: () => void) => callback && callback(),
      }),
      Value: jest.fn(() => ({
        interpolate: jest.fn(),
      })),
    }
  };
});

describe('Dropdown Component', () => {
  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
  ];

  it('renders with default props', () => {
    const { getByTestId, getByText } = render(
      <Dropdown options={options} />
    );

    expect(getByTestId('dropdown')).toBeTruthy();
    expect(getByText('Select an option')).toBeTruthy();
    expect(getByTestId('icon-chevron-down')).toBeTruthy();
  });

  it('renders with label and placeholder', () => {
    const { getByText } = render(
      <Dropdown 
        options={options} 
        label="Test Label" 
        placeholder="Select something"
      />
    );

    expect(getByText('Test Label')).toBeTruthy();
    expect(getByText('Select something')).toBeTruthy();
  });

  it('renders with a selected value', () => {
    const { getByText } = render(
      <Dropdown options={options} value="2" />
    );

    expect(getByText('Option 2')).toBeTruthy();
  });

  it('renders with error message', () => {
    const { getByText } = render(
      <Dropdown options={options} error="This field is required" />
    );

    expect(getByText('This field is required')).toBeTruthy();
  });

  it('renders with helper text', () => {
    const { getByText } = render(
      <Dropdown options={options} helperText="Select your preferred option" />
    );

    expect(getByText('Select your preferred option')).toBeTruthy();
  });

  it('shows dropdown menu when clicked', () => {
    const { getByTestId, queryByTestId } = render(
      <Dropdown options={options} />
    );

    expect(queryByTestId('modal')).toBeNull();
    
    fireEvent.press(getByTestId('dropdown-button'));
    
    expect(getByTestId('modal')).toBeTruthy();
    expect(getByTestId('dropdown-menu')).toBeTruthy();
  });

  it('does not open when disabled', () => {
    const { getByTestId, queryByTestId } = render(
      <Dropdown options={options} disabled />
    );

    fireEvent.press(getByTestId('dropdown-button'));
    
    expect(queryByTestId('modal')).toBeNull();
  });

  it('calls onValueChange when an option is selected', () => {
    const onValueChange = jest.fn();
    const { getByTestId, getByText } = render(
      <Dropdown options={options} onValueChange={onValueChange} />
    );

    fireEvent.press(getByTestId('dropdown-button'));
    fireEvent.press(getByTestId('dropdown-option-2'));
    
    expect(onValueChange).toHaveBeenCalledWith('2');
  });

  it('handles options with icons', () => {
    const optionsWithIcons = [
      { label: 'Option 1', value: '1', icon: 'star' },
      { label: 'Option 2', value: '2', icon: 'heart' },
    ];

    const { getByTestId } = render(
      <Dropdown options={optionsWithIcons} />
    );

    fireEvent.press(getByTestId('dropdown-button'));
    
    expect(getByTestId('icon-star')).toBeTruthy();
    expect(getByTestId('icon-heart')).toBeTruthy();
  });

  it('should not select disabled options', () => {
    const disabledOptions = [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2', disabled: true },
    ];
    
    const onValueChange = jest.fn();
    const { getByTestId } = render(
      <Dropdown options={disabledOptions} onValueChange={onValueChange} />
    );

    fireEvent.press(getByTestId('dropdown-button'));
    fireEvent.press(getByTestId('dropdown-option-2'));
    
    expect(onValueChange).not.toHaveBeenCalled();
  });
}); 
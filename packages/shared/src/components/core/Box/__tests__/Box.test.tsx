import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import { Box } from '../Box';
import { useTheme } from "@/theme/useTheme";

jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('Box', () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({
      colors: {
        background: '#FFFFFF',
      },
    });
  });

  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <Box testID="box">
        <></>
      </Box>
    );
    expect(getByTestId('box')).toBeTruthy();
  });

  it('renders with custom padding', () => {
    const { getByTestId } = render(
      <Box padding={16} testID="box">
        <></>
      </Box>
    );
    const component = getByTestId('box');
    expect(component.props.style).toContainEqual({ padding: 16 });
  });

  it('renders with custom margin', () => {
    const { getByTestId } = render(
      <Box margin={16} testID="box">
        <></>
      </Box>
    );
    const component = getByTestId('box');
    expect(component.props.style).toContainEqual({ margin: 16 });
  });

  it('renders with custom width', () => {
    const { getByTestId } = render(
      <Box width={200} testID="box">
        <></>
      </Box>
    );
    const component = getByTestId('box');
    expect(component.props.style).toContainEqual({ width: 200 });
  });

  it('renders with custom height', () => {
    const { getByTestId } = render(
      <Box height={200} testID="box">
        <></>
      </Box>
    );
    const component = getByTestId('box');
    expect(component.props.style).toContainEqual({ height: 200 });
  });

  it('renders with custom background color', () => {
    const { getByTestId } = render(
      <Box backgroundColor="#FF0000" testID="box">
        <></>
      </Box>
    );
    const component = getByTestId('box');
    expect(component.props.style).toContainEqual({ backgroundColor: '#FF0000' });
  });

  it('renders with custom border radius', () => {
    const { getByTestId } = render(
      <Box borderRadius={8} testID="box">
        <></>
      </Box>
    );
    const component = getByTestId('box');
    expect(component.props.style).toContainEqual({ borderRadius: 8 });
  });

  it('renders children correctly', () => {
    const { getByTestId } = render(
      <Box>
        <View testID="child-component" />
      </Box>
    );
    expect(getByTestId('child-component')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const { getByTestId } = render(
      <Box style={{ marginTop: 10 }} testID="box">
        <></>
      </Box>
    );
    const component = getByTestId('box');
    expect(component.props.style).toContainEqual({ marginTop: 10 });
  });
}); 
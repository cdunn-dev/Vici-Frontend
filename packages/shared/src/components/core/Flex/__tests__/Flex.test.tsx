import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import { Flex } from '../Flex';
import { useTheme } from '../../../../hooks/useTheme';

jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('Flex', () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({
      colors: {
        background: '#FFFFFF',
      },
    });
  });

  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <Flex testID="flex">
        <></>
      </Flex>
    );
    expect(getByTestId('flex')).toBeTruthy();
  });

  it('renders with custom direction', () => {
    const { getByTestId } = render(
      <Flex direction="column" testID="flex">
        <></>
      </Flex>
    );
    const component = getByTestId('flex');
    expect(component.props.style).toContainEqual({ flexDirection: 'column' });
  });

  it('renders with custom wrap', () => {
    const { getByTestId } = render(
      <Flex wrap="wrap" testID="flex">
        <></>
      </Flex>
    );
    const component = getByTestId('flex');
    expect(component.props.style).toContainEqual({ flexWrap: 'wrap' });
  });

  it('renders with custom justify', () => {
    const { getByTestId } = render(
      <Flex justify="center" testID="flex">
        <></>
      </Flex>
    );
    const component = getByTestId('flex');
    expect(component.props.style).toContainEqual({ justifyContent: 'center' });
  });

  it('renders with custom align', () => {
    const { getByTestId } = render(
      <Flex align="center" testID="flex">
        <></>
      </Flex>
    );
    const component = getByTestId('flex');
    expect(component.props.style).toContainEqual({ alignItems: 'center' });
  });

  it('renders with custom gap', () => {
    const { getByTestId } = render(
      <Flex gap={16} testID="flex">
        <></>
      </Flex>
    );
    const component = getByTestId('flex');
    expect(component.props.style).toContainEqual({ gap: 16 });
  });

  it('renders with custom flex', () => {
    const { getByTestId } = render(
      <Flex flex={1} testID="flex">
        <></>
      </Flex>
    );
    const component = getByTestId('flex');
    expect(component.props.style).toContainEqual({ flex: 1 });
  });

  it('renders children correctly', () => {
    const { getByTestId } = render(
      <Flex>
        <View testID="child-component" />
      </Flex>
    );
    expect(getByTestId('child-component')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const { getByTestId } = render(
      <Flex style={{ marginTop: 10 }} testID="flex">
        <></>
      </Flex>
    );
    const component = getByTestId('flex');
    expect(component.props.style).toContainEqual({ marginTop: 10 });
  });
}); 
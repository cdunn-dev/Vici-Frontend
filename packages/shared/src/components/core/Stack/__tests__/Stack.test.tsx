import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import { Stack } from '../Stack';
import { useTheme } from "@/theme/useTheme";

jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('Stack', () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({
      colors: {
        background: '#FFFFFF',
      },
    });
  });

  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <Stack testID="stack">
        <></>
      </Stack>
    );
    expect(getByTestId('stack')).toBeTruthy();
  });

  it('renders with horizontal direction', () => {
    const { getByTestId } = render(
      <Stack direction="horizontal" testID="stack">
        <></>
      </Stack>
    );
    const component = getByTestId('stack');
    expect(component.props.style).toContainEqual({ flexDirection: 'row' });
  });

  it('renders with custom spacing', () => {
    const { getByTestId } = render(
      <Stack spacing={24} testID="stack">
        <></>
      </Stack>
    );
    const component = getByTestId('stack');
    expect(component.props.style).toContainEqual({ gap: 24 });
  });

  it('renders with custom alignment', () => {
    const { getByTestId } = render(
      <Stack align="center" testID="stack">
        <></>
      </Stack>
    );
    const component = getByTestId('stack');
    expect(component.props.style).toContainEqual({ alignItems: 'center' });
  });

  it('renders with custom justification', () => {
    const { getByTestId } = render(
      <Stack justify="space-between" testID="stack">
        <></>
      </Stack>
    );
    const component = getByTestId('stack');
    expect(component.props.style).toContainEqual({ justifyContent: 'space-between' });
  });

  it('renders children correctly', () => {
    const { getByTestId } = render(
      <Stack>
        <View testID="child-component" />
      </Stack>
    );
    expect(getByTestId('child-component')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const { getByTestId } = render(
      <Stack style={{ marginTop: 10 }} testID="stack">
        <></>
      </Stack>
    );
    const component = getByTestId('stack');
    expect(component.props.style).toContainEqual({ marginTop: 10 });
  });
}); 
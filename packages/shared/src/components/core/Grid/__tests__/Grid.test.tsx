import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import { Grid } from '../Grid';
import { useTheme } from '../../../../hooks/useTheme';

jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('Grid', () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({
      colors: {
        background: '#FFFFFF',
      },
    });
  });

  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <Grid testID="grid">
        <></>
      </Grid>
    );
    expect(getByTestId('grid')).toBeTruthy();
  });

  it('renders with custom columns', () => {
    const { getByTestId } = render(
      <Grid columns={6} testID="grid">
        <></>
      </Grid>
    );
    const component = getByTestId('grid');
    expect(component.props.style).toContainEqual({ display: 'flex' });
  });

  it('renders with custom gap', () => {
    const { getByTestId } = render(
      <Grid gap={24} testID="grid">
        <></>
      </Grid>
    );
    const component = getByTestId('grid');
    expect(component.props.style).toContainEqual({ margin: -12 });
  });

  it('renders children correctly', () => {
    const { getByTestId } = render(
      <Grid>
        <View testID="child-component" />
      </Grid>
    );
    expect(getByTestId('child-component')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const { getByTestId } = render(
      <Grid style={{ marginTop: 10 }} testID="grid">
        <></>
      </Grid>
    );
    const component = getByTestId('grid');
    expect(component.props.style).toContainEqual({ marginTop: 10 });
  });
}); 
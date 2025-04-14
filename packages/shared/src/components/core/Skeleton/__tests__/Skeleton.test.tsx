import React from 'react';
import { render } from '@testing-library/react-native';
import { Skeleton } from '../Skeleton';

jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#000000',
    },
  }),
}));

describe('Skeleton', () => {
  it('renders correctly with default props', () => {
    const { getByTestId } = render(<Skeleton />);
    const skeleton = getByTestId('skeleton');
    expect(skeleton).toBeTruthy();
  });

  it('renders with custom width and height', () => {
    const { getByTestId } = render(
      <Skeleton width={200} height={50} />
    );
    const skeleton = getByTestId('skeleton');
    expect(skeleton.props.style.width).toBe(200);
    expect(skeleton.props.style.height).toBe(50);
  });

  it('renders with custom borderRadius', () => {
    const { getByTestId } = render(
      <Skeleton borderRadius={8} />
    );
    const skeleton = getByTestId('skeleton');
    expect(skeleton.props.style.borderRadius).toBe(8);
  });

  it('applies custom styles', () => {
    const { getByTestId } = render(
      <Skeleton style={{ marginTop: 10 }} />
    );
    const skeleton = getByTestId('skeleton');
    expect(skeleton.props.style.marginTop).toBe(10);
  });
}); 
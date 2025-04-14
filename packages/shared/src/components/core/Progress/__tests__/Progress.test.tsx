import React from 'react';
import { render } from '@testing-library/react-native';
import { Progress } from '../Progress';

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

describe('Progress', () => {
  it('renders linear progress correctly with default props', () => {
    const { getByTestId } = render(
      <Progress value={50} testID="progress" />
    );
    const progress = getByTestId('progress');
    expect(progress).toBeTruthy();
  });

  it('renders circular progress correctly', () => {
    const { getByTestId } = render(
      <Progress value={50} type="circular" testID="progress" />
    );
    const progress = getByTestId('progress');
    expect(progress).toBeTruthy();
  });

  it('renders with different sizes', () => {
    const sizes = ['small', 'medium', 'large'];
    sizes.forEach(size => {
      const { getByTestId } = render(
        <Progress
          value={50}
          size={size as 'small' | 'medium' | 'large'}
          testID="progress"
        />
      );
      const progress = getByTestId('progress');
      expect(progress).toBeTruthy();
    });
  });

  it('renders indeterminate progress', () => {
    const { getByTestId } = render(
      <Progress value={50} indeterminate testID="progress" />
    );
    const progress = getByTestId('progress');
    expect(progress).toBeTruthy();
  });

  it('applies custom styles', () => {
    const customStyle = { margin: 10 };
    const { getByTestId } = render(
      <Progress
        value={50}
        style={customStyle}
        testID="progress"
      />
    );
    const progress = getByTestId('progress');
    expect(progress.props.style).toEqual(
      expect.objectContaining(customStyle)
    );
  });

  it('renders with different types', () => {
    const types = ['linear', 'circular'];
    types.forEach(type => {
      const { getByTestId } = render(
        <Progress
          value={50}
          type={type as 'linear' | 'circular'}
          testID="progress"
        />
      );
      const progress = getByTestId('progress');
      expect(progress).toBeTruthy();
    });
  });

  it('handles different progress values', () => {
    const values = [0, 25, 50, 75, 100];
    values.forEach(value => {
      const { getByTestId } = render(
        <Progress value={value} testID="progress" />
      );
      const progress = getByTestId('progress');
      expect(progress).toBeTruthy();
    });
  });

  it('applies custom track and progress styles', () => {
    const trackStyle = { backgroundColor: '#000000' };
    const progressStyle = { backgroundColor: '#FFFFFF' };
    const { getByTestId } = render(
      <Progress
        value={50}
        trackStyle={trackStyle}
        progressStyle={progressStyle}
        testID="progress"
      />
    );
    const progress = getByTestId('progress');
    expect(progress).toBeTruthy();
  });
}); 
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Modal } from '../Modal';
import { Text } from '../../Text';

// Mock the useTheme hook
jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      background: '#FFFFFF',
      text: '#000000',
    },
  }),
}));

describe('Modal', () => {
  const onDismiss = jest.fn();

  beforeEach(() => {
    onDismiss.mockClear();
  });

  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <Modal visible={true} onDismiss={onDismiss} testID="modal">
        <Text>Modal Content</Text>
      </Modal>
    );

    expect(getByTestId('modal')).toBeTruthy();
  });

  it('renders with a title', () => {
    const { getByText } = render(
      <Modal visible={true} onDismiss={onDismiss} title="Test Modal">
        <Text>Modal Content</Text>
      </Modal>
    );

    expect(getByText('Test Modal')).toBeTruthy();
  });

  it('calls onDismiss when clicking outside', () => {
    const { getByTestId } = render(
      <Modal visible={true} onDismiss={onDismiss} testID="modal">
        <Text>Modal Content</Text>
      </Modal>
    );

    fireEvent.press(getByTestId('modal'));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('does not call onDismiss when clicking inside', () => {
    const { getByText } = render(
      <Modal visible={true} onDismiss={onDismiss}>
        <Text testID="content">Modal Content</Text>
      </Modal>
    );

    fireEvent.press(getByText('Modal Content'));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <Modal
        visible={true}
        onDismiss={onDismiss}
        style={customStyle}
        testID="modal"
      >
        <Text>Modal Content</Text>
      </Modal>
    );

    const modal = getByTestId('modal');
    expect(modal.props.style).toContain(customStyle);
  });

  it('does not render when visible is false', () => {
    const { queryByTestId } = render(
      <Modal visible={false} onDismiss={onDismiss} testID="modal">
        <Text>Modal Content</Text>
      </Modal>
    );

    expect(queryByTestId('modal')).toBeNull();
  });
}); 
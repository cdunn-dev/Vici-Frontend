import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card } from '../Card';

describe('Card', () => {
  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <Card>
        <Text>Card Content</Text>
      </Card>
    );
    expect(getByTestId('card')).toBeTruthy();
    expect(getByTestId('card-content')).toBeTruthy();
  });

  it('renders header when provided', () => {
    const { getByTestId, getByText } = render(
      <Card header={<Text>Header</Text>}>
        <Text>Card Content</Text>
      </Card>
    );
    expect(getByTestId('card-header')).toBeTruthy();
    expect(getByText('Header')).toBeTruthy();
  });

  it('renders footer when provided', () => {
    const { getByTestId, getByText } = render(
      <Card footer={<Text>Footer</Text>}>
        <Text>Card Content</Text>
      </Card>
    );
    expect(getByTestId('card-footer')).toBeTruthy();
    expect(getByText('Footer')).toBeTruthy();
  });

  it('handles onPress when pressable', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Card onPress={onPress}>
        <Text>Card Content</Text>
      </Card>
    );
    
    fireEvent.press(getByTestId('card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Card onPress={onPress} disabled>
        <Text>Card Content</Text>
      </Card>
    );
    
    fireEvent.press(getByTestId('card'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders with different variants', () => {
    const { rerender, getByTestId } = render(
      <Card variant="elevated">
        <Text>Card Content</Text>
      </Card>
    );
    
    let card = getByTestId('card');
    expect(card.props.style).toContainEqual(
      expect.objectContaining({
        shadowColor: '#000000',
        elevation: 3,
      })
    );

    rerender(
      <Card variant="outlined">
        <Text>Card Content</Text>
      </Card>
    );
    
    card = getByTestId('card');
    expect(card.props.style).toContainEqual(
      expect.objectContaining({
        borderWidth: 1,
        borderColor: '#E5E7EB',
      })
    );

    rerender(
      <Card variant="flat">
        <Text>Card Content</Text>
      </Card>
    );
    
    card = getByTestId('card');
    expect(card.props.style).not.toContainEqual(
      expect.objectContaining({
        shadowColor: '#000000',
        elevation: 3,
        borderWidth: 1,
      })
    );
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: '#F3F4F6' };
    const { getByTestId } = render(
      <Card style={customStyle}>
        <Text>Card Content</Text>
      </Card>
    );
    
    expect(getByTestId('card').props.style).toContainEqual(customStyle);
  });
}); 
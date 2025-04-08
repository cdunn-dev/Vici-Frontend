import React from 'react';
import { render } from '@testing-library/react-native';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  it('renders correctly with default props', () => {
    const { getByTestId } = render(<Avatar text="JD" />);
    const avatar = getByTestId('avatar');
    expect(avatar).toBeTruthy();
  });

  it('renders with image source', () => {
    const { getByTestId } = render(
      <Avatar
        source={{ uri: 'https://example.com/avatar.jpg' }}
        testID="avatar-with-image"
      />
    );
    const avatar = getByTestId('avatar-with-image');
    const image = getByTestId('avatar-with-image-image');
    expect(avatar).toBeTruthy();
    expect(image).toBeTruthy();
  });

  it('renders with text when no image is provided', () => {
    const { getByTestId } = render(<Avatar text="JD" testID="avatar-with-text" />);
    const avatar = getByTestId('avatar-with-text');
    const text = getByTestId('avatar-with-text-text');
    expect(avatar).toBeTruthy();
    expect(text).toBeTruthy();
    expect(text.props.children).toBe('JD');
  });

  it('renders with custom size', () => {
    const { getByTestId } = render(<Avatar text="JD" size="large" />);
    const avatar = getByTestId('avatar');
    expect(avatar.props.style).toEqual(
      expect.objectContaining({
        width: 64,
        height: 64,
        borderRadius: 32,
      })
    );
  });

  it('renders with custom numeric size', () => {
    const { getByTestId } = render(<Avatar text="JD" size={100} />);
    const avatar = getByTestId('avatar');
    expect(avatar.props.style).toEqual(
      expect.objectContaining({
        width: 100,
        height: 100,
        borderRadius: 50,
      })
    );
  });

  it('renders with custom colors', () => {
    const { getByTestId } = render(
      <Avatar
        text="JD"
        backgroundColor="#FF0000"
        textColor="#FFFFFF"
        testID="avatar-with-colors"
      />
    );
    const avatar = getByTestId('avatar-with-colors');
    const text = getByTestId('avatar-with-colors-text');
    expect(avatar.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: '#FF0000',
      })
    );
    expect(text.props.style).toEqual(
      expect.objectContaining({
        color: '#FFFFFF',
      })
    );
  });

  it('renders with custom styles', () => {
    const containerStyle = { borderWidth: 1 };
    const imageStyle = { opacity: 0.5 };
    const textStyle = { fontFamily: 'Arial' };

    const { getByTestId } = render(
      <Avatar
        text="JD"
        style={containerStyle}
        imageStyle={imageStyle}
        textStyle={textStyle}
        testID="avatar-with-styles"
      />
    );
    const avatar = getByTestId('avatar-with-styles');
    const text = getByTestId('avatar-with-styles-text');
    expect(avatar.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining(containerStyle)])
    );
    expect(text.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining(textStyle)])
    );
  });

  it('renders null when neither source nor text is provided', () => {
    const { queryByTestId } = render(<Avatar />);
    const avatar = queryByTestId('avatar');
    expect(avatar).toBeNull();
  });
}); 
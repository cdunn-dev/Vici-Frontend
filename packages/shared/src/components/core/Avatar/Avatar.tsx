import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  ImageStyle,
  TextStyle,
  ImageSourcePropType,
} from 'react-native';

export type AvatarSize = 'tiny' | 'small' | 'medium' | 'large' | 'xlarge' | number;

const AVATAR_SIZES = {
  tiny: 24,
  small: 32,
  medium: 48,
  large: 64,
  xlarge: 96,
};

const TEXT_SIZES = {
  tiny: 10,
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
};

export interface AvatarProps {
  /** Source of the avatar image */
  source?: ImageSourcePropType;
  /** Text to display when no image is provided (usually initials) */
  text?: string;
  /** Size of the avatar */
  size?: AvatarSize;
  /** Background color for text-based avatars */
  backgroundColor?: string;
  /** Text color for text-based avatars */
  textColor?: string;
  /** Additional styles for the container */
  style?: ViewStyle;
  /** Additional styles for the image */
  imageStyle?: ImageStyle;
  /** Additional styles for the text */
  textStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * A reusable avatar component that supports both image and text-based avatars
 */
export const Avatar: React.FC<AvatarProps> = ({
  source,
  text,
  size = 'medium',
  backgroundColor = '#E0D8FD',
  textColor = '#5224EF',
  style,
  imageStyle,
  textStyle,
  testID = 'avatar',
}) => {
  const avatarSize = typeof size === 'number' ? size : AVATAR_SIZES[size];
  const textSize = typeof size === 'number' ? size / 2 : TEXT_SIZES[size];

  const styles = StyleSheet.create({
    container: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      backgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    text: {
      color: textColor,
      fontSize: textSize,
      fontWeight: '600',
    },
  });

  return (
    <View style={[styles.container, style]} testID={testID}>
      {source ? (
        <Image
          source={source}
          style={[styles.image, imageStyle]}
          testID={`${testID}-image`}
        />
      ) : text ? (
        <Text style={[styles.text, textStyle]} testID={`${testID}-text`}>
          {text}
        </Text>
      ) : null}
    </View>
  );
}; 
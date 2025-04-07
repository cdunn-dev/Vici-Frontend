import React from 'react';
import { View, StyleSheet, Image, ViewStyle } from 'react-native';
import { theme } from '../utils/theme';
import Text from './Text';

interface AvatarProps {
  source?: { uri: string };
  size?: 'small' | 'medium' | 'large';
  label?: string;
  style?: ViewStyle;
}

const Avatar = ({ source, size = 'medium', label, style }: AvatarProps) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 32;
      case 'medium':
        return 48;
      case 'large':
        return 64;
    }
  };

  const avatarSize = getSize();

  return (
    <View
      style={[
        styles.container,
        { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
        style,
      ]}
    >
      {source ? (
        <Image source={source} style={styles.image} />
      ) : (
        <Text
          variant="h3"
          color="background"
          style={styles.label}
        >
          {label?.charAt(0).toUpperCase()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  label: {
    textAlign: 'center',
  },
});

export default Avatar; 
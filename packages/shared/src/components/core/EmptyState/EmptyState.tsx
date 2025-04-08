import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Image, ImageSourcePropType } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Button } from '../Button';

export interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: React.ReactNode;
  image?: ImageSourcePropType;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  messageStyle?: TextStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  image,
  actionLabel,
  onAction,
  testID,
  containerStyle,
  titleStyle,
  messageStyle,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      ...containerStyle,
    },
    iconContainer: {
      marginBottom: 16,
    },
    image: {
      width: 120,
      height: 120,
      marginBottom: 16,
    },
    title: {
      fontSize: theme.typography.fontSize.displaySmall,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
      ...titleStyle,
    },
    message: {
      fontSize: theme.typography.fontSize.bodyMedium,
      color: theme.colors.secondary,
      textAlign: 'center',
      marginBottom: 24,
      ...messageStyle,
    },
    button: {
      marginTop: 16,
    },
  });

  return (
    <View style={styles.container} testID={testID}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      
      {image && (
        <Image 
          source={image} 
          style={styles.image} 
          resizeMode="contain"
          testID="empty-state-image"
        />
      )}
      
      <Text style={styles.title} testID="empty-state-title">
        {title}
      </Text>
      
      {message && (
        <Text style={styles.message} testID="empty-state-message">
          {message}
        </Text>
      )}
      
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
}; 
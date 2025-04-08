import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Image, ImageSourcePropType } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Button } from '../../core/Button';

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
      padding: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      ...containerStyle,
    },
    iconContainer: {
      marginBottom: theme.spacing.md,
    },
    image: {
      width: 120,
      height: 120,
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.fontSize.headingMedium,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
      ...titleStyle,
    },
    message: {
      fontSize: theme.typography.fontSize.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      ...messageStyle,
    },
    button: {
      marginTop: theme.spacing.md,
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
          testID="empty-state-action"
        />
      )}
    </View>
  );
}; 
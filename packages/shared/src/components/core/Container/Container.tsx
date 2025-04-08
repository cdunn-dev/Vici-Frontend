import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
  padding?: number;
  style?: any;
  testID?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = 1200,
  padding = 16,
  style,
  testID = 'container',
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      maxWidth,
      padding,
      marginHorizontal: 'auto',
      ...style,
    },
  });

  return (
    <View style={styles.container} testID={testID}>
      {children}
    </View>
  );
}; 
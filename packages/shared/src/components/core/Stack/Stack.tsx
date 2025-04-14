import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from "@/theme/useTheme";

export interface StackProps {
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal';
  spacing?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  style?: any;
  testID?: string;
}

export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'vertical',
  spacing = 16,
  align = 'stretch',
  justify = 'start',
  style,
  testID = 'stack',
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      display: 'flex',
      flexDirection: direction === 'vertical' ? 'column' : 'row',
      alignItems: align,
      justifyContent: justify,
      gap: spacing,
      ...style,
    },
  });

  return (
    <View style={styles.container} testID={testID}>
      {children}
    </View>
  );
}; 
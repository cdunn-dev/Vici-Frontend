import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from "@/theme/useTheme";

export interface GridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  style?: any;
  testID?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 12,
  gap = 16,
  style,
  testID = 'grid',
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      margin: -gap / 2,
      ...style,
    },
    item: {
      width: `${100 / columns}%`,
      padding: gap / 2,
    },
  });

  return (
    <View style={styles.container} testID={testID}>
      {React.Children.map(children, (child, index) => (
        <View key={index} style={styles.item}>
          {child}
        </View>
      ))}
    </View>
  );
}; 
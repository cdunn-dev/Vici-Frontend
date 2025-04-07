import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  FlatList,
  FlatListProps,
  ListRenderItem,
} from 'react-native';
import { theme } from '../utils/theme';

interface ListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: ListRenderItem<T>;
  containerStyle?: ViewStyle;
  itemStyle?: ViewStyle;
  separator?: boolean;
}

const List = <T extends any>({
  data,
  renderItem,
  containerStyle,
  itemStyle,
  separator = true,
  ...props
}: ListProps<T>) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <FlatList
        data={data}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.item,
              separator && index < data.length - 1 && styles.separator,
              itemStyle,
            ]}
          >
            {renderItem({ item, index, separators: {} })}
          </View>
        )}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    padding: theme.spacing.m,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
});

export default List; 
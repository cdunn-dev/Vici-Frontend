import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ViewStyle,
  StyleProp,
  ListRenderItem,
  FlatListProps,
} from 'react-native';

export interface ListProps<T extends object> extends Omit<FlatListProps<T>, 'style'> {
  /** Data to be rendered in the list */
  data: T[];
  /** Function to render each item */
  renderItem: ListRenderItem<T>;
  /** Optional header component */
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  /** Optional footer component */
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  /** Optional empty state component */
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  /** Whether to show separators between items */
  showSeparators?: boolean;
  /** Whether the list is in a loading state */
  loading?: boolean;
  /** Additional styles for the container */
  style?: StyleProp<ViewStyle>;
  /** Additional styles for the content container */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Additional styles for the separator */
  separatorStyle?: StyleProp<ViewStyle>;
  /** Test ID for testing */
  testID?: string;
}

/**
 * A reusable list component that supports headers, footers, empty states, and separators
 */
export function List<T extends object>({
  data,
  renderItem,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  showSeparators = true,
  loading = false,
  style,
  contentContainerStyle,
  separatorStyle,
  testID = 'list',
  ...rest
}: ListProps<T>) {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      flexGrow: 1,
    },
    separator: {
      height: 1,
      backgroundColor: '#E5E7EB',
      marginLeft: 16,
    },
    loadingContainer: {
      opacity: 0.5,
    },
  });

  const ItemSeparator = () =>
    showSeparators ? (
      <View
        style={[styles.separator, separatorStyle]}
        testID={`${testID}-separator`}
      />
    ) : null;

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={
        loading ? null : ListEmptyComponent
      }
      ItemSeparatorComponent={ItemSeparator}
      style={[
        styles.container,
        loading && styles.loadingContainer,
        style,
      ]}
      contentContainerStyle={[
        styles.contentContainer,
        contentContainerStyle,
      ]}
      testID={testID}
      keyExtractor={(item, index) => 
        'id' in item && typeof item.id !== 'undefined'
          ? String(item.id)
          : String(index)
      }
      {...rest}
    />
  );
} 
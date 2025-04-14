import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { Icon } from '../Icon';

export interface BreadcrumbItem {
  label: string;
  onPress?: () => void;
  icon?: string;
}

export interface BreadcrumbProps {
  /**
   * Array of breadcrumb items
   */
  items: BreadcrumbItem[];
  /**
   * Separator between items (default: '/')
   */
  separator?: string | React.ReactNode;
  /**
   * Maximum number of items to show
   */
  maxItems?: number;
  /**
   * Label for the collapsed items
   */
  collapsedLabel?: string;
  /**
   * Additional styles for the container
   */
  style?: ViewStyle;
  /**
   * Additional styles for item text
   */
  itemStyle?: TextStyle;
  /**
   * Additional styles for the active item (last item)
   */
  activeItemStyle?: TextStyle;
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * A breadcrumb navigation component that allows users to keep track of their location
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  maxItems = 0,
  collapsedLabel = '...',
  style,
  itemStyle,
  activeItemStyle,
  testID = 'breadcrumb',
}) => {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      ...style,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    itemText: {
      fontSize: theme.typography.fontSize.bodyMedium,
      color: theme.colors.secondary,
      ...itemStyle,
    },
    activeItemText: {
      fontSize: theme.typography.fontSize.bodyMedium,
      color: theme.colors.text,
      fontWeight: 'bold',
      ...activeItemStyle,
    },
    separator: {
      marginHorizontal: 8,
      fontSize: theme.typography.fontSize.bodyMedium,
      color: theme.colors.secondary,
    },
    icon: {
      marginRight: 4,
    },
  });

  const renderItems = () => {
    let visibleItems = [...items];
    
    if (maxItems > 0 && items.length > maxItems) {
      const firstItem = items[0];
      const lastItems = items.slice(items.length - (maxItems - 1));
      visibleItems = [firstItem, { label: collapsedLabel }, ...lastItems];
    }
    
    return visibleItems.map((item, index) => {
      const isLast = index === visibleItems.length - 1;
      const isCollapsed = item.label === collapsedLabel;
      
      return (
        <React.Fragment key={`${item.label}-${index}`}>
          <View style={styles.item}>
            {item.icon && (
              <Icon 
                name={item.icon} 
                size={16} 
                color={isLast ? theme.colors.text : theme.colors.secondary} 
                style={styles.icon} 
              />
            )}
            
            {isCollapsed ? (
              <Text style={styles.itemText}>{item.label}</Text>
            ) : (
              <TouchableOpacity 
                onPress={item.onPress} 
                disabled={!item.onPress || isLast}
                testID={`breadcrumb-item-${index}`}
              >
                <Text style={isLast ? styles.activeItemText : styles.itemText}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {!isLast && (
            <View style={styles.separator}>
              {typeof separator === 'string' ? (
                <Text style={styles.separator}>{separator}</Text>
              ) : (
                separator
              )}
            </View>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <View style={styles.container} testID={testID}>
      {renderItems()}
    </View>
  );
}; 
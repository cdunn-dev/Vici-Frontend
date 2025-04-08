import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Icon } from '../Icon';

export type MenuItemType = 'default' | 'primary' | 'secondary' | 'danger';

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  type?: MenuItemType;
  disabled?: boolean;
  onPress?: () => void;
  subItems?: MenuItem[];
}

export interface MenuProps {
  items: MenuItem[];
  style?: ViewStyle;
  showIcons?: boolean;
  showDividers?: boolean;
  onItemPress?: (item: MenuItem) => void;
}

export const Menu: React.FC<MenuProps> = ({
  items,
  style,
  showIcons = true,
  showDividers = true,
  onItemPress,
}) => {
  const theme = useTheme();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleSubItems = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const getItemColor = (type?: MenuItemType) => {
    switch (type) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'danger':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  };

  const handleItemPress = (item: MenuItem) => {
    if (item.disabled) return;
    
    if (item.subItems) {
      toggleSubItems(item.id);
    } else if (item.onPress) {
      item.onPress();
    }
    
    if (onItemPress) {
      onItemPress(item);
    }
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const itemColor = getItemColor(item.type);

    return (
      <View key={item.id}>
        <TouchableOpacity
          style={[
            styles.menuItem,
            { paddingLeft: level * 16 + 16 },
            item.disabled && styles.disabledItem,
          ]}
          onPress={() => handleItemPress(item)}
          disabled={item.disabled}
        >
          {showIcons && item.icon && (
            <Icon
              name={item.icon}
              size={20}
              color={item.disabled ? theme.colors.textSecondary : itemColor}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.label,
              { color: item.disabled ? theme.colors.textSecondary : itemColor },
            ]}
          >
            {item.label}
          </Text>
          {hasSubItems && (
            <Icon
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={item.disabled ? theme.colors.textSecondary : itemColor}
              style={styles.chevron}
            />
          )}
        </TouchableOpacity>
        {showDividers && <View style={styles.divider} />}
        {hasSubItems && isExpanded && (
          <View style={styles.subItems}>
            {item.subItems.map(subItem => renderMenuItem(subItem, level + 1))}
          </View>
        )}
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      ...style,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    disabledItem: {
      opacity: 0.5,
    },
    icon: {
      marginRight: theme.spacing.sm,
    },
    label: {
      flex: 1,
      fontSize: theme.typography.fontSize.bodyMedium,
    },
    chevron: {
      marginLeft: theme.spacing.sm,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing.md,
    },
    subItems: {
      backgroundColor: theme.colors.backgroundSecondary,
    },
  });

  return <View style={styles.container}>{items.map(item => renderMenuItem(item))}</View>;
}; 
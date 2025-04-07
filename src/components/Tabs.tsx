import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../utils/theme';
import Text from './Text';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const Tabs = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'horizontal',
  size = 'medium',
  style,
}: TabsProps) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          tab: styles.smallTab,
          text: styles.smallText,
        };
      case 'medium':
        return {
          container: styles.mediumContainer,
          tab: styles.mediumTab,
          text: styles.mediumText,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          tab: styles.largeTab,
          text: styles.largeText,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        variant === 'vertical' && styles.verticalContainer,
        sizeStyles.container,
        style,
      ]}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          style={[
            styles.tab,
            variant === 'vertical' && styles.verticalTab,
            sizeStyles.tab,
            activeTab === tab.id && styles.activeTab,
          ]}
        >
          <Text
            variant="body"
            color={activeTab === tab.id ? 'primary' : 'textSecondary'}
            style={[
              styles.text,
              sizeStyles.text,
              activeTab === tab.id && styles.activeText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  verticalContainer: {
    flexDirection: 'column',
    borderBottomWidth: 0,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  tab: {
    padding: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalTab: {
    padding: theme.spacing.m,
    alignItems: 'flex-start',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  text: {
    textAlign: 'center',
  },
  activeText: {
    fontWeight: 'bold',
  },
  // Size variants
  smallContainer: {
    height: 40,
  },
  smallTab: {
    padding: theme.spacing.sm,
  },
  smallText: {
    fontSize: 12,
  },
  mediumContainer: {
    height: 48,
  },
  mediumTab: {
    padding: theme.spacing.m,
  },
  mediumText: {
    fontSize: 14,
  },
  largeContainer: {
    height: 56,
  },
  largeTab: {
    padding: theme.spacing.lg,
  },
  largeText: {
    fontSize: 16,
  },
});

export default Tabs; 
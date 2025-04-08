import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Text } from '../Text';

export interface Tab {
  /** Unique identifier for the tab */
  id: string;
  /** Label to display for the tab */
  label: string;
  /** Content to display when the tab is active */
  content: React.ReactNode;
}

export interface TabsProps {
  /** Array of tab objects */
  tabs: Tab[];
  /** Initial active tab ID */
  initialTabId?: string;
  /** Callback when a tab is selected */
  onTabChange?: (tabId: string) => void;
  /** Custom styles */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * A reusable tabs component that displays content in different sections
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  initialTabId,
  onTabChange,
  style,
  testID,
}) => {
  const theme = useTheme();
  const [activeTabId, setActiveTabId] = useState(initialTabId || tabs[0]?.id);
  const indicatorPosition = React.useRef(new Animated.Value(0)).current;

  const handleTabPress = (tabId: string, index: number) => {
    setActiveTabId(tabId);
    onTabChange?.(tabId);
    Animated.spring(indicatorPosition, {
      toValue: index,
      useNativeDriver: true,
    }).start();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      ...style,
    },
    tabBar: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.text,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
    },
    indicator: {
      position: 'absolute',
      bottom: -1,
      height: 2,
      backgroundColor: theme.colors.primary,
    },
    content: {
      flex: 1,
    },
  });

  const tabWidth = 100 / tabs.length;
  const translateX = indicatorPosition.interpolate({
    inputRange: [0, tabs.length - 1],
    outputRange: [0, (tabs.length - 1) * tabWidth],
  });

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => handleTabPress(tab.id, index)}
            testID={`tab-${tab.id}`}
          >
            <Text
              style={{
                color: activeTabId === tab.id ? theme.colors.primary : theme.colors.text,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
        <Animated.View
          style={[
            styles.indicator,
            {
              width: `${tabWidth}%`,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
      <View style={styles.content}>
        {tabs.find((tab) => tab.id === activeTabId)?.content}
      </View>
    </View>
  );
}; 
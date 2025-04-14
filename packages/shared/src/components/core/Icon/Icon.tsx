import React from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;
type MaterialCommunityIconName = keyof typeof MaterialCommunityIcons.glyphMap;
type FontAwesomeIconName = keyof typeof FontAwesome.glyphMap;
type IoniconsIconName = keyof typeof Ionicons.glyphMap;

export type IconFamily = 'material' | 'material-community' | 'font-awesome' | 'ionicons';

export interface IconProps {
  /** Name of the icon */
  name: string;
  /** Size of the icon */
  size?: number;
  /** Color of the icon */
  color?: string;
  /** Icon family to use */
  family?: IconFamily;
  /** Additional styles for the icon container */
  style?: ViewStyle;
  /** Additional styles for the icon */
  iconStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

const ICON_FAMILIES = {
  'material': MaterialIcons,
  'material-community': MaterialCommunityIcons,
  'font-awesome': FontAwesome,
  'ionicons': Ionicons,
};

/**
 * A reusable icon component that supports multiple icon families
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color,
  family = 'material',
  style,
  iconStyle,
  testID = 'icon',
}) => {
  const theme = useTheme();
  const IconComponent = ICON_FAMILIES[family];

  const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      ...style,
    },
    icon: {
      ...iconStyle,
    },
  });

  return (
    <IconComponent
      name={name as any}
      size={size}
      color={color || theme.colors.text}
      style={styles.icon}
      testID={testID}
    />
  );
}; 
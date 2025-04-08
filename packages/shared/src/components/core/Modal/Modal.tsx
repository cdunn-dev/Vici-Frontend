import React from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  ViewStyle,
  TouchableWithoutFeedback,
  Animated,
  Easing,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Text } from '../Text';

export interface ModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when the modal is dismissed */
  onDismiss: () => void;
  /** Modal content */
  children: React.ReactNode;
  /** Modal title */
  title?: string;
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Custom styles */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * A reusable modal component that displays content in a popup
 */
export const Modal: React.FC<ModalProps> = ({
  visible,
  onDismiss,
  children,
  title,
  showCloseButton = true,
  style,
  testID,
}) => {
  const theme = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 16,
      width: '80%',
      maxWidth: 400,
      ...style,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    closeButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      padding: 8,
    },
  });

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
      testID={testID}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <Animated.View style={[styles.modal, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              {title && <Text style={styles.title}>{title}</Text>}
              {children}
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}; 
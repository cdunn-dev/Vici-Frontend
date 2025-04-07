import React from 'react';
import {
  View,
  StyleSheet,
  Modal as RNModal,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';
import { theme } from '../utils/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  dismissible?: boolean;
}

const Modal = ({
  visible,
  onClose,
  children,
  containerStyle,
  contentStyle,
  dismissible = true,
}: ModalProps) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={dismissible ? onClose : undefined}>
        <View style={[styles.container, containerStyle]}>
          <TouchableWithoutFeedback>
            <View style={[styles.content, contentStyle]}>{children}</View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.border.radius.lg,
    padding: theme.spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
});

export default Modal; 
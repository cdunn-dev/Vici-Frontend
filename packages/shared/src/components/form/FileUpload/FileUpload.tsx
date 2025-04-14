import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export interface FileUploadProps {
  /**
   * Label for the upload button
   */
  label?: string;
  /**
   * Helper text to display under the component
   */
  helperText?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Whether the component is disabled
   */
  disabled?: boolean;
  /**
   * Callback when files are selected
   */
  onChange?: (files: any[]) => void;
  /**
   * Accepted file types
   */
  accept?: string[];
  /**
   * Allow multiple file selection
   */
  multiple?: boolean;
  /**
   * Max file size in bytes
   */
  maxSize?: number;
  /**
   * Additional styles for the container
   */
  style?: ViewStyle;
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * A file upload component (placeholder)
 * In a real app, this would handle actual file selection
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  label = 'Choose files',
  helperText,
  error,
  disabled = false,
  onChange,
  accept = [],
  multiple = false,
  maxSize,
  style,
  testID = 'file-upload',
}) => {
  const theme = useTheme();
  const [files, setFiles] = useState<any[]>([]);

  // This is a placeholder for a real file upload implementation
  const handlePress = () => {
    console.log('File upload not implemented in this environment');
    const mockFile = { name: 'sample-file.jpg', size: 12345, type: 'image/jpeg' };
    const newFiles = [...files, mockFile];
    setFiles(newFiles);
    onChange?.(newFiles);
  };

  const styles = StyleSheet.create({
    container: {
      ...style,
    },
    uploadArea: {
      borderWidth: 2,
      borderRadius: theme.borderRadius.md,
      borderStyle: 'dashed',
      borderColor: error ? theme.colors.error : theme.colors.border,
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundSecondary,
      opacity: disabled ? 0.5 : 1,
    },
    button: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      marginTop: theme.spacing.sm,
    },
    buttonText: {
      color: theme.colors.white,
      fontWeight: '500',
    },
    helperText: {
      fontSize: theme.typography.fontSize.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    errorText: {
      fontSize: theme.typography.fontSize.bodySmall,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    fileList: {
      marginTop: theme.spacing.sm,
    },
    fileItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
    },
    fileName: {
      fontSize: theme.typography.fontSize.bodyMedium,
      color: theme.colors.text,
    },
  });

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.uploadArea}>
        <Text>Drag files here or click to upload</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handlePress}
          disabled={disabled}
          testID={`${testID}-button`}
        >
          <Text style={styles.buttonText}>{label}</Text>
        </TouchableOpacity>
      </View>
      
      {files.length > 0 && (
        <View style={styles.fileList} testID={`${testID}-file-list`}>
          {files.map((file, index) => (
            <View key={index} style={styles.fileItem}>
              <Text style={styles.fileName}>{file.name}</Text>
            </View>
          ))}
        </View>
      )}
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
}; 
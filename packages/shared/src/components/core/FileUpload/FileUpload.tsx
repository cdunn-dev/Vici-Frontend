import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from "@/theme/useTheme";
import { Icon } from '../Icon';

export interface FileInfo {
  /**
   * URI of the file
   */
  uri: string;
  
  /**
   * Name of the file
   */
  name: string;
  
  /**
   * Type of the file
   */
  type?: string;
  
  /**
   * Size of the file in bytes
   */
  size?: number;
}

export interface FileUploadProps {
  /**
   * Files that have been uploaded
   */
  files?: FileInfo[];
  
  /**
   * Function called when files are selected
   */
  onFilesSelected?: (files: FileInfo[]) => void;
  
  /**
   * Function to handle actual file upload
   */
  onUpload?: (files: FileInfo[]) => Promise<void>;
  
  /**
   * Label text for the input
   */
  label?: string;
  
  /**
   * Whether the upload is required
   */
  required?: boolean;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Helper text to display
   */
  helperText?: string;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Whether multiple files can be uploaded
   */
  multiple?: boolean;
  
  /**
   * Allowed file types
   */
  accept?: string[];
  
  /**
   * Maximum file size in bytes
   */
  maxSize?: number;
  
  /**
   * Whether the component is disabled
   */
  disabled?: boolean;
  
  /**
   * Whether to show preview of uploaded files
   */
  showPreviews?: boolean;
  
  /**
   * Whether to show file names
   */
  showFileNames?: boolean;
  
  /**
   * Whether to show file sizes
   */
  showFileSizes?: boolean;
  
  /**
   * Function to format file size
   */
  formatFileSize?: (size: number) => string;
  
  /**
   * Custom preview component for specific file types
   */
  previewComponent?: (file: FileInfo) => React.ReactNode;
  
  /**
   * Additional style for the container
   */
  style?: ViewStyle;
  
  /**
   * Additional style for the upload button
   */
  buttonStyle?: ViewStyle;
  
  /**
   * Additional style for the label text
   */
  labelStyle?: TextStyle;
  
  /**
   * Additional style for the placeholder text
   */
  placeholderStyle?: TextStyle;
  
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * A component for uploading files
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  files = [],
  onFilesSelected,
  onUpload,
  label,
  required = false,
  error,
  helperText,
  placeholder = 'Drag and drop files here or click to browse',
  multiple = false,
  accept = [],
  maxSize,
  disabled = false,
  showPreviews = true,
  showFileNames = true,
  showFileSizes = true,
  formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${Math.round(size / (1024 * 1024))} MB`;
  },
  previewComponent,
  style,
  buttonStyle,
  labelStyle,
  placeholderStyle,
  testID = 'file-upload',
}) => {
  const { colors, typography } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const handleUpload = useCallback(async () => {
    if (disabled || !onUpload || files.length === 0) return;
    
    try {
      setIsLoading(true);
      await onUpload(files);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [disabled, onUpload, files]);
  
  const handleSelectFile = useCallback(() => {
    if (disabled) return;
    
    // This is where we would have document.createElement('input') in web
    // For React Native, we'd use a native file picker or image picker
    // This is a placeholder for demonstration purposes
    // In a real implementation, you would use:
    // - react-native-document-picker for documents
    // - react-native-image-picker for images
    // - expo-document-picker or expo-image-picker if using Expo
    
    // Mock implementation - would be replaced with actual native code
    const mockFiles: FileInfo[] = [
      {
        uri: 'file:///mock/path/to/document.pdf',
        name: 'document.pdf',
        type: 'application/pdf',
        size: 125000,
      }
    ];
    
    if (onFilesSelected) {
      onFilesSelected(multiple ? [...files, ...mockFiles] : mockFiles);
    }
  }, [disabled, multiple, files, onFilesSelected]);
  
  const handleRemoveFile = useCallback((fileToRemove: FileInfo) => {
    if (disabled) return;
    
    if (onFilesSelected) {
      onFilesSelected(files.filter(file => file.uri !== fileToRemove.uri));
    }
  }, [disabled, files, onFilesSelected]);
  
  const isImageFile = (file: FileInfo) => {
    return file.type?.startsWith('image/');
  };
  
  const renderFilePreview = (file: FileInfo) => {
    if (previewComponent) {
      return previewComponent(file);
    }
    
    if (isImageFile(file)) {
      return (
        <Image
          source={{ uri: file.uri }}
          style={styles.previewImage}
          resizeMode="cover"
          testID={`${testID}-preview-image`}
        />
      );
    }
    
    // Default icon based on file type
    let iconName = 'file-outline';
    
    if (file.type?.includes('pdf')) {
      iconName = 'file-pdf-outline';
    } else if (file.type?.includes('word') || file.type?.includes('document')) {
      iconName = 'file-word-outline';
    } else if (file.type?.includes('excel') || file.type?.includes('spreadsheet')) {
      iconName = 'file-excel-outline';
    } else if (file.type?.includes('presentation') || file.type?.includes('powerpoint')) {
      iconName = 'file-powerpoint-outline';
    } else if (file.type?.includes('text')) {
      iconName = 'file-text-outline';
    } else if (file.type?.includes('video')) {
      iconName = 'file-video-outline';
    } else if (file.type?.includes('audio')) {
      iconName = 'file-music-outline';
    }
    
    return (
      <View style={styles.fileIconContainer} testID={`${testID}-file-icon`}>
        <Icon name={iconName} size={24} color={colors.text} />
      </View>
    );
  };
  
  return (
    <View style={[styles.container, style]} testID={testID}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: colors.text, fontSize: typography.fontSize.bodyMedium },
            labelStyle
          ]}
          testID={`${testID}-label`}
        >
          {label}
          {required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.uploadArea,
          dragActive ? styles.uploadAreaActive : undefined,
          error ? { borderColor: colors.error } : undefined,
          disabled ? styles.uploadAreaDisabled : undefined,
          buttonStyle,
        ]}
        onPress={handleSelectFile}
        disabled={disabled}
        activeOpacity={0.7}
        testID={`${testID}-button`}
      >
        {isLoading ? (
          <ActivityIndicator
            color={colors.primary}
            size="large"
            testID={`${testID}-loading`}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Icon
              name="cloud-upload-outline"
              size={40}
              color={disabled ? colors.text + '40' : colors.primary}
              testID={`${testID}-upload-icon`}
            />
            <Text
              style={[
                styles.placeholder,
                {
                  color: disabled ? colors.text + '40' : colors.text,
                  fontSize: typography.fontSize.bodyMedium,
                },
                placeholderStyle
              ]}
              testID={`${testID}-placeholder`}
            >
              {placeholder}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      
      {error && (
        <Text
          style={[styles.errorText, { color: colors.error }]}
          testID={`${testID}-error`}
        >
          {error}
        </Text>
      )}
      
      {helperText && !error && (
        <Text
          style={[styles.helperText, { color: colors.text + '80' }]}
          testID={`${testID}-helper-text`}
        >
          {helperText}
        </Text>
      )}
      
      {files.length > 0 && (
        <View style={styles.fileList} testID={`${testID}-file-list`}>
          {files.map((file, index) => (
            <View
              key={`${file.uri}-${index}`}
              style={[
                styles.fileItem,
                { borderColor: colors.text + '20' }
              ]}
              testID={`${testID}-file-item-${index}`}
            >
              {showPreviews && (
                <View style={styles.previewContainer}>
                  {renderFilePreview(file)}
                </View>
              )}
              
              <View style={styles.fileInfo}>
                {showFileNames && (
                  <Text
                    style={[styles.fileName, { color: colors.text }]}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                    testID={`${testID}-file-name-${index}`}
                  >
                    {file.name}
                  </Text>
                )}
                
                {showFileSizes && file.size && (
                  <Text
                    style={[styles.fileSize, { color: colors.text + '80' }]}
                    testID={`${testID}-file-size-${index}`}
                  >
                    {formatFileSize(file.size)}
                  </Text>
                )}
              </View>
              
              <TouchableOpacity
                onPress={() => handleRemoveFile(file)}
                style={styles.removeButton}
                disabled={disabled}
                testID={`${testID}-remove-button-${index}`}
              >
                <Icon
                  name="close-circle"
                  size={20}
                  color={disabled ? colors.text + '40' : colors.error}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      {files.length > 0 && onUpload && (
        <TouchableOpacity
          style={[
            styles.uploadButton,
            {
              backgroundColor: disabled ? colors.primary + '40' : colors.primary,
            }
          ]}
          onPress={handleUpload}
          disabled={disabled || isLoading}
          testID={`${testID}-upload-button`}
        >
          <Text
            style={[styles.uploadButtonText, { color: colors.background }]}
          >
            {isLoading ? 'Uploading...' : 'Upload Files'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    minHeight: 150,
  },
  uploadAreaActive: {
    borderColor: '#5224EF',
    backgroundColor: '#F0F0FF',
  },
  uploadAreaDisabled: {
    opacity: 0.6,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    textAlign: 'center',
    marginTop: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  fileList: {
    marginTop: 16,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  previewContainer: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  fileIconContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 12,
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  uploadButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 
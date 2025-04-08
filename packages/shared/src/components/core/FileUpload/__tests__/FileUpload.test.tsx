import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FileUpload, FileInfo } from '../FileUpload';

// Mock the theme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#5224EF',
      secondary: '#4318C9',
      text: '#11182C',
      background: '#FFFFFF',
      error: '#DC2626',
    },
    typography: {
      fontSize: {
        bodyMedium: 14,
        bodySmall: 12,
      },
    },
  }),
}));

// Mock the Icon component
jest.mock('../../../../components/core/Icon', () => ({
  Icon: ({ name, size, color, testID }: any) => (
    <div data-testid={testID || `icon-${name}`}>{name}</div>
  ),
}));

describe('FileUpload Component', () => {
  const mockFile: FileInfo = {
    uri: 'file:///path/to/document.pdf',
    name: 'document.pdf',
    type: 'application/pdf',
    size: 124576,
  };

  const mockImageFile: FileInfo = {
    uri: 'file:///path/to/image.jpg',
    name: 'image.jpg',
    type: 'image/jpeg',
    size: 256000,
  };

  it('renders with default props', () => {
    const { getByTestId, getByText } = render(<FileUpload />);
    
    expect(getByTestId('file-upload')).toBeTruthy();
    expect(getByTestId('file-upload-button')).toBeTruthy();
    expect(getByText('Drag and drop files here or click to browse')).toBeTruthy();
  });

  it('renders with a label', () => {
    const { getByTestId, getByText } = render(
      <FileUpload label="Upload Documents" />
    );
    
    expect(getByTestId('file-upload-label')).toBeTruthy();
    expect(getByText('Upload Documents')).toBeTruthy();
  });

  it('renders with required indicator', () => {
    const { getByText } = render(
      <FileUpload label="Upload Documents" required />
    );
    
    expect(getByText('*')).toBeTruthy();
  });

  it('renders with custom placeholder', () => {
    const { getByText } = render(
      <FileUpload placeholder="Click here to select files" />
    );
    
    expect(getByText('Click here to select files')).toBeTruthy();
  });

  it('renders with error message', () => {
    const { getByTestId, getByText } = render(
      <FileUpload error="Please upload a valid file" />
    );
    
    expect(getByTestId('file-upload-error')).toBeTruthy();
    expect(getByText('Please upload a valid file')).toBeTruthy();
  });

  it('renders with helper text', () => {
    const { getByTestId, getByText } = render(
      <FileUpload helperText="Maximum file size: 5MB" />
    );
    
    expect(getByTestId('file-upload-helper-text')).toBeTruthy();
    expect(getByText('Maximum file size: 5MB')).toBeTruthy();
  });

  it('renders in disabled state', () => {
    const { getByTestId } = render(<FileUpload disabled />);
    
    const uploadButton = getByTestId('file-upload-button');
    expect(uploadButton.props.disabled).toBe(true);
  });

  it('renders file list when files are provided', () => {
    const { getByTestId, getByText } = render(
      <FileUpload files={[mockFile]} />
    );
    
    expect(getByTestId('file-upload-file-list')).toBeTruthy();
    expect(getByTestId('file-upload-file-item-0')).toBeTruthy();
    expect(getByText('document.pdf')).toBeTruthy();
    expect(getByText('122 KB')).toBeTruthy(); // Formatted size
  });

  it('displays file previews correctly', () => {
    const { getByTestId, queryByTestId, rerender } = render(
      <FileUpload files={[mockFile]} />
    );
    
    // PDF file should show an icon
    expect(getByTestId('file-upload-file-icon')).toBeTruthy();
    
    // Image file should show a preview image
    rerender(<FileUpload files={[mockImageFile]} />);
    expect(getByTestId('file-upload-preview-image')).toBeTruthy();
  });

  it('calls onFilesSelected when file is selected', () => {
    const onFilesSelectedMock = jest.fn();
    const { getByTestId } = render(
      <FileUpload onFilesSelected={onFilesSelectedMock} />
    );
    
    fireEvent.press(getByTestId('file-upload-button'));
    
    // Since we mock the file selection in the component, 
    // we expect the mock function to be called with some files
    expect(onFilesSelectedMock).toHaveBeenCalled();
    expect(onFilesSelectedMock.mock.calls[0][0]).toHaveLength(1);
    expect(onFilesSelectedMock.mock.calls[0][0][0].name).toBe('document.pdf');
  });

  it('calls onFilesSelected with merged files when multiple is true', () => {
    const onFilesSelectedMock = jest.fn();
    const { getByTestId } = render(
      <FileUpload 
        files={[mockFile]} 
        multiple 
        onFilesSelected={onFilesSelectedMock} 
      />
    );
    
    fireEvent.press(getByTestId('file-upload-button'));
    
    // Should keep existing file and add the new one
    expect(onFilesSelectedMock).toHaveBeenCalled();
    expect(onFilesSelectedMock.mock.calls[0][0]).toHaveLength(2);
  });

  it('calls onFilesSelected when a file is removed', () => {
    const onFilesSelectedMock = jest.fn();
    const { getByTestId } = render(
      <FileUpload 
        files={[mockFile, mockImageFile]} 
        onFilesSelected={onFilesSelectedMock} 
      />
    );
    
    fireEvent.press(getByTestId('file-upload-remove-button-0'));
    
    // Should call with filtered files (removing the first file)
    expect(onFilesSelectedMock).toHaveBeenCalled();
    expect(onFilesSelectedMock.mock.calls[0][0]).toHaveLength(1);
    expect(onFilesSelectedMock.mock.calls[0][0][0].name).toBe('image.jpg');
  });

  it('shows upload button when files are present and onUpload is provided', () => {
    const { getByTestId } = render(
      <FileUpload files={[mockFile]} onUpload={async () => {}} />
    );
    
    expect(getByTestId('file-upload-upload-button')).toBeTruthy();
  });

  it('calls onUpload when upload button is pressed', async () => {
    const onUploadMock = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(
      <FileUpload files={[mockFile]} onUpload={onUploadMock} />
    );
    
    fireEvent.press(getByTestId('file-upload-upload-button'));
    
    expect(onUploadMock).toHaveBeenCalledWith([mockFile]);
  });

  it('respects showFileNames prop', () => {
    const { queryByTestId, rerender } = render(
      <FileUpload files={[mockFile]} showFileNames={false} />
    );
    
    expect(queryByTestId('file-upload-file-name-0')).toBeNull();
    
    rerender(<FileUpload files={[mockFile]} showFileNames />);
    expect(queryByTestId('file-upload-file-name-0')).toBeTruthy();
  });

  it('respects showFileSizes prop', () => {
    const { queryByTestId, rerender } = render(
      <FileUpload files={[mockFile]} showFileSizes={false} />
    );
    
    expect(queryByTestId('file-upload-file-size-0')).toBeNull();
    
    rerender(<FileUpload files={[mockFile]} showFileSizes />);
    expect(queryByTestId('file-upload-file-size-0')).toBeTruthy();
  });

  it('uses custom formatFileSize function when provided', () => {
    const formatFileSizeMock = jest.fn(() => 'Custom Size');
    const { getByText } = render(
      <FileUpload files={[mockFile]} formatFileSize={formatFileSizeMock} />
    );
    
    expect(formatFileSizeMock).toHaveBeenCalledWith(mockFile.size);
    expect(getByText('Custom Size')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId } = render(
      <FileUpload style={customStyle} />
    );
    
    const container = getByTestId('file-upload');
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customStyle)
      ])
    );
  });
}); 
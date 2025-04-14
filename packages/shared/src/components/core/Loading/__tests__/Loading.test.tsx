import React from 'react';
import { render } from '@testing-library/react-native';
import { Loading } from '../Loading';

// Mock the theme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#5224EF',
      secondary: '#4318C9',
      accent: '#E0D8FD',
      success: '#16A34A',
      error: '#DC2626',
      warning: '#F59E0B',
      background: '#FFFFFF',
      text: '#11182C',
    },
  }),
}));

describe('Loading Component', () => {
  it('renders with default props', () => {
    const { getByTestId } = render(<Loading />);
    
    expect(getByTestId('loading')).toBeTruthy();
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
  
  it('renders with custom size', () => {
    const { getByTestId } = render(<Loading size="large" />);
    
    const indicator = getByTestId('loading-indicator');
    expect(indicator.props.size).toBe(48);
  });
  
  it('renders with custom color', () => {
    const { getByTestId } = render(<Loading color="#FF0000" />);
    
    const indicator = getByTestId('loading-indicator');
    expect(indicator.props.color).toBe('#FF0000');
  });
  
  it('renders with text', () => {
    const { getByTestId, getByText } = render(<Loading text="Loading..." />);
    
    expect(getByTestId('loading-text')).toBeTruthy();
    expect(getByText('Loading...')).toBeTruthy();
  });
  
  it('renders inline', () => {
    const { getByTestId } = render(<Loading inline />);
    
    const container = getByTestId('loading');
    expect(container.props.style.flexDirection).toBe('row');
  });
  
  it('renders fullscreen', () => {
    const { getByTestId } = render(<Loading fullscreen />);
    
    // The fullscreen view should contain our loading component
    const fullscreenView = getByTestId('loading').parent;
    expect(fullscreenView.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        })
      ])
    );
  });
  
  it('applies custom styles', () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId } = render(<Loading style={customStyle} />);
    
    const container = getByTestId('loading');
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customStyle)
      ])
    );
  });
  
  it('applies custom text styles', () => {
    const customTextStyle = { fontSize: 18 };
    const { getByTestId } = render(
      <Loading text="Loading..." textStyle={customTextStyle} />
    );
    
    const text = getByTestId('loading-text');
    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customTextStyle)
      ])
    );
  });
  
  it('renders with custom testID', () => {
    const { getByTestId } = render(<Loading testID="custom-loading" />);
    
    expect(getByTestId('custom-loading')).toBeTruthy();
    expect(getByTestId('custom-loading-indicator')).toBeTruthy();
  });
}); 
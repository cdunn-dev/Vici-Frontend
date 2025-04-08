import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Breadcrumb } from '../Breadcrumb';

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
    typography: {
      fontSize: {
        displayLarge: 24,
        displayMedium: 20,
        displaySmall: 18,
        bodyLarge: 16,
        bodyMedium: 14,
        bodySmall: 12,
        label: 12,
      },
    },
  }),
}));

// Mock the Icon component
jest.mock('../../../../components/core/Icon', () => ({
  Icon: ({ name, size, color, style }: { name: string; size: number; color: string; style?: any }) => (
    <div data-testid={`icon-${name}`} style={{ width: size, height: size, color, ...style }}>
      {name}
    </div>
  ),
}));

describe('Breadcrumb Component', () => {
  it('renders correctly with basic items', () => {
    const items = [
      { label: 'Home' },
      { label: 'Category' },
      { label: 'Product' },
    ];

    const { getByText, getAllByText } = render(<Breadcrumb items={items} />);

    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Category')).toBeTruthy();
    expect(getByText('Product')).toBeTruthy();
    expect(getAllByText('/')).toHaveLength(2); // Two separators
  });

  it('calls onPress when an item is clicked', () => {
    const onPress1 = jest.fn();
    const onPress2 = jest.fn();

    const items = [
      { label: 'Home', onPress: onPress1 },
      { label: 'Category', onPress: onPress2 },
      { label: 'Product' },
    ];

    const { getByText } = render(<Breadcrumb items={items} />);

    fireEvent.press(getByText('Home'));
    expect(onPress1).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText('Category'));
    expect(onPress2).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when the last item is clicked', () => {
    const onPress = jest.fn();

    const items = [
      { label: 'Home' },
      { label: 'Category' },
      { label: 'Product', onPress },
    ];

    const { getByText } = render(<Breadcrumb items={items} />);

    fireEvent.press(getByText('Product'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders with custom separator', () => {
    const items = [
      { label: 'Home' },
      { label: 'Category' },
      { label: 'Product' },
    ];

    const { getAllByText } = render(<Breadcrumb items={items} separator=">" />);

    expect(getAllByText('>')).toHaveLength(2);
  });

  it('collapses items when maxItems is set', () => {
    const items = [
      { label: 'Home' },
      { label: 'Category' },
      { label: 'Subcategory' },
      { label: 'Section' },
      { label: 'Product' },
    ];

    const { getByText, queryByText } = render(
      <Breadcrumb items={items} maxItems={3} />
    );

    expect(getByText('Home')).toBeTruthy();
    expect(getByText('...')).toBeTruthy();
    expect(getByText('Product')).toBeTruthy();
    
    // Middle items should be collapsed
    expect(queryByText('Category')).toBeNull();
    expect(queryByText('Subcategory')).toBeNull();
    expect(queryByText('Section')).toBeNull();
  });

  it('renders with custom collapsedLabel', () => {
    const items = [
      { label: 'Home' },
      { label: 'Category' },
      { label: 'Subcategory' },
      { label: 'Product' },
    ];

    const { getByText } = render(
      <Breadcrumb items={items} maxItems={3} collapsedLabel="[...]" />
    );

    expect(getByText('[...]')).toBeTruthy();
  });

  it('renders with icons', () => {
    const items = [
      { label: 'Home', icon: 'home' },
      { label: 'Category', icon: 'folder' },
      { label: 'Product' },
    ];

    const { getByTestId } = render(<Breadcrumb items={items} />);

    expect(getByTestId('icon-home')).toBeTruthy();
    expect(getByTestId('icon-folder')).toBeTruthy();
  });
}); 
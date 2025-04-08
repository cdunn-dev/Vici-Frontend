import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Tabs } from '../Tabs';

// Mock the useTheme hook
jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#5224EF',
      text: '#11182C',
    },
  }),
}));

describe('Tabs', () => {
  const mockTabs = [
    {
      id: 'tab1',
      label: 'Tab 1',
      content: <View testID="content-1">Content 1</View>,
    },
    {
      id: 'tab2',
      label: 'Tab 2',
      content: <View testID="content-2">Content 2</View>,
    },
  ];

  it('renders correctly with default props', () => {
    const { getByTestId, getByText } = render(
      <Tabs tabs={mockTabs} testID="tabs" />
    );

    expect(getByTestId('tabs')).toBeTruthy();
    expect(getByText('Tab 1')).toBeTruthy();
    expect(getByText('Tab 2')).toBeTruthy();
    expect(getByTestId('content-1')).toBeTruthy();
  });

  it('renders with initial active tab', () => {
    const { getByTestId } = render(
      <Tabs tabs={mockTabs} initialTabId="tab2" testID="tabs" />
    );

    expect(getByTestId('content-2')).toBeTruthy();
  });

  it('changes active tab when clicked', () => {
    const onTabChange = jest.fn();
    const { getByTestId } = render(
      <Tabs tabs={mockTabs} onTabChange={onTabChange} testID="tabs" />
    );

    fireEvent.press(getByTestId('tab-tab2'));
    expect(getByTestId('content-2')).toBeTruthy();
    expect(onTabChange).toHaveBeenCalledWith('tab2');
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <Tabs tabs={mockTabs} style={customStyle} testID="tabs" />
    );

    const container = getByTestId('tabs');
    expect(container.props.style).toContain(customStyle);
  });

  it('renders with empty tabs array', () => {
    const { getByTestId } = render(<Tabs tabs={[]} testID="tabs" />);
    expect(getByTestId('tabs')).toBeTruthy();
  });
}); 
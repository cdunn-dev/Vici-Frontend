import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Table } from '../Table';
import { useTheme } from "@/theme/useTheme";

// Mock the useTheme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      primary: '#5224EF',
      secondary: '#4318C9',
      accent: '#E0D8FD',
      success: '#16A34A',
      error: '#DC2626',
      warning: '#F59E0B',
      background: '#F9FAFB',
      text: '#11182C',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      backgroundAlt: '#F3F4F6',
    },
    typography: {
      fontSize: {
        sm: 14,
        md: 16,
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
    },
  })),
}));

describe('Table', () => {
  const mockData = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 },
  ];

  const mockColumns = [
    { key: 'id', title: 'ID', sortable: true },
    { key: 'name', title: 'Name', sortable: true },
    { key: 'age', title: 'Age', sortable: true },
  ];

  it('renders correctly with data', () => {
    const { getByText } = render(
      <Table data={mockData} columns={mockColumns} />
    );

    expect(getByText('ID')).toBeTruthy();
    expect(getByText('Name')).toBeTruthy();
    expect(getByText('Age')).toBeTruthy();
    expect(getByText('John')).toBeTruthy();
    expect(getByText('Jane')).toBeTruthy();
    expect(getByText('30')).toBeTruthy();
    expect(getByText('25')).toBeTruthy();
  });

  it('renders empty state when no data', () => {
    const { getByText } = render(
      <Table data={[]} columns={mockColumns} />
    );

    expect(getByText('No data available')).toBeTruthy();
  });

  it('renders custom empty state', () => {
    const customEmptyState = <Text>Custom empty state</Text>;
    const { getByText } = render(
      <Table data={[]} columns={mockColumns} emptyState={customEmptyState} />
    );

    expect(getByText('Custom empty state')).toBeTruthy();
  });

  it('handles sorting', () => {
    const onSort = jest.fn();
    const { getByText } = render(
      <Table
        data={mockData}
        columns={mockColumns}
        onSort={onSort}
        sortKey="id"
        sortDirection="asc"
      />
    );

    fireEvent.press(getByText('ID'));
    expect(onSort).toHaveBeenCalledWith('id', 'desc');

    fireEvent.press(getByText('Name'));
    expect(onSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <Table
        data={mockData}
        columns={mockColumns}
        style={customStyle}
        testID="table"
      />
    );

    const table = getByTestId('table');
    expect(table.props.style).toContain(customStyle);
  });

  it('renders custom cell content', () => {
    const columnsWithRender = [
      ...mockColumns,
      {
        key: 'custom',
        title: 'Custom',
        render: (item: any) => <Text>Custom {item.name}</Text>,
      },
    ];

    const { getByText } = render(
      <Table data={mockData} columns={columnsWithRender} />
    );

    expect(getByText('Custom John')).toBeTruthy();
    expect(getByText('Custom Jane')).toBeTruthy();
  });
}); 
import React from 'react';
import { render } from '@testing-library/react-native';
import { Chart } from '../Chart';
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
    },
    typography: {
      fontSize: {
        bodySmall: 12,
        bodyMedium: 14,
        bodyLarge: 16,
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
  })),
}));

describe('Chart Component', () => {
  const mockData = [
    { x: 1, y: 10, label: 'Point 1' },
    { x: 2, y: 20, label: 'Point 2' },
    { x: 3, y: 30, label: 'Point 3' },
  ];

  it('renders line chart correctly', () => {
    const { getByTestId } = render(
      <Chart data={mockData} type="line" testID="chart" />
    );
    expect(getByTestId('chart')).toBeTruthy();
  });

  it('renders bar chart correctly', () => {
    const { getByTestId } = render(
      <Chart data={mockData} type="bar" testID="chart" />
    );
    expect(getByTestId('chart')).toBeTruthy();
  });

  it('renders pie chart correctly', () => {
    const { getByTestId } = render(
      <Chart data={mockData} type="pie" testID="chart" />
    );
    expect(getByTestId('chart')).toBeTruthy();
  });

  it('renders scatter plot correctly', () => {
    const { getByTestId } = render(
      <Chart data={mockData} type="scatter" testID="chart" />
    );
    expect(getByTestId('chart')).toBeTruthy();
  });

  it('renders with custom title', () => {
    const { getByText } = render(
      <Chart data={mockData} type="line" title="Custom Title" />
    );
    expect(getByText('Custom Title')).toBeTruthy();
  });

  it('renders with custom dimensions', () => {
    const { getByTestId } = render(
      <Chart
        data={mockData}
        type="line"
        width={300}
        height={150}
        testID="chart"
      />
    );
    const chart = getByTestId('chart');
    expect(chart.props.style.width).toBe(300);
    expect(chart.props.style.height).toBe(150);
  });

  it('renders with custom color', () => {
    const { getByTestId } = render(
      <Chart
        data={mockData}
        type="line"
        color="#FF0000"
        testID="chart"
      />
    );
    expect(getByTestId('chart')).toBeTruthy();
  });

  it('renders with grid disabled', () => {
    const { getByTestId } = render(
      <Chart
        data={mockData}
        type="line"
        showGrid={false}
        testID="chart"
      />
    );
    expect(getByTestId('chart')).toBeTruthy();
  });

  it('renders with labels disabled', () => {
    const { getByTestId } = render(
      <Chart
        data={mockData}
        type="line"
        showLabels={false}
        testID="chart"
      />
    );
    expect(getByTestId('chart')).toBeTruthy();
  });

  it('renders with legend disabled', () => {
    const { getByTestId } = render(
      <Chart
        data={mockData}
        type="line"
        showLegend={false}
        testID="chart"
      />
    );
    expect(getByTestId('chart')).toBeTruthy();
  });
}); 
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PerformanceMonitor } from '../components/PerformanceMonitor';
import { performanceMonitor } from '../utils/performance';

jest.mock('../utils/performance', () => ({
  performanceMonitor: {
    getMetrics: jest.fn(),
  },
}));

jest.mock('../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#000000',
      textSecondary: '#666666',
    },
  }),
}));

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    (performanceMonitor.getMetrics as jest.Mock).mockReturnValue({
      appStartTime: Date.now() - 1000,
      screenLoadTimes: {
        'Home': 200,
        'Profile': 150,
      },
      apiResponseTimes: {
        '/api/user': [100, 150, 200],
        '/api/settings': [50, 75, 100],
      },
      memoryUsage: [50, 55, 60],
      lastUpdate: Date.now(),
    });
  });

  it('renders app performance metrics', () => {
    render(<PerformanceMonitor />);
    
    expect(screen.getByText('App Performance')).toBeTruthy();
    expect(screen.getByText('Uptime')).toBeTruthy();
    expect(screen.getByText('Last Update')).toBeTruthy();
  });

  it('renders screen load times', () => {
    render(<PerformanceMonitor />);
    
    expect(screen.getByText('Screen Load Times')).toBeTruthy();
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Profile')).toBeTruthy();
  });

  it('renders API response times', () => {
    render(<PerformanceMonitor />);
    
    expect(screen.getByText('API Response Times')).toBeTruthy();
    expect(screen.getByText('/api/user')).toBeTruthy();
    expect(screen.getByText('/api/settings')).toBeTruthy();
  });

  it('renders memory usage', () => {
    render(<PerformanceMonitor />);
    
    expect(screen.getByText('Memory Usage')).toBeTruthy();
    expect(screen.getByText('Current')).toBeTruthy();
    expect(screen.getByText('Average')).toBeTruthy();
  });
}); 
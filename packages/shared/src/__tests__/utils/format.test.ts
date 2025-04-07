import { formatDate } from '@/utils/format';

describe('formatDate', () => {
  it('should format date with default format', () => {
    const date = new Date('2024-04-05');
    expect(formatDate(date)).toBe('2024-04-05');
  });

  it('should format date with custom format', () => {
    const date = new Date('2024-04-05');
    expect(formatDate(date, 'DD/MM/YYYY')).toBe('05/04/2024');
  });

  it('should handle different dates', () => {
    const date1 = new Date('2024-01-01');
    const date2 = new Date('2024-12-31');
    
    expect(formatDate(date1)).toBe('2024-01-01');
    expect(formatDate(date2)).toBe('2024-12-31');
  });
}); 
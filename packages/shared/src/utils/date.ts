/**
 * Date utility functions
 */

/**
 * Check if a date is today
 * @param date - The date to check
 * @returns True if the date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a date is in the past
 * @param date - The date to check
 * @returns True if the date is in the past
 */
export const isPast = (date: Date): boolean => {
  return date.getTime() < new Date().getTime();
};

/**
 * Check if a date is in the future
 * @param date - The date to check
 * @returns True if the date is in the future
 */
export const isFuture = (date: Date): boolean => {
  return date.getTime() > new Date().getTime();
};

/**
 * Add days to a date
 * @param date - The date to add days to
 * @param days - The number of days to add
 * @returns New date with added days
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(date.getDate() + days);
  return result;
};

/**
 * Add months to a date
 * @param date - The date to add months to
 * @param months - The number of months to add
 * @returns New date with added months
 */
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(date.getMonth() + months);
  return result;
};

/**
 * Add years to a date
 * @param date - The date to add years to
 * @param years - The number of years to add
 * @returns New date with added years
 */
export const addYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(date.getFullYear() + years);
  return result;
};

/**
 * Get the start of day for a date
 * @param date - The input date
 * @returns Date set to the start of the day (00:00:00)
 */
export const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Get the end of day for a date
 * @param date - The input date
 * @returns Date set to the end of the day (23:59:59)
 */
export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Get the start of month for a date
 * @param date - The input date
 * @returns Date set to the first day of the month
 */
export const startOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Get the end of month for a date
 * @param date - The input date
 * @returns Date set to the last day of the month
 */
export const endOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setMonth(date.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Get the difference in days between two dates
 * @param dateLeft - The first date
 * @param dateRight - The second date
 * @returns The number of days between dates
 */
export const differenceInDays = (dateLeft: Date, dateRight: Date): number => {
  const timeDiff = Math.abs(dateLeft.getTime() - dateRight.getTime());
  return Math.floor(timeDiff / (1000 * 3600 * 24));
};

/**
 * Format relative time (e.g., "5 minutes ago", "in 3 days")
 * @param date - The date to format
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 0) {
    // Past
    if (diffInSeconds > -60) return `${Math.abs(diffInSeconds)} seconds ago`;
    if (diffInMinutes > -60) return `${Math.abs(diffInMinutes)} minutes ago`;
    if (diffInHours > -24) return `${Math.abs(diffInHours)} hours ago`;
    if (diffInDays > -7) return `${Math.abs(diffInDays)} days ago`;
    return formatDate(date);
  } else {
    // Future
    if (diffInSeconds < 60) return `in ${diffInSeconds} seconds`;
    if (diffInMinutes < 60) return `in ${diffInMinutes} minutes`;
    if (diffInHours < 24) return `in ${diffInHours} hours`;
    if (diffInDays < 7) return `in ${diffInDays} days`;
    return formatDate(date);
  }
};

/**
 * Parse a date string in ISO format
 * @param dateString - ISO date string to parse
 * @returns Parsed Date object
 */
export const parseISO = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Format a date using the browser's locale
 * @param date - The date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export const formatLocale = (
  date: Date,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
): string => {
  return new Intl.DateTimeFormat(undefined, options).format(date);
};

/**
 * Format a date to a string
 * @param date - The date to format
 * @param format - The format string (default: 'YYYY-MM-DD')
 * @returns Formatted date string
 */
export const formatDate = (date: Date, format: string = 'YYYY-MM-DD'): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}; 
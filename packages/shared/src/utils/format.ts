/**
 * Format utility functions
 */

/**
 * Format a date to a human-readable string
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

/**
 * Format a number as currency
 * @param value - The number to format
 * @param currency - The currency code (default: 'USD')
 * @param locale - The locale (default: undefined, uses browser default)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number,
  currency: string = 'USD',
  locale?: string
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
};

/**
 * Format a number with thousand separators
 * @param value - The number to format
 * @param decimalPlaces - The number of decimal places (default: 2)
 * @param locale - The locale (default: undefined, uses browser default)
 * @returns Formatted number string
 */
export const formatNumber = (
  value: number,
  decimalPlaces: number = 2,
  locale?: string
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
};

/**
 * Format a number as a percentage
 * @param value - The number to format (0-1)
 * @param decimalPlaces - The number of decimal places (default: 0)
 * @param locale - The locale (default: undefined, uses browser default)
 * @returns Formatted percentage string
 */
export const formatPercent = (
  value: number,
  decimalPlaces: number = 0,
  locale?: string
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
};

/**
 * Format a file size in bytes to a human-readable format
 * @param bytes - The file size in bytes
 * @param decimals - The number of decimal places (default: 2)
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Format a duration in seconds to a human-readable string
 * @param seconds - The duration in seconds
 * @param includeSeconds - Whether to include seconds in the output (default: true)
 * @returns Formatted duration string
 */
export const formatDuration = (seconds: number, includeSeconds: boolean = true): string => {
  if (seconds < 0) return '';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`);
  }

  if (includeSeconds && (remainingSeconds > 0 || (hours === 0 && minutes === 0))) {
    parts.push(`${remainingSeconds}s`);
  }

  return parts.join(' ');
};

/**
 * Format a phone number
 * @param phoneNumber - The phone number to format
 * @param format - The format string (default: '(XXX) XXX-XXXX')
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (
  phoneNumber: string,
  format: string = '(XXX) XXX-XXXX'
): string => {
  const digits = phoneNumber.replace(/\D/g, '');
  let result = format;

  for (let i = 0; i < digits.length && result.includes('X'); i++) {
    result = result.replace('X', digits[i]);
  }

  // Remove any remaining placeholder characters
  result = result.replace(/X/g, '');

  return result;
};

/**
 * Capitalize the first letter of a string
 * @param text - The string to capitalize
 * @returns Capitalized string
 */
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Truncate a string to a specified length
 * @param text - The string to truncate
 * @param maxLength - The maximum length
 * @param suffix - The suffix to add when truncated (default: '...')
 * @returns Truncated string
 */
export const truncate = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
};

/**
 * Format a distance in meters to a human-readable format
 * @param meters - The distance in meters
 * @param useImperial - Whether to use imperial units (default: false)
 * @returns Formatted distance string
 */
export const formatDistance = (meters: number, useImperial: boolean = false): string => {
  if (useImperial) {
    // Convert to miles
    const miles = meters / 1609.344;
    
    if (miles < 0.1) {
      const feet = Math.round(meters * 3.28084);
      return `${feet} ft`;
    } else {
      return `${formatNumber(miles, 1)} mi`;
    }
  } else {
    // Use metric
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      const km = meters / 1000;
      return `${formatNumber(km, 1)} km`;
    }
  }
};

/**
 * Format a pace (minutes per kilometer/mile)
 * @param secondsPerKm - The pace in seconds per kilometer
 * @param useImperial - Whether to use imperial units (default: false)
 * @returns Formatted pace string
 */
export const formatPace = (secondsPerKm: number, useImperial: boolean = false): string => {
  let seconds = secondsPerKm;
  
  if (useImperial) {
    // Convert to minutes per mile
    seconds = secondsPerKm * 1.60934;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  const unit = useImperial ? 'mi' : 'km';
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}/` + unit;
}; 
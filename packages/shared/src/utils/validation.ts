/**
 * Validation utility functions
 */

/**
 * Check if a value is defined (not undefined and not null)
 * @param value - The value to check
 * @returns True if the value is defined
 */
export const isDefined = <T>(value: T | undefined | null): value is T => {
  return value !== undefined && value !== null;
};

/**
 * Check if a string is empty
 * @param value - The string to check
 * @returns True if the string is empty or only whitespace
 */
export const isEmpty = (value: string): boolean => {
  return !value || value.trim() === '';
};

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

/**
 * Check if a string is a valid email address
 * @param email - The email string to validate
 * @returns True if the email is valid
 */
export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

/**
 * Password validation regex (min 8 chars, at least one letter and one number)
 */
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

/**
 * Check if a string is a valid password
 * @param password - The password string to validate
 * @returns True if the password is valid
 */
export const isValidPassword = (password: string): boolean => {
  return PASSWORD_REGEX.test(password);
};

/**
 * URL validation regex
 */
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

/**
 * Check if a string is a valid URL
 * @param url - The URL string to validate
 * @returns True if the URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  return URL_REGEX.test(url);
};

/**
 * Check if a value is a number
 * @param value - The value to check
 * @returns True if the value is a number
 */
export const isNumber = (value: any): boolean => {
  return typeof value === 'number' && !isNaN(value);
};

/**
 * Check if a value is a boolean
 * @param value - The value to check
 * @returns True if the value is a boolean
 */
export const isBoolean = (value: any): boolean => {
  return typeof value === 'boolean';
};

/**
 * Check if a value is a string
 * @param value - The value to check
 * @returns True if the value is a string
 */
export const isString = (value: any): boolean => {
  return typeof value === 'string';
};

/**
 * Check if a value is a function
 * @param value - The value to check
 * @returns True if the value is a function
 */
export const isFunction = (value: any): boolean => {
  return typeof value === 'function';
};

/**
 * Check if a value is an object
 * @param value - The value to check
 * @returns True if the value is an object (and not null)
 */
export const isObject = (value: any): boolean => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

/**
 * Check if a value is an array
 * @param value - The value to check
 * @returns True if the value is an array
 */
export const isArray = (value: any): boolean => {
  return Array.isArray(value);
};

/**
 * Check if a string contains only alphanumeric characters
 * @param value - The string to check
 * @returns True if the string contains only alphanumeric characters
 */
export const isAlphanumeric = (value: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(value);
};

/**
 * Check if a date is valid
 * @param date - The date to check
 * @returns True if the date is valid
 */
export const isValidDate = (date: Date): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Check if a string is a valid date string
 * @param dateString - The date string to check
 * @returns True if the string can be parsed to a valid date
 */
export const isValidDateString = (dateString: string): boolean => {
  const date = new Date(dateString);
  return isValidDate(date);
};

/**
 * Check if a value is within a range
 * @param value - The value to check
 * @param min - The minimum value
 * @param max - The maximum value
 * @returns True if the value is within the range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Check if all elements in an array pass a validation function
 * @param array - The array to check
 * @param validationFn - The validation function to apply to each element
 * @returns True if all elements pass the validation
 */
export const validateArray = <T>(
  array: T[], 
  validationFn: (item: T) => boolean
): boolean => {
  if (!isArray(array)) return false;
  return array.every(validationFn);
};

/**
 * Check if an object has all required properties
 * @param obj - The object to check
 * @param requiredProps - Array of required property names
 * @returns True if the object has all required properties
 */
export const hasRequiredProps = (
  obj: Record<string, any>, 
  requiredProps: string[]
): boolean => {
  if (!isObject(obj)) return false;
  return requiredProps.every(prop => isDefined(obj[prop]));
}; 
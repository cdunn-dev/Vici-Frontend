import { Validator, ValidationResult } from './useForm';

/**
 * Required field validator
 * @param errorMessage Custom error message
 * @returns Validator function
 */
export function required<T>(errorMessage = 'This field is required'): Validator<T> {
  return (value: T): ValidationResult => {
    // Check for various empty values
    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0);

    return {
      isValid: !isEmpty,
      errorMessage: isEmpty ? errorMessage : undefined,
    };
  };
}

/**
 * Minimum length validator
 * @param min Minimum length
 * @param errorMessage Custom error message
 * @returns Validator function
 */
export function minLength(min: number, errorMessage?: string): Validator<string> {
  return (value: string): ValidationResult => {
    const isValid = value.length >= min;
    return {
      isValid,
      errorMessage: isValid ? undefined : errorMessage || `Must be at least ${min} characters`,
    };
  };
}

/**
 * Maximum length validator
 * @param max Maximum length
 * @param errorMessage Custom error message
 * @returns Validator function
 */
export function maxLength(max: number, errorMessage?: string): Validator<string> {
  return (value: string): ValidationResult => {
    const isValid = value.length <= max;
    return {
      isValid,
      errorMessage: isValid ? undefined : errorMessage || `Must be no more than ${max} characters`,
    };
  };
}

/**
 * Email validator
 * @param errorMessage Custom error message
 * @returns Validator function
 */
export function email(errorMessage = 'Please enter a valid email address'): Validator<string> {
  return (value: string): ValidationResult => {
    // Basic email regex pattern
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailPattern.test(value);
    return {
      isValid,
      errorMessage: isValid ? undefined : errorMessage,
    };
  };
}

/**
 * Number validator
 * @param errorMessage Custom error message
 * @returns Validator function
 */
export function isNumber(errorMessage = 'Please enter a valid number'): Validator<string> {
  return (value: string): ValidationResult => {
    const isValid = !isNaN(Number(value));
    return {
      isValid,
      errorMessage: isValid ? undefined : errorMessage,
    };
  };
}

/**
 * Minimum value validator
 * @param min Minimum value
 * @param errorMessage Custom error message
 * @returns Validator function
 */
export function min(min: number, errorMessage?: string): Validator<number> {
  return (value: number): ValidationResult => {
    const isValid = value >= min;
    return {
      isValid,
      errorMessage: isValid ? undefined : errorMessage || `Must be at least ${min}`,
    };
  };
}

/**
 * Maximum value validator
 * @param max Maximum value
 * @param errorMessage Custom error message
 * @returns Validator function
 */
export function max(max: number, errorMessage?: string): Validator<number> {
  return (value: number): ValidationResult => {
    const isValid = value <= max;
    return {
      isValid,
      errorMessage: isValid ? undefined : errorMessage || `Must be no more than ${max}`,
    };
  };
}

/**
 * Pattern validator
 * @param pattern Regex pattern
 * @param errorMessage Custom error message
 * @returns Validator function
 */
export function pattern(pattern: RegExp, errorMessage = 'Invalid format'): Validator<string> {
  return (value: string): ValidationResult => {
    const isValid = pattern.test(value);
    return {
      isValid,
      errorMessage: isValid ? undefined : errorMessage,
    };
  };
}

/**
 * Match validator (e.g., password confirmation)
 * @param fieldToMatch Field name to match against
 * @param errorMessage Custom error message
 * @returns Validator function
 */
export function matches(fieldToMatch: string, errorMessage?: string): Validator<string> {
  return (value: string, formValues: Record<string, any>): ValidationResult => {
    const isValid = value === formValues[fieldToMatch];
    return {
      isValid,
      errorMessage: isValid ? undefined : errorMessage || `Must match ${fieldToMatch}`,
    };
  };
}

/**
 * Custom validator
 * @param validatorFn Custom validation function
 * @param errorMessage Custom error message
 * @returns Validator function
 */
export function custom<T>(
  validatorFn: (value: T, formValues: Record<string, any>) => boolean,
  errorMessage = 'Invalid value'
): Validator<T> {
  return (value: T, formValues: Record<string, any>): ValidationResult => {
    const isValid = validatorFn(value, formValues);
    return {
      isValid,
      errorMessage: isValid ? undefined : errorMessage,
    };
  };
}

/**
 * Password strength validator
 * @param errorMessage Custom error message
 * @returns Validator function
 */
export function passwordStrength(
  errorMessage = 'Password must include uppercase, lowercase, number, and symbol'
): Validator<string> {
  return (value: string): ValidationResult => {
    // Password should contain at least:
    // 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character
    const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;
    const isValid = strongPasswordPattern.test(value);
    return {
      isValid,
      errorMessage: isValid ? undefined : errorMessage,
    };
  };
} 
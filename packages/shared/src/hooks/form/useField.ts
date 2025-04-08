import { useState, useCallback } from 'react';
import { ValidationResult, Validator } from './useForm';

/**
 * Field options
 */
export interface FieldOptions<T> {
  initialValue: T;
  validators?: Validator<T>[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

/**
 * Field state
 */
export interface FieldState<T> {
  value: T;
  touched: boolean;
  dirty: boolean;
  errors: string[];
  isValid: boolean;
}

/**
 * Field handler for controlled components
 */
export interface FieldHandler<T> {
  value: T;
  onChange: (value: T) => void;
  onBlur: () => void;
  name: string;
  error: string | undefined;
  hasError: boolean;
  isTouched: boolean;
  isDirty: boolean;
}

/**
 * UseField hook result
 */
export interface UseFieldResult<T> {
  value: T;
  setValue: (value: T) => void;
  touched: boolean;
  setTouched: (touched: boolean) => void;
  errors: string[];
  isValid: boolean;
  isDirty: boolean;
  reset: () => void;
  validate: () => boolean;
  handler: FieldHandler<T>;
}

/**
 * Hook for managing a single form field
 */
export function useField<T>(
  name: string,
  options: FieldOptions<T>
): UseFieldResult<T> {
  // Destructure options with defaults
  const {
    initialValue,
    validators = [],
    validateOnChange = false,
    validateOnBlur = true
  } = options;

  // Field state
  const [state, setState] = useState<FieldState<T>>({
    value: initialValue,
    touched: false,
    dirty: false,
    errors: [],
    isValid: true
  });

  // Validate the field value
  const validate = useCallback(
    (value: T): string[] => {
      if (validators.length === 0) {
        return [];
      }

      // Run all validators
      const errors = validators
        .map(validator => validator(value, {}))
        .filter(result => !result.isValid)
        .map(result => result.errorMessage || 'Invalid value');

      return errors;
    },
    [validators]
  );

  // Set field value
  const setValue = useCallback(
    (value: T) => {
      const errors = validateOnChange ? validate(value) : state.errors;
      
      setState(prev => ({
        ...prev,
        value,
        dirty: value !== initialValue,
        errors,
        isValid: errors.length === 0
      }));
    },
    [initialValue, state.errors, validate, validateOnChange]
  );

  // Set touched state
  const setTouched = useCallback(
    (touched: boolean) => {
      if (touched && validateOnBlur && !state.touched) {
        const errors = validate(state.value);
        
        setState(prev => ({
          ...prev,
          touched,
          errors,
          isValid: errors.length === 0
        }));
      } else {
        setState(prev => ({
          ...prev,
          touched
        }));
      }
    },
    [state.touched, state.value, validate, validateOnBlur]
  );

  // Reset the field to initial state
  const reset = useCallback(() => {
    setState({
      value: initialValue,
      touched: false,
      dirty: false,
      errors: [],
      isValid: true
    });
  }, [initialValue]);

  // Validate the field
  const validateField = useCallback(() => {
    const errors = validate(state.value);
    
    setState(prev => ({
      ...prev,
      errors,
      isValid: errors.length === 0
    }));
    
    return errors.length === 0;
  }, [state.value, validate]);

  // Field handlers for controlled components
  const handler: FieldHandler<T> = {
    value: state.value,
    onChange: (value: T) => {
      setValue(value);
      if (!state.touched) {
        setTouched(true);
      }
    },
    onBlur: () => {
      setTouched(true);
    },
    name,
    error: state.errors[0],
    hasError: state.touched && state.errors.length > 0,
    isTouched: state.touched,
    isDirty: state.dirty
  };

  return {
    value: state.value,
    setValue,
    touched: state.touched,
    setTouched,
    errors: state.errors,
    isValid: state.isValid,
    isDirty: state.dirty,
    reset,
    validate: validateField,
    handler
  };
} 
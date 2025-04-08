import { useState, useCallback, useEffect } from 'react';

/**
 * Form field validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validator function type
 */
export type Validator<T> = (value: T, formValues: Record<string, any>) => ValidationResult;

/**
 * Form field configuration
 */
export interface FieldConfig<T> {
  initialValue: T;
  validators?: Validator<T>[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

/**
 * Form field state
 */
export interface FieldState<T> {
  value: T;
  touched: boolean;
  dirty: boolean;
  errors: string[];
  isValid: boolean;
}

/**
 * Form state
 */
export interface FormState {
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  errors: Record<string, string[]>;
}

/**
 * Form field methods
 */
export interface FieldMethods<T> {
  setValue: (value: T) => void;
  setTouched: (touched?: boolean) => void;
  reset: () => void;
  validate: () => boolean;
  onBlur: () => void;
  onChange: (value: T) => void;
}

/**
 * Form methods
 */
export interface FormMethods {
  reset: () => void;
  validate: () => boolean;
  setValues: (values: Record<string, any>) => void;
  handleSubmit: (onSubmit: (values: Record<string, any>) => void) => (e?: React.FormEvent) => void;
}

/**
 * Form hook result
 */
export interface UseFormResult<T extends Record<string, any>> {
  formState: FormState;
  fields: Record<keyof T, FieldState<any> & FieldMethods<any>>;
  reset: () => void;
  validate: () => boolean;
  setValues: (values: Partial<T>) => void;
  values: T;
  handleSubmit: (onSubmit: (values: T) => void) => (e?: React.FormEvent) => void;
}

/**
 * Custom hook for form management
 */
export function useForm<T extends Record<string, any>>(
  fieldConfigs: Record<keyof T, FieldConfig<any>>
): UseFormResult<T> {
  // Initialize field states
  const initialFieldStates = Object.entries(fieldConfigs).reduce(
    (acc, [name, config]) => {
      acc[name] = {
        value: config.initialValue,
        touched: false,
        dirty: false,
        errors: [],
        isValid: true
      };
      return acc;
    },
    {} as Record<string, FieldState<any>>
  );

  // State for field states
  const [fieldStates, setFieldStates] = useState<Record<string, FieldState<any>>>(initialFieldStates);

  // Function to validate a specific field
  const validateField = useCallback(
    (name: string, value: any): string[] => {
      const config = fieldConfigs[name as keyof T];
      if (!config.validators || config.validators.length === 0) {
        return [];
      }

      // Get current form values
      const formValues = Object.entries(fieldStates).reduce(
        (acc, [fieldName, state]) => {
          acc[fieldName] = fieldName === name ? value : state.value;
          return acc;
        },
        {} as Record<string, any>
      );

      // Run all validators for the field
      const errors = config.validators
        .map(validator => validator(value, formValues))
        .filter(result => !result.isValid)
        .map(result => result.errorMessage || 'Invalid value');

      return errors;
    },
    [fieldConfigs, fieldStates]
  );

  // Update a field's state
  const updateFieldState = useCallback(
    (name: string, updates: Partial<FieldState<any>>) => {
      setFieldStates(prev => ({
        ...prev,
        [name]: {
          ...prev[name],
          ...updates
        }
      }));
    },
    []
  );

  // Field methods for each field
  const fieldMethods = useCallback(
    (name: string): FieldMethods<any> => {
      return {
        setValue: (value: any) => {
          const config = fieldConfigs[name as keyof T];
          const errors = config.validateOnChange ? validateField(name, value) : fieldStates[name].errors;
          
          updateFieldState(name, {
            value,
            dirty: value !== fieldConfigs[name as keyof T].initialValue,
            errors,
            isValid: errors.length === 0
          });
        },
        setTouched: (touched = true) => {
          const config = fieldConfigs[name as keyof T];
          const value = fieldStates[name].value;
          const errors = config.validateOnBlur && touched ? validateField(name, value) : fieldStates[name].errors;
          
          updateFieldState(name, {
            touched,
            errors,
            isValid: errors.length === 0
          });
        },
        reset: () => {
          const config = fieldConfigs[name as keyof T];
          updateFieldState(name, {
            value: config.initialValue,
            touched: false,
            dirty: false,
            errors: [],
            isValid: true
          });
        },
        validate: () => {
          const value = fieldStates[name].value;
          const errors = validateField(name, value);
          
          updateFieldState(name, {
            errors,
            isValid: errors.length === 0
          });
          
          return errors.length === 0;
        },
        onBlur: () => {
          const config = fieldConfigs[name as keyof T];
          if (config.validateOnBlur) {
            const value = fieldStates[name].value;
            const errors = validateField(name, value);
            
            updateFieldState(name, {
              touched: true,
              errors,
              isValid: errors.length === 0
            });
          } else {
            updateFieldState(name, {
              touched: true
            });
          }
        },
        onChange: (value: any) => {
          const config = fieldConfigs[name as keyof T];
          const errors = config.validateOnChange ? validateField(name, value) : fieldStates[name].errors;
          
          updateFieldState(name, {
            value,
            dirty: value !== fieldConfigs[name as keyof T].initialValue,
            touched: true,
            errors,
            isValid: errors.length === 0
          });
        }
      };
    },
    [fieldConfigs, fieldStates, validateField, updateFieldState]
  );

  // Build fields with state and methods
  const fields = Object.keys(fieldConfigs).reduce(
    (acc, name) => {
      acc[name] = {
        ...fieldStates[name],
        ...fieldMethods(name)
      };
      return acc;
    },
    {} as Record<string, FieldState<any> & FieldMethods<any>>
  );

  // Calculate overall form state
  const formState: FormState = {
    isValid: Object.values(fieldStates).every(state => state.isValid),
    isDirty: Object.values(fieldStates).some(state => state.dirty),
    isTouched: Object.values(fieldStates).some(state => state.touched),
    errors: Object.entries(fieldStates).reduce(
      (acc, [name, state]) => {
        if (state.errors.length > 0) {
          acc[name] = state.errors;
        }
        return acc;
      },
      {} as Record<string, string[]>
    )
  };

  // Form methods
  const reset = useCallback(() => {
    Object.keys(fieldConfigs).forEach(name => {
      fieldMethods(name).reset();
    });
  }, [fieldConfigs, fieldMethods]);

  const validate = useCallback(() => {
    let isValid = true;
    
    Object.keys(fieldConfigs).forEach(name => {
      const fieldValid = fieldMethods(name).validate();
      if (!fieldValid) {
        isValid = false;
      }
    });
    
    return isValid;
  }, [fieldConfigs, fieldMethods]);

  const setValues = useCallback(
    (values: Partial<T>) => {
      Object.entries(values).forEach(([name, value]) => {
        if (name in fieldConfigs) {
          fieldMethods(name as string).setValue(value);
        }
      });
    },
    [fieldConfigs, fieldMethods]
  );

  // Current form values
  const values = Object.entries(fieldStates).reduce(
    (acc, [name, state]) => {
      acc[name] = state.value;
      return acc;
    },
    {} as T
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void) => (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      
      const isValid = validate();
      if (isValid) {
        onSubmit(values);
      }
    },
    [validate, values]
  );

  return {
    formState,
    fields,
    reset,
    validate,
    setValues,
    values,
    handleSubmit
  };
} 
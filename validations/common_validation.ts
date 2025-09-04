// Common validation utilities and types

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FieldValidation {
  field: string;
  isValid: boolean;
  error?: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: FieldValidation[];
}

// Common validation functions
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return {
      isValid: false,
      error: `${fieldName} is required`
    };
  }
  return { isValid: true };
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): ValidationResult => {
  if (value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters long`
    };
  }
  return { isValid: true };
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): ValidationResult => {
  if (value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must not exceed ${maxLength} characters`
    };
  }
  return { isValid: true };
};

export const validatePattern = (value: string, pattern: RegExp, fieldName: string, errorMessage: string): ValidationResult => {
  if (!pattern.test(value)) {
    return {
      isValid: false,
      error: errorMessage
    };
  }
  return { isValid: true };
};

// Phone number validation patterns
export const PHONE_PATTERNS = {
  // Nigerian phone numbers (10 digits starting with 0)
  NIGERIA: /^0[789][01]\d{8}$/,
  // International format
  INTERNATIONAL: /^\+234[789][01]\d{8}$/,
  // General 10-digit format
  GENERAL: /^\d{10}$/
};

// Common error messages
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters long',
  PASSWORD_TOO_LONG: 'Password must not exceed 50 characters',
  PHONE_TOO_SHORT: 'Phone number must be 10 digits',
  PHONE_TOO_LONG: 'Phone number must not exceed 10 digits',
  INVALID_FORMAT: 'Invalid format'
};

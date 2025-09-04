import { 
  ValidationResult, 
  FieldValidation, 
  FormValidation,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validatePattern,
  PHONE_PATTERNS,
  ERROR_MESSAGES
} from './common_validation';

// Re-export FieldValidation for external use
export type { FieldValidation };

// Login form data interface
export interface LoginFormData {
  phoneNumber: string;
  password: string;
}

// Individual field validation functions
export const validatePhoneNumber = (phoneNumber: string): ValidationResult => {
  // Remove any spaces or special characters
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Check if required
  const requiredCheck = validateRequired(cleanPhone, 'Phone number');
  if (!requiredCheck.isValid) {
    return requiredCheck;
  }
  
  // Check length (9 digits for Ethiopian numbers after +251)
  if (cleanPhone.length !== 9) {
    return {
      isValid: false,
      error: 'Phone number must be exactly 9 digits'
    };
  }
  
  // Check if it starts with 9 (Ethiopian mobile numbers)
  if (!cleanPhone.startsWith('9')) {
    return {
      isValid: false,
      error: 'Phone number must start with 9'
    };
  }
  
  // Validate Ethiopian mobile number pattern
  const ethiopianPattern = /^9[0-9]{8}$/;
  if (!ethiopianPattern.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'Please enter a valid Ethiopian mobile number'
    };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  // Check if required
  const requiredCheck = validateRequired(password, 'Password');
  if (!requiredCheck.isValid) {
    return requiredCheck;
  }
  
  // Check minimum length
  const minLengthCheck = validateMinLength(password, 6, 'Password');
  if (!minLengthCheck.isValid) {
    return minLengthCheck;
  }
  
  // Check maximum length
  const maxLengthCheck = validateMaxLength(password, 50, 'Password');
  if (!maxLengthCheck.isValid) {
    return maxLengthCheck;
  }
  
  return { isValid: true };
};

// Complete form validation
export const validateLoginForm = (formData: LoginFormData): FormValidation => {
  const errors: FieldValidation[] = [];
  
  // Validate phone number
  const phoneValidation = validatePhoneNumber(formData.phoneNumber);
  if (!phoneValidation.isValid) {
    errors.push({
      field: 'phoneNumber',
      isValid: false,
      error: phoneValidation.error
    });
  }
  
  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.push({
      field: 'password',
      isValid: false,
      error: passwordValidation.error
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Real-time validation for individual fields
export const validateLoginField = (field: keyof LoginFormData, value: string): ValidationResult => {
  switch (field) {
    case 'phoneNumber':
      return validatePhoneNumber(value);
    case 'password':
      return validatePassword(value);
    default:
      return { isValid: true };
  }
};

// Format phone number for display
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  if (cleanPhone.length === 9) {
    return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }
  
  return phoneNumber;
};

// Clean phone number for API calls
export const cleanPhoneNumber = (phoneNumber: string): string => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  // Return with +251 prefix for Ethiopian numbers
  return `+251${cleanPhone}`;
};

// Validation rules for form fields
export const LOGIN_VALIDATION_RULES = {
  phoneNumber: {
    required: true,
    minLength: 9,
    maxLength: 9,
    errorMessages: {
      required: 'Phone number is required',
      invalid: 'Please enter a valid Nigerian mobile number',
      length: 'Phone number must be exactly 10 digits'
    }
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 50,
    errorMessages: {
      required: 'Password is required',
      minLength: 'Password must be at least 6 characters long',
      maxLength: 'Password must not exceed 50 characters'
    }
  }
};

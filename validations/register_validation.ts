import { 
  ValidationResult, 
  FieldValidation, 
  FormValidation,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validatePattern,
  ERROR_MESSAGES
} from './common_validation';

// Register form data interface
export interface RegisterFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  otpCode: string;
}

// Individual field validation functions
export const validateFullName = (fullName: string): ValidationResult => {
  // Check if required
  const requiredCheck = validateRequired(fullName, 'Full name');
  if (!requiredCheck.isValid) {
    return requiredCheck;
  }
  
  // Check minimum length
  const minLengthCheck = validateMinLength(fullName, 2, 'Full name');
  if (!minLengthCheck.isValid) {
    return minLengthCheck;
  }
  
  // Check maximum length
  const maxLengthCheck = validateMaxLength(fullName, 50, 'Full name');
  if (!maxLengthCheck.isValid) {
    return maxLengthCheck;
  }
  
  // Check if it contains only letters and spaces
  const namePattern = /^[a-zA-Z\s]+$/;
  if (!namePattern.test(fullName)) {
    return {
      isValid: false,
      error: 'Full name can only contain letters and spaces'
    };
  }
  
  return { isValid: true };
};

export const validateRegisterPhoneNumber = (phoneNumber: string): ValidationResult => {
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

export const validateEmail = (email: string): ValidationResult => {
  // Email is optional, so if empty, it's valid
  if (!email || email.trim().length === 0) {
    return { isValid: true };
  }
  
  // Check email format
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }
  
  // Check maximum length
  const maxLengthCheck = validateMaxLength(email, 100, 'Email');
  if (!maxLengthCheck.isValid) {
    return maxLengthCheck;
  }
  
  return { isValid: true };
};

export const validateRegisterPassword = (password: string): ValidationResult => {
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
  const maxLengthCheck = validateMaxLength(password, 64, 'Password');
  if (!maxLengthCheck.isValid) {
    return maxLengthCheck;
  }
  
  // Check password strength (at least one letter and one number)
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      error: 'Password must contain at least one letter and one number'
    };
  }
  
  return { isValid: true };
};

export const validateOtpCode = (otpCode: string): ValidationResult => {
  // Check if required
  const requiredCheck = validateRequired(otpCode, 'OTP code');
  if (!requiredCheck.isValid) {
    return requiredCheck;
  }
  
  // Check if it's exactly 6 digits
  const otpPattern = /^[0-9]{6}$/;
  if (!otpPattern.test(otpCode)) {
    return {
      isValid: false,
      error: 'OTP code must be exactly 6 digits'
    };
  }
  
  return { isValid: true };
};

// Complete form validation for step 1 (basic info)
export const validateRegisterFormStep1 = (formData: Partial<RegisterFormData>): FormValidation => {
  const errors: FieldValidation[] = [];
  
  // Validate full name
  if (formData.fullName !== undefined) {
    const nameValidation = validateFullName(formData.fullName);
    if (!nameValidation.isValid) {
      errors.push({
        field: 'fullName',
        isValid: false,
        error: nameValidation.error
      });
    }
  }
  
  // Validate phone number
  if (formData.phoneNumber !== undefined) {
    const phoneValidation = validateRegisterPhoneNumber(formData.phoneNumber);
    if (!phoneValidation.isValid) {
      errors.push({
        field: 'phoneNumber',
        isValid: false,
        error: phoneValidation.error
      });
    }
  }
  
  // Validate email (optional)
  if (formData.email !== undefined) {
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.push({
        field: 'email',
        isValid: false,
        error: emailValidation.error
      });
    }
  }
  
  // Validate password
  if (formData.password !== undefined) {
    const passwordValidation = validateRegisterPassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.push({
        field: 'password',
        isValid: false,
        error: passwordValidation.error
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Complete form validation for step 2 (OTP verification)
export const validateRegisterFormStep2 = (formData: Partial<RegisterFormData>): FormValidation => {
  const errors: FieldValidation[] = [];
  
  // Validate OTP code
  if (formData.otpCode !== undefined) {
    const otpValidation = validateOtpCode(formData.otpCode);
    if (!otpValidation.isValid) {
      errors.push({
        field: 'otpCode',
        isValid: false,
        error: otpValidation.error
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Real-time validation for individual fields
export const validateRegisterField = (field: keyof RegisterFormData, value: string): ValidationResult => {
  switch (field) {
    case 'fullName':
      return validateFullName(value);
    case 'phoneNumber':
      return validateRegisterPhoneNumber(value);
    case 'email':
      return validateEmail(value);
    case 'password':
      return validateRegisterPassword(value);
    case 'otpCode':
      return validateOtpCode(value);
    default:
      return { isValid: true };
  }
};

// Format phone number for display
export const formatRegisterPhoneNumber = (phoneNumber: string): string => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  if (cleanPhone.length === 9) {
    return cleanPhone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  return phoneNumber;
};

// Clean phone number for API calls
export const cleanRegisterPhoneNumber = (phoneNumber: string): string => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  // Return with +251 prefix for Ethiopian numbers
  return `+251${cleanPhone}`;
};

// Validation rules for form fields
export const REGISTER_VALIDATION_RULES = {
  fullName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
    errorMessages: {
      required: 'Full name is required',
      minLength: 'Full name must be at least 2 characters long',
      maxLength: 'Full name must not exceed 50 characters',
      pattern: 'Full name can only contain letters and spaces'
    }
  },
  phoneNumber: {
    required: true,
    minLength: 9,
    maxLength: 9,
    pattern: /^9[0-9]{8}$/,
    errorMessages: {
      required: 'Phone number is required',
      length: 'Phone number must be exactly 9 digits',
      pattern: 'Please enter a valid Ethiopian mobile number'
    }
  },
  email: {
    required: false,
    maxLength: 100,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessages: {
      pattern: 'Please enter a valid email address',
      maxLength: 'Email must not exceed 100 characters'
    }
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 64,
    pattern: /^(?=.*[a-zA-Z])(?=.*[0-9]).+$/,
    errorMessages: {
      required: 'Password is required',
      minLength: 'Password must be at least 6 characters long',
      maxLength: 'Password must not exceed 64 characters',
      pattern: 'Password must contain at least one letter and one number'
    }
  },
  otpCode: {
    required: true,
    minLength: 6,
    maxLength: 6,
    pattern: /^[0-9]{6}$/,
    errorMessages: {
      required: 'OTP code is required',
      length: 'OTP code must be exactly 6 digits'
    }
  }
};

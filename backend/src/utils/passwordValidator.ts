// Password validation utility for strong password requirements

export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-5
  errors: string[];
  suggestions: string[];
}

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_SPECIAL_CHARS = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
const PASSWORD_UPPERCASE = /[A-Z]/;
const PASSWORD_LOWERCASE = /[a-z]/;
const PASSWORD_NUMBER = /[0-9]/;

export const validatePasswordStrength = (password: string): PasswordStrength => {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Check minimum length
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
  } else {
    score++;
  }

  // Check for uppercase
  if (!PASSWORD_UPPERCASE.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
    suggestions.push('Add an uppercase letter');
  } else {
    score++;
  }

  // Check for lowercase
  if (!PASSWORD_LOWERCASE.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
    suggestions.push('Add a lowercase letter');
  } else {
    score++;
  }

  // Check for number
  if (!PASSWORD_NUMBER.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
    suggestions.push('Add a number');
  } else {
    score++;
  }

  // Check for special character
  if (!PASSWORD_SPECIAL_CHARS.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)')
    suggestions.push('Add a special character like !@#$%');
  } else {
    score++;
  }

  return {
    isValid: errors.length === 0,
    score: score,
    errors,
    suggestions
  };
};

export const getPasswordStrengthLabel = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return 'Very Weak';
    case 2:
      return 'Weak';
    case 3:
      return 'Fair';
    case 4:
      return 'Good';
    case 5:
      return 'Strong';
    default:
      return 'Unknown';
  }
};

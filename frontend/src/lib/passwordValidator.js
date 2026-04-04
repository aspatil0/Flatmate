// Frontend password validation utility

export const validatePasswordStrength = (password) => {
  const errors = [];
  const suggestions = [];
  let score = 0;

  const PASSWORD_MIN_LENGTH = 8;
  const PASSWORD_SPECIAL_CHARS = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  const PASSWORD_UPPERCASE = /[A-Z]/;
  const PASSWORD_LOWERCASE = /[a-z]/;
  const PASSWORD_NUMBER = /[0-9]/;

  // Check minimum length
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`At least ${PASSWORD_MIN_LENGTH} characters`);
  } else {
    score++;
  }

  // Check for uppercase
  if (!PASSWORD_UPPERCASE.test(password)) {
    errors.push('One uppercase letter (A-Z)');
  } else {
    score++;
  }

  // Check for lowercase
  if (!PASSWORD_LOWERCASE.test(password)) {
    errors.push('One lowercase letter (a-z)');
  } else {
    score++;
  }

  // Check for number
  if (!PASSWORD_NUMBER.test(password)) {
    errors.push('One number (0-9)');
  } else {
    score++;
  }

  // Check for special character
  if (!PASSWORD_SPECIAL_CHARS.test(password)) {
    errors.push('One special character (!@#$%^&*)');
  } else {
    score++;
  }

  return {
    isValid: errors.length === 0,
    score: score,
    errors,
    strength: getStrengthLabel(score)
  };
};

const getStrengthLabel = (score) => {
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

export const getStrengthColor = (score) => {
  switch (score) {
    case 0:
    case 1:
      return 'bg-red-500';
    case 2:
      return 'bg-orange-500';
    case 3:
      return 'bg-yellow-500';
    case 4:
      return 'bg-lime-500';
    case 5:
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
};

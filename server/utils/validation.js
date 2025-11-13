// Validation constants
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LETTER_REGEX = /^[a-zA-Z]$/;
const MAX_EMAIL_LENGTH = 100;
const MAX_NAME_LENGTH = 100;
const MIN_PASSWORD_LENGTH = 6;

/**
 * Normalize string field
 * @param {*} value - The value to normalize
 * @param {number|null} maxLength - Maximum allowed length (null for no limit)
 * @returns {string|null} Normalized string or null
 */
function normalizeString(value, maxLength = null) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const normalized = String(value).trim();
  if (maxLength && normalized.length > maxLength) {
    return null; // Will be caught by validation
  }
  return normalized || null;
}

/**
 * Normalize integer field
 * @param {*} value - The value to normalize
 * @returns {number|null} Integer or null
 */
function normalizeInteger(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const num = Number(value);
  return !isNaN(num) && Number.isInteger(num) ? num : null;
}

/**
 * Validate signup data
 * @param {Object} data - Signup data object
 * @returns {Array<string>} Array of validation error messages
 */
function validateSignupData(data) {
  const errors = [];

  // Email validation
  if (!data.email || typeof data.email !== "string") {
    errors.push("email is required and must be a string");
  } else {
    const normEmail = data.email.trim().toLowerCase();
    if (normEmail.length === 0) {
      errors.push("email cannot be empty");
    } else if (normEmail.length > MAX_EMAIL_LENGTH) {
      errors.push(`email must be ${MAX_EMAIL_LENGTH} characters or less`);
    } else if (!EMAIL_REGEX.test(normEmail)) {
      errors.push("email must be a valid email address");
    }
  }

  // Password validation
  if (!data.password || typeof data.password !== "string") {
    errors.push("password is required and must be a string");
  } else if (data.password.length < MIN_PASSWORD_LENGTH) {
    errors.push(
      `password must be at least ${MIN_PASSWORD_LENGTH} characters long`
    );
  }

  // Helper to validate required string field
  const validateRequiredString = (fieldName, value, maxLength) => {
    if (!value || typeof value !== "string" || value.trim().length === 0) {
      errors.push(`${fieldName} is required`);
    } else if (maxLength && value.length > maxLength) {
      errors.push(`${fieldName} must be ${maxLength} characters or less`);
    }
  };

  // Required name field validations
  validateRequiredString("first_name", data.first_name, MAX_NAME_LENGTH);
  validateRequiredString("last_name", data.last_name, MAX_NAME_LENGTH);

  // Middle initial validation (required)
  if (
    !data.middle_initial ||
    typeof data.middle_initial !== "string" ||
    data.middle_initial.trim().length === 0
  ) {
    errors.push("middle_initial is required");
  } else if (data.middle_initial.length > 1) {
    errors.push("middle_initial must be a single character");
  } else if (!LETTER_REGEX.test(data.middle_initial)) {
    errors.push("middle_initial must be a letter");
  }

  // is_leader validation (required, must be boolean)
  if (data.is_leader === undefined || data.is_leader === null) {
    errors.push("is_leader is required");
  } else if (typeof data.is_leader !== "boolean") {
    errors.push("is_leader must be a boolean");
  }

  // Helper to validate required integer field
  const validateRequiredInteger = (fieldName, value) => {
    if (value === undefined || value === null || value === "") {
      errors.push(`${fieldName} is required`);
    } else {
      const num = Number(value);
      if (isNaN(num) || !Number.isInteger(num)) {
        errors.push(`${fieldName} must be an integer`);
      } else if (num < 0) {
        errors.push(`${fieldName} must be 0 or greater`);
      }
    }
  };

  // Required numeric field validations
  validateRequiredInteger("min_pace", data.min_pace);
  validateRequiredInteger("max_pace", data.max_pace);
  validateRequiredInteger("min_dist_pref", data.min_dist_pref);
  validateRequiredInteger("max_dist_pref", data.max_dist_pref);

  // Cross-field validation helper
  const validateRange = (minField, maxField, fieldName) => {
    const minValue = data[minField];
    const maxValue = data[maxField];

    if (
      minValue !== undefined &&
      minValue !== null &&
      maxValue !== undefined &&
      maxValue !== null
    ) {
      const minNum = Number(minValue);
      const maxNum = Number(maxValue);
      if (
        !isNaN(minNum) &&
        !isNaN(maxNum) &&
        Number.isInteger(minNum) &&
        Number.isInteger(maxNum) &&
        minNum > maxNum
      ) {
        errors.push(`min_${fieldName} cannot be greater than max_${fieldName}`);
      }
    }
  };

  // Cross-field validations
  validateRange("min_pace", "max_pace", "pace");
  validateRange("min_dist_pref", "max_dist_pref", "dist_pref");

  return errors;
}

module.exports = {
  normalizeString,
  normalizeInteger,
  validateSignupData,
};

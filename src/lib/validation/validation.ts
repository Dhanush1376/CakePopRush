/**
 * validation.ts
 * Pure validation utilities to be used across the application.
 * 
 * NOTE: These utilities represent the manual validation baseline. 
 * During backend API integration, this file will be superseded by 
 * Zod schema definitions (e.g. `z.string().email()`).
 */

export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  return /^\S+@\S+\.\S+$/.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;
  // Basic validation: 10 digits
  return /^\d{10}$/.test(phone);
};

export const isValidPincode = (pincode: string): boolean => {
  if (!pincode) return false;
  // Basic validation: 6 digits
  return /^\d{6}$/.test(pincode);
};

export const isRequired = (value: string | undefined | null): boolean => {
  return value !== undefined && value !== null && value.trim().length > 0;
};

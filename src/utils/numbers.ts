import { getNumber, isHexString } from "ethers";

/**
 * Checks if a value is a valid number.
 * Handles both numeric and string inputs, including hex strings.
 *
 * @param {any} value - The value to check.
 * @returns {boolean} True if the value is a valid, non-negative, finite number; false otherwise.
 */
export const isValidNumber = (value: any): boolean => {
  try {
    if (value === null || value === undefined || value === "") {
      return false;
    }

    // Handle hex strings
    if (typeof value === "string" && isHexString(value)) {
      value = getNumber(value);
    }

    const num = Number(value);
    return !isNaN(num) && isFinite(num) && num >= 0;
  } catch {
    return false;
  }
};

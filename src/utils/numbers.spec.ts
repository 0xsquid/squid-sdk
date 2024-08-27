// ... existing imports ...

import { isValidNumber } from "./numbers";

describe("isValidNumber", () => {
  it("should return true for valid numbers", () => {
    expect(isValidNumber(0)).toBe(true);
    expect(isValidNumber(1)).toBe(true);
    expect(isValidNumber(1.5)).toBe(true);
    expect(isValidNumber("0")).toBe(true);
    expect(isValidNumber("1")).toBe(true);
    expect(isValidNumber("1.5")).toBe(true);
    expect(isValidNumber("0x0")).toBe(true);
    expect(isValidNumber("0x1")).toBe(true);
    expect(isValidNumber("0xF")).toBe(true);
    expect(isValidNumber("0x1A")).toBe(true);
  });

  it("should return false for invalid numbers", () => {
    expect(isValidNumber(-1)).toBe(false);
    expect(isValidNumber("-1")).toBe(false);
    expect(isValidNumber("abc")).toBe(false);
    expect(isValidNumber("")).toBe(false);
    expect(isValidNumber(null)).toBe(false);
    expect(isValidNumber(undefined)).toBe(false);
    expect(isValidNumber(NaN)).toBe(false);
    expect(isValidNumber(Infinity)).toBe(false);
    expect(isValidNumber({})).toBe(false);
  });

  it("should handle large numbers correctly", () => {
    expect(isValidNumber(Number.MAX_SAFE_INTEGER)).toBe(true);
    expect(isValidNumber(Number.MAX_SAFE_INTEGER.toString())).toBe(true);
    expect(isValidNumber("0x" + Number.MAX_SAFE_INTEGER.toString(16))).toBe(true);
  });

  it("should handle edge cases", () => {
    expect(isValidNumber("0x0")).toBe(true);
    expect(isValidNumber("0x00")).toBe(true);
    expect(isValidNumber("0x")).toBe(false);
    expect(isValidNumber("0xG")).toBe(false);
  });
});

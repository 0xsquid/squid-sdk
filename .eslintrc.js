module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "unused-imports", "json-format"],
  extends: ["prettier"],
  root: true,
  env: {
    node: true,
  },
  ignorePatterns: ["dist", "src/**/*spec.ts", "src/**/*test.ts"],
  rules: {
    "no-unused-vars": "off", // or "@typescript-eslint/no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    "@typescript-eslint/quotes": ["error"],
    "@typescript-eslint/object-curly-spacing": "off",
    "unused-imports/no-unused-vars": [
      "warn",
      { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
    ],
    quotes: "error",
  },
};

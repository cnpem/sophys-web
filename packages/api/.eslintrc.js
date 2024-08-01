import baseConfig from "@sophys-web/eslint-config/library";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
];
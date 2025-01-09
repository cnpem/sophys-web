import baseConfig from "@sophys-web/eslint-config/library";
import reactConfig from "@sophys-web/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  ...reactConfig,
];

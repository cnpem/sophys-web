import baseConfig, {
  restrictEnvAccess,
} from "@sophys-web/eslint-config/library";
import nextjsConfig from "@sophys-web/eslint-config/nextjs";
import reactConfig from "@sophys-web/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
const config = [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];

export default config;

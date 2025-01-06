/** @type {import('jiti').createJiti} */
const createJiti = require("jiti");

/** @type {import('jiti').Jiti} */
const jiti = createJiti(__filename);

// Import env here to validate during build. Using jiti we can import .ts files :)
jiti.import("./src/env");

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  /** enable standalone output for docker self-hosting */
  // output: "standalone",
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@sophys-web/ui",
    "@sophys-web/api",
    "@sophys-web/auth",
    "@sophys-web/api-client",
  ],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  /** base path setup for reverse proxy */
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
};

module.exports = config;

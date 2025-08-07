import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

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
    "@sophys-web/widgets",
    "@sophys-web/pvws-store",
  ],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  /** base path setup for reverse proxy */
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
};

export default config;

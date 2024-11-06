import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";

const jiti = createJiti(fileURLToPath(import.meta.url));

// Import env here to validate during build. Using jiti we can import .ts files :)
await jiti.import("./app/env");

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  /** enable standalone output for docker self-hosting */
  // output: "standalone",
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@sophys-web/ui", "@sophys-web/api", "@sophys-web/auth"],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  /** base path setup for reverse proxy */
  basePath: "/spu-ui",
};

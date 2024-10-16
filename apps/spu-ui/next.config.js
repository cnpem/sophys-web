/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  output: "standalone",
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@sophys-web/ui", "@sophys-web/api", "@sophys-web/auth"],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

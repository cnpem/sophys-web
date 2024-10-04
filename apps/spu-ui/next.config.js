/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@sophys-web/ui", "@sophys-web/api", "@sophys-web/auth"],
};

import type { Config } from "tailwindcss";
import baseConfig from "@sophys-web/tailwind-config";

export default {
  content: [...baseConfig.content],
  presets: [baseConfig],
} satisfies Config;

import { execSync } from "node:child_process";
import type { PlopTypes } from "@turbo/gen";

interface PackageJson {
  name: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("app", {
    description: "Generate a new sophys-web app",
    prompts: [
      {
        type: "input",
        name: "name",
        message:
          "What is the name of the app? (You can skip the `@sophys-web/` prefix)",
        validate: (input) => {
          if (input.includes(" ")) {
            return "App name cannot contain spaces";
          }
          if (/[^a-zA-Z0-9-_]/.test(input)) {
            return "App name contains forbidden special characters";
          }
          return true;
        },
      },
    ],
    actions: [
      (answers) => {
        if ("name" in answers && typeof answers.name === "string") {
          if (answers.name.startsWith("@sophys-web/")) {
            answers.name = answers.name.replace("@sophys-web/", "");
          }
        }
        return "Config sanitized";
      },
      {
        type: "add",
        path: "apps/{{ name }}/eslint.config.js",
        templateFile: "templates/app/eslint.config.js.hbs",
      },
      {
        type: "add",
        path: "apps/{{ name }}/package.json",
        templateFile: "templates/app/package.json.hbs",
      },
      {
        type: "add",
        path: "apps/{{ name }}/tsconfig.json",
        templateFile: "templates/app/tsconfig.json.hbs",
      },
      {
        type: "add",
        path: "apps/{{ name }}/postcss.config.js",
        templateFile: "templates/app/postcss.config.js.hbs",
      },
      {
        type: "add",
        path: "apps/{{ name }}/next.config.js",
        templateFile: "templates/app/next.config.js.hbs",
      },
      {
        type: "add",
        path: "apps/{{ name }}/turbo.json",
        templateFile: "templates/app/turbo.json.hbs",
      },
      {
        type: "add",
        path: "apps/{{ name }}/src/env.ts",
        templateFile: "templates/app/env.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{ name }}/src/middleware.ts",
        templateFile: "templates/app/middleware.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{ name }}/src/app/layout.tsx",
        templateFile: "templates/app/layout.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{ name }}/src/app/globals.css",
        template:
          '@import "tailwindcss";@import "tw-animate-css";@import "@sophys-web/tailwind-config/base.css";',
      },
      {
        type: "add",
        path: "apps/{{ name }}/src/app/page.tsx",
        templateFile: "templates/app/page.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{name}}/src/app/auth/signin/page.tsx",
        templateFile: "templates/app/signin.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{name}}/src/app/auth/signin/form.tsx",
        templateFile: "templates/app/signin-form.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{name}}/src/app/api/trpc/[trpc]/route.ts",
        templateFile: "templates/app/api/trpc.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{name}}/src/app/api/auth/[...nextauth]/route.ts",
        templateFile: "templates/app/api/auth.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{name}}/src/app/actions/auth.ts",
        templateFile: "templates/app/actions/auth.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{name}}/src/app/_components/nav-user.tsx",
        templateFile: "templates/app/nav-user.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{name}}/src/app/_components/app-sidebar.tsx",
        templateFile: "templates/app/app-sidebar.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{name}}/src/app/_components/dashboard/dashboard.tsx",
        templateFile: "templates/app/dashboard/dashboard.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{name}}/src/app/_components/dashboard/controls.tsx",
        templateFile: "templates/app/dashboard/controls.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{name}}/src/app/_components/queue/columns.tsx",
        templateFile: "templates/app/queue/columns.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{name}}/src/app/_components/queue/row-actions.tsx",
        templateFile: "templates/app/queue/row-actions.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{name}}/src/app/_components/queue/data-table.tsx",
        templateFile: "templates/app/queue/data-table.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{name}}/src/app/_components/history/columns.tsx",
        templateFile: "templates/app/history/columns.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{name}}/src/app/_components/history/rerun.tsx",
        templateFile: "templates/app/history/rerun.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{name}}/src/app/_components/history/data-table.tsx",
        templateFile: "templates/app/history/data-table.tsx.hbs",
      },
      {
        type: "add",
        path: "apps/{{name}}/src/lib/types.ts",
        templateFile: "templates/app/types.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{name}}/public/.gitkeep",
        template: "",
      },
      {
        type: "add",
        path: "apps/{{name}}/.env",
        template:
          "AUTH_SECRET=supersecret\nBLUESKY_HTTPSERVER_URL=http://localhost:60610",
      },
      {
        type: "add",
        path: "apps/{{name}}/README.md",
        template:
          "# {{name}}\n\nThis project was scaffolded with [sophys-web](https://github.com/cnpem/sophys-web)",
      },
      async (answers) => {
        /**
         * Install deps and format everything
         */
        if ("name" in answers && typeof answers.name === "string") {
          execSync("pnpm i", { stdio: "inherit" });
          execSync(
            `pnpm prettier --write apps/${answers.name}/** --list-different`,
          );
          return "App scaffolded";
        }
        return "App not scaffolded";
      },
    ],
  });
}

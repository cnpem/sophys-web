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
      },
      {
        type: "input",
        name: "deps",
        message:
          "Enter a space separated list of dependencies you would like to install",
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
        path: "apps/{{ name }}/next.config.ts",
        templateFile: "templates/app/next.config.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{ name }}/next-env.d.ts",
        templateFile: "templates/app/next-env.d.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{ name }}/tailwind.config.ts",
        templateFile: "templates/app/tailwind.config.ts.hbs",
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
        type: "modify",
        path: "apps/{{ name }}/package.json",
        async transform(content, answers) {
          if ("deps" in answers && typeof answers.deps === "string") {
            const pkg = JSON.parse(content) as PackageJson;
            for (const dep of answers.deps.split(" ").filter(Boolean)) {
              const version = await fetch(
                `https://registry.npmjs.org/-/package/${dep}/dist-tags`,
              )
                .then((res) => res.json())
                .then((json) => json.latest);
              if (!pkg.dependencies) pkg.dependencies = {};
              pkg.dependencies[dep] = `^${version}`;
            }
            return JSON.stringify(pkg, null, 2);
          }
          return content;
        },
      },
      async (answers) => {
        /**
         * Install deps and format everything
         */
        if ("name" in answers && typeof answers.name === "string") {
          // execSync("pnpm dlx sherif@latest --fix", {
          //   stdio: "inherit",
          // });
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

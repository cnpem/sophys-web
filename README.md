# Sophys Web

A collection of web applications and its resources for the Sirius Ophyd and blueskY utilitieS (SOphYS) project.

> **Note**: This project is under development and is not yet ready for production use.

## Existing apps

- [spu-ui](./apps/spu-ui/README.md): A web application for the SAPUCAIA beamline at LNLS.

## Development

### Setup

```bash
# Install dependencies
pnpm i

# Configure environment variables
# There is an `.env.example` in the root directory you can use for reference
cp .env.example ./apps/spu-ui/.env
```

> [!Note] One must copy the `.env.example` file to `.env` and configure the environment variables accordingly
> for each app in the `apps` directory, because each app has its own environment variables and
> can be configured and deployed independently.

### Third-party dependencies

This project depends on having an external server running the [bluesky http-server](https://github.com/bluesky/bluesky-httpserver).

### Running the development server

To run the development server, use the following command:

```bash
pnpm dev
```

This will start the `spu-ui` app on `http://localhost:3000`.

### Local CI

To run the CI tests locally, use the following command:

```bash
pnpm local-ci
```

## How to build a new app

To build a new app from scratch and take advantage of the `shared` packages and utilities,
do the following:

### Set up node and pnpm

This project requires `node` with version 22.14.0 or higher and `pnpm` with version 9.6.0 or higher.

If you don't have `node` and `pnpm` installed, go to the [Node.js website](https://nodejs.org/en/download/) and follow the instructions to install Node.js with pnpm for your operating system.

### External dependencies

To run the app, you will need to have set up the following

### Set up the repository

First, set up a fork of this repository on GitHub and clone it to your local machine.

Then, install the dependencies:

```bash
pnpm i
```

This will install all the dependencies for the monorepo and the apps in the `apps` directory.

### Create a new app using the generator

To scaffold a new app, use the `turbo generate` command:

```bash
pnpm turbo generate app
```

This will prompt you for the name of the app and create a new directory in the `apps` directory with the name of the app.

### Configure environment variables

> [!Note] The new app will generate a small set of default environment variables in a `.env` file, such as `BLUESKY_HTTPSERVER_URL` and `AUTH_SECRET`. Please make sure to set the correct values for these variables in the `.env` file.

### Run the app in development mode

To run the app in development mode, use the following command:

```bash
pnpm dev --filter=@sophys-web/<new-app-name>
```

This will start the app on `http://localhost:3000` by default. > **Note:** The `--filter` flag is used to run only the app that you just created. If you want to run all the apps, you can use the `pnpm dev` command without the `--filter` flag.

## Install new external dependencies to an app

When you are developing you new app, you will probably want to install external dependencies to your app other than the ones that are pre installed. Since this project is JavaScript and Node.js based, we can search for packages in the [npm](https://www.npmjs.com/) registry, which is "the largest software registry in the world" and the epicentre of JavaScript code sharing.

### Full example

Let's imagine you decided that you project needs the `nanoid` package, because you saw an example of a code that creates unique ids with it, like the following snippet:

```typescript
import { nanoid } from "nanoid";

model.id = nanoid(); //=> "V1StGXR8_Z5jdHi6B-myT"
```

So, _naturally_, your next step was finding the package in the npm registry: [nanoid](https://www.npmjs.com/package/nanoid).

There you noticed that the package is in a version bigger than 5, has more than 50M weekly downloads, has 0 dependencies and the docs say that it does what you want it to do. So you decide you trust it and will install it.

> **WARNING** In the Install instructions for the package in the npm registry, you will see only the suggestion to use the `npm` _package manager_, but this project requires `pnpm` as the package manager, so you will need - among other things - to replace the `npm` for `pnpm` in the install command.

We need also to consider that we are working in a `monorepo` that manages multiple apps and internal packages that have their own dependencies, so we need to be careful about where we want this new dependency will be installed.

In our example, we want to install this package to an app that exists in the `apps/` directory of this monorepo. Lets say that the name of our app (defined in it's own `package.json` file) is `@sophys-web/test-ui`. So, for this case, the full command to add `nanoid` as a dependency in this app is:

```bash
pnpm add --filter @sophys-web/test-ui nanoid
```

Generally speaking, to add any dependencies to an app or an internal package in this project, the command should be:

```bash
pnpm add --filter @sophys-web/<app-name> <package-name>
```

You can read more about the options to managing dependencies on this monorepo in the [turborepo docs on managing dependencies](https://turborepo.com/docs/crafting-your-repository/managing-dependencies).

## Deployment

### With Docker

To deploy the app with Docker, you can use the provided `Dockerfile` in the app's directory. The `Dockerfile` is set up to build the app and run it in a production environment.
To build the Docker image, run the following command in the root directory of the monorepo:

```bash
docker build -t sophys-web-qua-ui -f apps/qua-ui/Dockerfile .
```

To run the Docker container, use the following command:

```bash
docker run -d -p 3000:3000 sophys-web-qua-ui
```

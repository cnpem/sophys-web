# Sophys Web

A collection of web applications and its resources for the Sirius Ophyd and blueskY utilitieS (SOphYS) project.

> **Note**: This project is under development and is not yet ready for production use.

## Apps

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

> **Note:** One must copy the `.env.example` file to `.env` and configure the environment variables accordingly
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

### configure environment variables

> **Note:** The new app will generate a small set of default environment variables in a `.env` file, such as `BLUESKY_HTTPSERVER_URL` and `AUTH_SECRET`. Please make sure to set the correct values for these variables in the `.env` file.

### Run the app in development mode

To run the app in development mode, use the following command:

```bash
pnpm dev --filter=@sophys-web/<new-app-name>
```

This will start the app on `http://localhost:3000` by default. > **Note:** The `--filter` flag is used to run only the app that you just created. If you want to run all the apps, you can use the `pnpm dev` command without the `--filter` flag.

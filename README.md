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
follow the 🚧 **TO BE ADDED SOON** tutorial 🚧

# @sophys-web/api

## 0.2.0

### Minor Changes

- f00f1f7: Added base procedure for routes that use the redis connected client via context.

  - If REDIS_URL is set in the environment, the backend tries to connect and the valid client is shared in the context for the routes that use this procedure. If there is no REDIS_URL, routes that use this procedure will have an error state, while the other routes will not, so apps that don't use redis routes won't have errors.

- 0697820: Added store router for a implementation of a hash store with redis.
- 27db97d: Refactor api routes to organize httpserver related routes under the httpserver namespace.

## 0.1.3

### Patch Changes

- e9bfaf0: Fixed sorting devices names.

## 0.1.2

### Patch Changes

- b1f6dbc: Added timeStart optional property in runningItem properties schema.

## 0.1.1

### Patch Changes

- fddcd55: Change regex match to enable numbers as word boundaries and fix device naming display at forms

## 0.1.0

### Minor Changes

- Initial changeset

### Patch Changes

- Updated dependencies
  - @sophys-web/auth@0.1.0

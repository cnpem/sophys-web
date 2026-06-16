# @sophys-web/api-client

## 0.3.0

### Minor Changes

- 1c14816: added a new hook called `useStore` to the API client package. This hook provides an interface for interacting with a key-value store on the server, allowing you to fetch, set, and delete fields in the store, as well as clear the entire store instance. The hook uses Zod for schema validation and transformation of the store's fields, and manages the state of the store data, loading and error states, and provides callback functions for manipulating the store.

### Patch Changes

- 27db97d: Refactor api routes to organize httpserver related routes under the httpserver namespace.
- Updated dependencies [f00f1f7]
- Updated dependencies [0697820]
- Updated dependencies [27db97d]
  - @sophys-web/api@0.2.0

## 0.2.2

### Patch Changes

- Updated dependencies [e9bfaf0]
  - @sophys-web/api@0.1.3

## 0.2.1

### Patch Changes

- Updated dependencies [b1f6dbc]
  - @sophys-web/api@0.1.2

## 0.2.0

### Minor Changes

- 037d715: Created a controls widget component to manage environment, queue and run engine.
  Added the ability to destroy environments via the use-status hook in the api-client package.
  Added the ability to destroy environments in the controls widget in the widgets package.
  Updated the qua-ui and spu-ui packages to use the new controls widget.

  Added the button-group component set to the ui package.
  Added the spinner component to the ui package.
  Updated the ui package's alert-dialog component set based on the latest changes from shadcn/ui.

### Patch Changes

- Updated dependencies [fddcd55]
  - @sophys-web/api@0.1.1

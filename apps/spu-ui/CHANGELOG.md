# @sophys-web/spu-ui

## 0.1.1

### Patch Changes

- 5d19a9d: Changed pvws-store connection handler to get its url from props so a parent server component can load its value from the runtime environment (instead of relying on NEXT* PUBLIC* environment variables that need to be set at build time).

- 6bbac35: fixed (packages/pvws-store): use "clear" action on unsubscribe messages

## 0.1.0

### Minor Changes

- 1c81728: Updated plans schemas to be compatible to recent changes, created widget for rendering a generic form based on the plan annotations, added a download link for an example CSV file in the UploadQueue component.

- Initial changeset

### Patch Changes

- Updated dependencies
  - @sophys-web/auth@0.1.0
  - @sophys-web/api@0.1.0
  - @sophys-web/ui@0.1.0

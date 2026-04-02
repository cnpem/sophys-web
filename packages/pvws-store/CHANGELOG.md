# @sophys-web/pvws-store

## 0.2.0

### Minor Changes

- 53fe953: - Improved docs with guide on how to use the `@sophys-web/pvws-store` with side effects and to clarify the use cases for the `usePvData` and `usePvDataMap` hooks.

- Deprecated warning for the `useSinglePvData` hook name, which is being renamed to `usePvData` to better reflect its purpose and prevent confusion.

## 0.1.1

### Patch Changes

- 5d19a9d: Changed pvws-store connection handler to get its url from props so a parent server component can load its value from the runtime environment (instead of relying on NEXT*PUBLIC* environment variables that need to be set at build time).

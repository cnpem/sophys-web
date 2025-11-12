# @sophys-web/pvws-store

## 0.1.1

### Patch Changes

- 5d19a9d: Changed pvws-store connection handler to get its url from props so a parent server component can load its value from the runtime environment (instead of relying on NEXT*PUBLIC* environment variables that need to be set at build time).

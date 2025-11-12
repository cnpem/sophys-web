---
"@sophys-web/pvws-store": patch
"@sophys-web/spu-ui": patch
---

Changed pvws-store connection handler to get its url from props so a parent server component can load its value from the runtime environment (instead of relying on NEXT*PUBLIC* environment variables that need to be set at build time).

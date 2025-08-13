---
"@sophys-web/api": minor
"@sophys-web/spu-ui": patch
"@sophys-web/widgets": patch
---

@sophys-web/spu-ui

- Fix broken form that depends on devices.allowedNames rpc.

@sophys-web/api

- Remove long_name/longName property from devices route schema.
- Refactor devices.allowedNames rpc to return device's key as its name.

@sophys-web/widgets

- Fix layout for long names in milti-select dropdown.

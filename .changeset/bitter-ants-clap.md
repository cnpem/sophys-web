---
"@sophys-web/widgets": minor
"@sophys-web/spu-ui": minor
---

Updated plans schemas to be compatible to recent changes, created widget for rendering a generic form based on the plan annotations, added a download link for an example CSV file in the UploadQueue component.

Details:

- acquireTime property was changed from string enum to a float field.
- cleaning procedure plan was changed into two plans: standard and custom.
- bufferTag was removed from clean and acquire plan.

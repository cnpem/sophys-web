---
"@sophys-web/spu-ui": minor
---

Refactor the setup1 store as a `store router` client using the new `useStore` hook.
This enables building the store in a more modular way and more store instances per app.
The store is now located in `src/stores/setup1/use-sample-store` and the main export is a `useSampleStore` hook that can be used in components to access the store state and actions.

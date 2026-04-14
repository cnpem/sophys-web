---
"@sophys-web/api-client": minor
---

added a new hook called `useStore` to the API client package. This hook provides an interface for interacting with a key-value store on the server, allowing you to fetch, set, and delete fields in the store, as well as clear the entire store instance. The hook uses Zod for schema validation and transformation of the store's fields, and manages the state of the store data, loading and error states, and provides callback functions for manipulating the store.

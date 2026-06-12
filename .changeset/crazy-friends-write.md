---
"@sophys-web/api": minor
---

Added base procedure for routes that use the redis connected client via context.

- If REDIS_URL is set in the environment, the backend tries to connect and the valid client is shared in the context for the routes that use this procedure. If there is no REDIS_URL, routes that use this procedure will have an error state, while the other routes will not, so apps that don't use redis routes won't have errors.

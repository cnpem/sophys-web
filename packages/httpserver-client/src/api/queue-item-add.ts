import { postGenerator } from "../lib/handler-generator";
import { requestOptionsSchema } from "../schemas/base";
import { schemas as addSchemas } from "../schemas/queue-item-add";

/**
 * Adds an item to the queue on the HTTP server.
 *
 * @param options - An object containing the HTTP server URL, access token for authentication, and the item to be added.
 * @returns A promise resolving to the response from the HTTP server after attempting to add the item.
 */

export const handler = postGenerator(
  "/api/queue/add",
  requestOptionsSchema.extend({
    body: addSchemas.body,
  }),
  addSchemas.response,
);

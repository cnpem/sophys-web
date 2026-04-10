import { postGenerator } from "../lib/handler-generator";
import { requestOptionsSchema } from "../schemas/base";
import { schemas } from "../schemas/queue-item-add-batch";

/**
 * Adds multiple items to the queue on the HTTP server in a single batch request.
 *
 * @param options - An object containing the HTTP server URL, access token for authentication, and the items to be added in batch.
 * @returns A promise resolving to the response from the HTTP server after attempting to add the items in batch.
 */
export const handler = postGenerator(
  "/api/queue/add/batch",
  requestOptionsSchema.extend({
    body: schemas.body,
  }),
  schemas.response,
);

import { getGenerator } from "../lib/handler-generator";
import { schemas } from "../schemas/queue-get";

/**
 * Retrieves the current state of the queue from the HTTP server, including all items in the queue and their statuses.
 *
 * @param options - An object containing the HTTP server URL and access token for authentication.
 * @returns A promise resolving to the response from the HTTP server containing the queue information.
 */
export const handler = getGenerator("/api/queue/get", schemas.response);

import type { z } from "zod";
import { requestOptionsSchema } from "../schemas/base";
import { pytsZodFetcher } from "./pyts-fetcher";

type BaseRequestOptions = z.infer<typeof requestOptionsSchema>;
type BaseRequestOptionsWithBody = BaseRequestOptions & {
  body: Record<string, unknown> | undefined;
};

/**
 * Generates a handler function for making POST requests to the specified URL path on the HTTP server, using the provided request and response schemas for validation.
 * @param urlPath
 * @param requestSchema
 * @param responseSchema
 * @returns
 */
export const postGenerator = <T extends BaseRequestOptionsWithBody, R>(
  urlPath: string,
  requestSchema: z.ZodType<T>,
  responseSchema: z.ZodType<R>,
) => {
  return async (options: T): Promise<R> => {
    const parsed = requestSchema.parse(options);
    const fetchURL = `${parsed.httpServerUrl}${urlPath}`;

    return pytsZodFetcher(responseSchema, {
      url: fetchURL,
      method: "POST",
      authorization: `Bearer ${parsed.accessToken}`,
      body: parsed.body,
    });
  };
};

/**
 * Generates a handler function for making GET requests to the specified URL path on the HTTP server, using the provided response schema for validation.
 * @param urlPath
 * @param responseSchema
 * @returns
 */
export const getGenerator = <T extends BaseRequestOptions, R>(
  urlPath: string,
  responseSchema: z.ZodType<R>,
) => {
  return async (options: T): Promise<R> => {
    const parsed = requestOptionsSchema.parse(options);
    const fetchURL = `${parsed.httpServerUrl}${urlPath}`;

    return pytsZodFetcher(responseSchema, {
      url: fetchURL,
      method: "GET",
      authorization: `Bearer ${parsed.accessToken}`,
      body: undefined,
    });
  };
};

import camelcaseKeys from "camelcase-keys";
import decamelizeKeys from "decamelize-keys";
import { createZodFetcher } from "zod-fetch";

type ResponseData = Record<string, unknown>;

/**
 * Fetches data from a REST API endpoint and converts the response from snake_case to camelCase.
 * The request body is also converted from camelCase to snake_case before being sent.
 * @param url - The URL of the API endpoint to fetch data from.
 * @param body - The request body to be sent with the API request, which will be converted to snake_case.
 * @param method - The HTTP method to use for the request (e.g., "GET", "POST").
 * @param authorization - Optional authorization token to include in the request headers.
 *
 * @return A promise that resolves to the API response data with keys in camelCase.
 */
const snakeToCamelFetch = async ({
  url,
  body,
  method,
  authorization,
}: {
  url: string | URL;
  body: Record<string, unknown> | undefined;
  method: "GET" | "POST";
  authorization?: string | undefined;
}): Promise<ResponseData> => {
  const snakeBody = body
    ? JSON.stringify(decamelizeKeys(body, { deep: true }))
    : undefined;
  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authorization ?? "",
    },
    body: snakeBody,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const jsonResponse: unknown = await response.json();
  const camelCasedResponse: ResponseData = camelcaseKeys(
    jsonResponse as ResponseData,
    {
      deep: true,
    },
  );

  return camelCasedResponse;
};

/**
 * A Zod fetcher that uses the snakeToCamelFetch function to fetch data from an API endpoint and validate it against a Zod schema.
 * The fetcher takes care of converting request bodies to snake_case and response data to camelCase,
 * while also validating the response against the provided Zod schema.
 * @see snakeToCamelFetch for details on the fetch function used by this Zod fetcher.
 *
 * @param schema - The Zod schema to validate the API response against.
 * @param options - An object containing the URL, request body, HTTP method, and optional authorization token for the API request.
 * @returns A Zod fetcher function that can be used to fetch and validate data from an API endpoint.
 */
export const pytsZodFetcher = createZodFetcher(snakeToCamelFetch);

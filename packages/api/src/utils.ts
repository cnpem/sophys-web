import camelcaseKeys from "camelcase-keys";
import decamelizeKeys from "decamelize-keys";
import { createZodFetcher } from "zod-fetch";

type ResponseData = Record<string, unknown>;

const snakeToCamelFetcher = async ({
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

export const zodSnakeFetcher = createZodFetcher(snakeToCamelFetcher);

export function camelToSnakeCase(str: string) {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

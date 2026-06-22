export async function fetchJson(url: string, apiKey: string) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Apikey ${apiKey}`,
      accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  return response;
}

export interface Schema<TData> {
  parse: (data: unknown) => TData;
}

export async function fetchAndParseJson<TData>({
  url,
  apiKey,
  schema,
}: {
  url: string;
  apiKey: string;
  schema: Schema<TData>;
}): Promise<TData> {
  const response = await fetchJson(url, apiKey).catch((error) => {
    console.error(`Error fetching data from ${url}:`, error);
    throw error;
  });
  const jsonResponse: unknown = await response.json().catch((error) => {
    console.error(`Error parsing JSON from ${url}:`, error);
    throw error;
  });
  try {
    return schema.parse(jsonResponse);
  } catch (error) {
    console.error(`Error validating response from ${url}:`, error);
    throw error;
  }
}

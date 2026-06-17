import {
  ArrayBlockApiV1ArrayBlockPathGetResponse,
  FullArrayApiV1ArrayFullPathGetResponse,
  FullContainerMetadataAndDataApiV1ContainerFullPathGetResponse,
  FullTableDataApiV1TableFullPathGetResponse,
  MetadataApiV1MetadataPathGetResponse,
} from "./lib/schemas/zod-schema";

const API_VERSION = "v1";

function generateFullUrl(
  baseUrl: string,
  actionUrl: string,
  path?: string,
  queryParams?: Record<string, string>,
) {
  const url = new URL(
    `${baseUrl}/api/${API_VERSION}${actionUrl}${path ? `/${path}` : ""}`,
  );
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) =>
      url.searchParams.append(key, value),
    );
  }
  return url.toString();
}

class TiledClient {
  constructor({ baseUrl, apiKey }: { baseUrl: string; apiKey: string }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private baseUrl: string;
  private apiKey: string;

  async getMetadata({ path }: { path: string }) {
    const actionUrl = "/metadata";
    const fullUrl = generateFullUrl(this.baseUrl, actionUrl, path);
    const response = await fetch(fullUrl, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    const jsonResponse: unknown = await response.json();
    const parsed = MetadataApiV1MetadataPathGetResponse.safeParse(jsonResponse);
    if (!parsed.success) {
      throw new Error(`Invalid response format: ${parsed.error.message}`);
    }
    return parsed.data;
  }

  async getContainer({ path }: { path: string }) {
    const actionUrl = "/container/full";
    const fullUrl = generateFullUrl(this.baseUrl, actionUrl, path);
    const response = await fetch(fullUrl, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch container: ${response.statusText}`);
    }
    const jsonResponse: unknown = await response.json();
    const parsed =
      FullContainerMetadataAndDataApiV1ContainerFullPathGetResponse.safeParse(
        jsonResponse,
      );
    if (!parsed.success) {
      throw new Error(`Invalid response format: ${parsed.error.message}`);
    }
    return parsed.data;
  }

  async getTable({ path }: { path: string }) {
    const actionUrl = "/table/full";
    const fullUrl = generateFullUrl(this.baseUrl, actionUrl, path);
    const response = await fetch(fullUrl, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch table: ${response.statusText}`);
    }
    const jsonResponse: unknown = await response.json();
    const parsed =
      FullTableDataApiV1TableFullPathGetResponse.safeParse(jsonResponse);
    if (!parsed.success) {
      throw new Error(`Invalid response format: ${parsed.error.message}`);
    }
    return parsed.data;
  }

  async getArray({ path }: { path: string }) {
    const actionUrl = "/array/full";
    const fullUrl = generateFullUrl(this.baseUrl, actionUrl, path);
    const response = await fetch(fullUrl, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch array: ${response.statusText}`);
    }
    const jsonResponse: unknown = await response.json();
    const parsed =
      FullArrayApiV1ArrayFullPathGetResponse.safeParse(jsonResponse);
    if (!parsed.success) {
      throw new Error(`Invalid response format: ${parsed.error.message}`);
    }
    return parsed.data;
  }

  async getArrayBlock({ path }: { path: string }) {
    const actionUrl = "/array/block";
    const fullUrl = generateFullUrl(this.baseUrl, actionUrl, path);
    const response = await fetch(fullUrl, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch array block: ${response.statusText}`);
    }
    const jsonResponse: unknown = await response.json();
    const parsed =
      ArrayBlockApiV1ArrayBlockPathGetResponse.safeParse(jsonResponse);
    if (!parsed.success) {
      throw new Error(`Invalid response format: ${parsed.error.message}`);
    }
    return parsed.data;
  }
}

/**
 * Generate a TiledClient instance with the provided configuration.
 * @param config - The configuration object containing the base URL and API key.
 * @returns A new instance of TiledClient.
 * @example
 * const client = createTiledClient({ baseUrl: "https://api.tiled.com", apiKey: "your-api-key" });
 */
export const createTiledClient = (config: {
  baseUrl: string;
  apiKey: string;
}) => new TiledClient(config);

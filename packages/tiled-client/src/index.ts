import type { z } from "zod";
import { fetchAndParseJson } from "./lib/fetch-with-auth";
import { arrayGetResponse } from "./lib/schemas/array-get";
import { containerGetResponse } from "./lib/schemas/container-get";
import { metadataGetResponse } from "./lib/schemas/metadata-get";
import { tableGetResponse } from "./lib/schemas/table-get";

const API_VERSION = "v1";

function generateFullUrl(
  baseUrl: string,
  actionUrl: string,
  path?: string,
  queryParams?: Record<string, string>,
) {
  const url = new URL(
    `${baseUrl}/api/${API_VERSION}${actionUrl}${path ? `${path}` : ""}`,
  );
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) =>
      url.searchParams.append(key, value),
    );
  }
  return url.toString();
}

export interface ITiledClient {
  /**
   * Fetch metadata for a given path.
   * @param params - An object containing the path for which to fetch metadata.
   * @returns A promise that resolves to the metadata of the specified path, or null if an error occurs.
   * @example
   * const metadata = await client.getMetadata({ path: "/some/valid/path" });
   */
  getMetadata(params: {
    path: string;
  }): Promise<z.infer<typeof metadataGetResponse> | null>;
  /**
   * Fetch the full container metadata and data for a given path.
   * @param params - An object containing the path for which to fetch the container data.
   * @returns A promise that resolves to the full container metadata and data of the specified path, or null if an error occurs.
   * @example
   * const containerData = await client.getContainer({ path: "/some/valid/container/path" });
   */
  getContainer(params: {
    path: string;
  }): Promise<z.infer<typeof containerGetResponse> | null>;
  /**
   * Fetch the full table data for a given path.
   * @param params - An object containing the path for which to fetch the table data.
   * @returns A promise that resolves to the full table data of the specified path, or null if an error occurs.
   * @example
   * const tableData = await client.getTable({ path: "/some/valid/table/path" });
   */
  getTable(params: {
    path: string;
  }): Promise<z.infer<typeof tableGetResponse> | null>;
  /**
   * Fetch the full array data for a given path.
   * @param params - An object containing the path for which to fetch the array data.
   * @returns A promise that resolves to the full array data of the specified path, or null if an error occurs.
   * @example
   * const arrayData = await client.getArray({ path: "/some/valid/array/path" });
   */
  getArray(params: {
    path: string;
  }): Promise<z.infer<typeof arrayGetResponse> | null>;
}

export type TiledClientType = ITiledClient;

class TiledClient implements ITiledClient {
  constructor({ baseUrl, apiKey }: { baseUrl: string; apiKey: string }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private baseUrl: string;
  private apiKey: string;

  async getMetadata({ path }: { path: string }) {
    const actionUrl = "/metadata";
    const fullUrl = generateFullUrl(this.baseUrl, actionUrl, path);
    try {
      return await fetchAndParseJson({
        url: fullUrl,
        apiKey: this.apiKey,
        schema: metadataGetResponse,
      });
    } catch (error) {
      console.error(`Error fetching metadata for path ${path}:`, error);
      return null;
    }
  }

  async getContainer({ path }: { path: string }) {
    const actionUrl = "/container/full";
    const fullUrl = generateFullUrl(this.baseUrl, actionUrl, path);
    return await fetchAndParseJson({
      url: fullUrl,
      apiKey: this.apiKey,
      schema: containerGetResponse,
    }).catch((error) => {
      console.error(`Error fetching container data for path ${path}:`, error);
      return null;
    });
  }

  async getTable({ path }: { path: string }) {
    const actionUrl = "/table/full";
    const fullUrl = generateFullUrl(this.baseUrl, actionUrl, path);
    return await fetchAndParseJson({
      url: fullUrl,
      apiKey: this.apiKey,
      schema: tableGetResponse,
    }).catch((error) => {
      console.error(`Error fetching table data for path ${path}:`, error);
      return null;
    });
  }

  async getArray({ path }: { path: string }) {
    const actionUrl = "/array/full";
    const fullUrl = generateFullUrl(this.baseUrl, actionUrl, path);
    return await fetchAndParseJson({
      url: fullUrl,
      apiKey: this.apiKey,
      schema: arrayGetResponse,
    }).catch((error) => {
      console.error(`Error fetching array data for path ${path}:`, error);
      return null;
    });
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

import type { TiledClientType } from "@sophys-web/tiled-client";
import { createTiledClient } from "@sophys-web/tiled-client";
import { env } from "../../env";
import { createAsyncClientFactory } from "./singleton-factory";

const tiledFactory = async (): Promise<TiledClientType | null> => {
  const tiledUrl = env.TILED_URL;
  const tiledApiKey = env.TILED_API_KEY;

  if (!tiledUrl) {
    console.warn("TILED_URL is not defined. Tiled client will not be created.");
    return null;
  }
  if (!tiledApiKey) {
    console.warn(
      "TILED_API_KEY is not defined. Tiled client will not be created.",
    );
    return null;
  }

  const client = createTiledClient({
    baseUrl: tiledUrl,
    apiKey: tiledApiKey,
  });
  return client;
};

export const getTiledClient = createAsyncClientFactory(tiledFactory, "Tiled");

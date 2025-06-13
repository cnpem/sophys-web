import { hashRouter } from "./hash-router";
import { streamRouter } from "./stream-router";

export const storeRouter = {
  stream: streamRouter,
  hash: hashRouter,
} as const;

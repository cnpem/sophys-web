import "server-only";

import { headers } from "next/headers";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import type { AppRouter } from "@repo/api";
import { createCaller, createTRPCContext } from "@repo/api";
import { auth } from "@repo/auth";
import { createQueryClient } from "./query-client";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = async () => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    session: await auth(),
    headers: heads,
  });
};

const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  createQueryClient
);

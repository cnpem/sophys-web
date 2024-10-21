import { z } from "zod";
import { createZodFetcher } from "zod-fetch";
import { env } from "../../env";
import schemas from "../schemas/devices";
import { protectedProcedure } from "../trpc";

function namedDevices(devices_allowed: z.infer<typeof schemas.devicesAllowed>) {
  const flyables = Object.entries(devices_allowed)
    .map(([_, value]) => (value.is_flyable ? value.long_name : null))
    .filter((x) => x !== null);
  const movables = Object.entries(devices_allowed)
    .map(([_, value]) => (value.is_movable ? value.long_name : null))
    .filter((x) => x !== null);
  const readables = Object.entries(devices_allowed)
    .map(([_, value]) => (value.is_readable ? value.long_name : null))
    .filter((x) => x !== null);

  return {
    flyables,
    movables,
    readables,
  };
}

export const devicesRouter = {
  allowed: protectedProcedure.query(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/devices/allowed`;
    const fetchWithZod = createZodFetcher();
    try {
      const devices = await fetchWithZod(schemas.devicesAllowed, fetchURL, {
        method: "GET",
        headers: {
          contentType: "application/json",
          Authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        },
        body: undefined,
      });
      return devices.devices_allowed;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
  allowedNamed: protectedProcedure.query(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/devices/allowed`;
    const fetchWithZod = createZodFetcher();
    try {
      const devices = await fetchWithZod(
        schemas.devicesAllowedResponse,
        fetchURL,
        {
          method: "GET",
          headers: {
            contentType: "application/json",
            Authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
          },
          body: undefined,
        },
      );
      return namedDevices(devices.devices_allowed);
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
};

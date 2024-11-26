import { createZodFetcher } from "zod-fetch";
import { env } from "../../env";
import devicesSchema from "../schemas/devices";
import { protectedProcedure } from "../trpc";

export const devicesRouter = {
  allowedNames: protectedProcedure.query(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/devices/allowed`;
    const fetchWithZod = createZodFetcher();
    try {
      const devices = await fetchWithZod(devicesSchema, fetchURL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        },
        body: undefined,
      });
      const flyables = Object.values(devices.devices_allowed)
        .filter((d) => d.is_flyable)
        .map((d) => d.long_name);
      const movables = Object.values(devices.devices_allowed)
        .filter((d) => d.is_movable)
        .map((d) => d.long_name);
      const readables = Object.values(devices.devices_allowed)
        .filter((d) => d.is_readable)
        .map((d) => d.long_name);
      return { flyables, movables, readables };
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
};

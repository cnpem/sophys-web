import { createZodFetcher } from "zod-fetch";
import { env } from "../../env";
import devicesSchema from "../schemas/devices";
import { protectedProcedure } from "../trpc";

export const devicesRouter = {
  allowed: protectedProcedure.query(async ({ ctx }) => {
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
      return devices.devicesAllowed;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
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
      const flyables = Object.values(devices.devicesAllowed)
        .filter((d) => d.isFlyable)
        .map((d) => d.longName);
      const movables = Object.values(devices.devicesAllowed)
        .filter((d) => d.isMovable)
        .map((d) => d.longName);
      const readables = Object.values(devices.devicesAllowed)
        .filter((d) => d.isReadable)
        .map((d) => d.longName);
      return { flyables, movables, readables };
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
};

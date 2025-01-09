import { env } from "../../env";
import devicesSchema from "../schemas/devices";
import { protectedProcedure } from "../trpc";
import { zodSnakeFetcher } from "../utils";

export const devicesRouter = {
  allowed: protectedProcedure.query(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/devices/allowed`;
    try {
      const res = await zodSnakeFetcher(devicesSchema, {
        url: fetchURL,
        method: "GET",
        body: undefined,
        authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
      });
      return res.devicesAllowed;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
  allowedNames: protectedProcedure.query(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/devices/allowed`;
    try {
      const res = await zodSnakeFetcher(devicesSchema, {
        url: fetchURL,
        method: "GET",
        body: undefined,
        authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
      });
      const flyables = Object.values(res.devicesAllowed)
        .filter((d) => d.isFlyable)
        .map((d) => d.longName);
      const movables = Object.values(res.devicesAllowed)
        .filter((d) => d.isMovable)
        .map((d) => d.longName);
      const readables = Object.values(res.devicesAllowed)
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

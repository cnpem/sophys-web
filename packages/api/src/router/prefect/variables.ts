import { z } from "zod";
import { env } from "../../../env";
import prefectVariableNameSchema from "../../schemas/prefect";
import { protectedProcedure } from "../../trpc";

export type PrefectVariable = z.infer<typeof prefectVariableNameSchema>;

async function fetchVariable(name: string): Promise<PrefectVariable> {
  const fetchURL = `${env.PREFECT_API_URL}/api/variables/name/${encodeURIComponent(name)}`;
  try {
    const res = await fetch(fetchURL, {
      method: "GET",
      headers: {
        ...(env.PREFECT_API_AUTH_STRING && {
          Authorization: `Basic ${btoa(env.PREFECT_API_AUTH_STRING)}`,
        }),
      },
    });
    if (!res.ok) {
      throw new Error(
        `Failed to fetch variable ${name}. With status: ${res.status}`,
      );
    }
    return prefectVariableNameSchema.parse(await res.json());
  } catch (e) {
    if (e instanceof Error) {
      console.error(e);
      throw new Error(e.message);
    }
    throw new Error("Unknown error");
  }
}

export const prefectRouter = {
  getVariableByName: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .query(({ input }) => {
      return fetchVariable(input.name);
    }),
} as const;

import { z } from "zod";
import { env } from "../../env";
import { protectedProcedure } from "../trpc";

export const PrefectStateTypeEnum = z.enum([
  "SCHEDULED",
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "CRASHED",
  "PAUSED",
  "CANCELLING",
]);

export const PrefectStateSchema = z.object({
  id: z.string().uuid(),
  type: PrefectStateTypeEnum,
  name: z.string().nullable(),
  timestamp: z.string().datetime(),
  message: z.string().nullable(),
  data: z.any().nullable(),
});

export const PrefectRetryPolicySchema = z
  .object({
    retries: z.number().int().nullable(),
    retry_delay: z.number().int().nullable(),
    retry_type: z.enum(["in_process", "reschedule"]).nullable(),
  })
  .partial();

export const PrefectCreatorSchema = z.object({
  id: z.string().uuid().nullable(),
  type: z.string().nullable(),
  display_value: z.string().nullable(),
});

export const PrefectFlowRunSchema = z.object({
  id: z.string().uuid(),

  name: z.string(),

  flow_id: z.string().uuid(),

  state_id: z.string().uuid().nullable(),
  deployment_id: z.string().uuid().nullable(),
  deployment_version: z.string().nullable(),

  work_queue_id: z.string().uuid().nullable(),
  work_queue_name: z.string().nullable(),

  flow_version: z.string().nullable(),

  parameters: z.record(z.any()).default({}),
  idempotency_key: z.string().nullable(),
  context: z.record(z.any()).default({}),

  empirical_policy: PrefectRetryPolicySchema.optional(),

  tags: z.array(z.string()).default([]),

  labels: z.record(z.union([z.string(), z.number(), z.boolean()])).default({}),

  parent_task_run_id: z.string().uuid().nullable(),

  state_type: PrefectStateTypeEnum.nullable(),
  state_name: z.string().nullable(),

  run_count: z.number().int().default(0),

  expected_start_time: z.string().datetime().nullable(),
  next_scheduled_start_time: z.string().datetime().nullable(),
  start_time: z.string().datetime().nullable(),
  end_time: z.string().datetime().nullable(),

  total_run_time: z.number().default(0),
  estimated_run_time: z.number().default(0),
  lateness: z.number().default(0),

  auto_scheduled: z.boolean().default(false),

  infrastructure_document_id: z.string().uuid().nullable(),
  infrastructure_pid: z.string().nullable(),

  created_by: PrefectCreatorSchema.nullable(),

  work_pool_id: z.string().uuid().nullable(),
  work_pool_name: z.string().nullable(),

  state: PrefectStateSchema.nullable(),

  job_variables: z.record(z.any()).nullable(),
});

export const PrefectFlowRunArraySchema = z.array(PrefectFlowRunSchema);

export type PrefectFlowRun = z.infer<typeof PrefectFlowRunSchema>;
export type PrefectState = z.infer<typeof PrefectStateSchema>;

export interface PrefectArtifact {
  id: string;
  key: string;
  type: string;
  data: unknown;
  description?: string | null;
  created: string;
}

async function fetchFlowRuns(
  page: number,
  pageSize: number,
  token: string,
): Promise<PrefectFlowRun[]> {
  const res = await fetch(`${env.PREFECT_API_URL}/api/flow_runs/filter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      limit: pageSize,
      offset: page * pageSize,
      sort: "START_TIME_DESC",
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch flow runs");
  }

  const json = await res.json();
  return json ?? [];
}

async function fetchArtifacts(flowRunId: string): Promise<PrefectArtifact[]> {
  const res = await fetch(`${env.PREFECT_API_URL}/api/artifacts/filter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sort: "CREATED_DESC",
      flow_runs: {
        id: {
          any_: [flowRunId],
        },
      },
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch artifacts");
  }

  const json = await res.json();

  return json.artifacts ?? json ?? [];
}

export const prefectRouter = {
  listRunsWithArtifacts: protectedProcedure
    .input(
      z.object({
        page: z.number().default(0),
        pageSize: z.number().default(5),
      }),
    )
    .query(async ({ input }) => {
      const runs = await fetchFlowRuns(input.page, input.pageSize, "");

      const runsWithArtifacts = await Promise.all(
        runs.map(async (run) => ({
          ...run,
          artifacts: await fetchArtifacts(run.id),
        })),
      );

      return {
        page: input.page,
        pageSize: input.pageSize,
        runs: runsWithArtifacts,
      };
    }),
} as const;

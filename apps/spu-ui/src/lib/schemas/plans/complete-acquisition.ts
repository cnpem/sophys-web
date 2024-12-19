import { z } from "zod";
import {
  acquireTimeOptions,
  cleaningAgents,
  sampleTypeOptions,
  trayColumns,
  trayOptions,
  trayRows,
} from "../../constants";

const name = "setup1_complete_standard_acquisition";

const acquireTimeMapping: Record<number, (typeof acquireTimeOptions)[number]> =
  {
    200: "200",
    100: "100",
    50: "50",
    25: "25",
    12.5: "12.5",
    6.25: "6.25",
    3.125: "3.125",
    1.5625: "1.5625",
    0.5: "0.5",
  } as const;

const tableSchema = z.object({
  sampleType: z
    .string()
    .transform((val) => val.trimStart().trimEnd())
    .pipe(
      z.enum(sampleTypeOptions, {
        message: "Sample type must be either 'buffer' or 'sample'",
      }),
    ),
  sampleTag: z
    .string()
    .min(1, "Sample name or other form of identification is required")
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message:
        "Sample tag can only contain letters, numbers, dashes, and underscores",
    }),
  bufferTag: z.string(),
  tray: z
    .string()
    .transform((val) => val.trimStart().trimEnd())
    .pipe(
      z.enum(trayOptions, {
        message: `Tray must be one of the following options ${trayOptions.join(", ")}`,
      }),
    ),
  row: z
    .string()
    .transform((val) => val.trimStart().trimEnd())
    .pipe(
      z.enum(trayRows, {
        message: `Row must be one of the following options ${trayRows.join(", ")}`,
      }),
    ),
  col: z.coerce
    .string()
    .transform((val) => val.trimStart().trimEnd())
    .pipe(
      z.enum(trayColumns, {
        message: `Column must be one of the following options ${trayColumns.join(", ")}`,
      }),
    ),
  acquireTime: z
    .string()
    .transform((val) => parseFloat(val.trim().replace(",", ".")))
    .refine(
      (val) => {
        if (isNaN(val)) {
          return false;
        }
        return acquireTimeMapping[val] !== undefined;
      },
      {
        message: `Acquire time must be one of the following options ${Object.values(acquireTimeMapping).join(", ")}`,
      },
    )
    .transform((val) => acquireTimeMapping[val]),
  volume: z.coerce.number().min(0, "Volume must be a positive number"),
  temperature: z.coerce.number().positive(),
  numExposures: z.coerce
    .number()
    .min(1, "Number of exposures must be at least 1"),
  expUvTime: z.coerce.number({
    message: "Exposure UV time must be a number",
  }),
  measureUvNumber: z.coerce.number({
    message: "Measure UV number must be a number",
  }),
});

const cleaningSchema = z
  .object({
    standardOption: z.string().optional(),
    agentsList: z
      .array(
        z.enum(cleaningAgents, {
          message: `Agents must be one of ${cleaningAgents.join(", ")}`,
        }),
      )
      .optional(),
    agentsDuration: z
      .array(z.number(), {
        message: "Duration must be a number",
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.standardOption || data.standardOption === "custom") {
      if (!data.agentsList || !data.agentsDuration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Custom cleaning option requires agents and durations",
        });
      }
      if (data.agentsList?.length !== data.agentsDuration?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Agents and durations must have the same length",
        });
      }
    } else {
      if (data.agentsList || data.agentsDuration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Standard cleaning options cannot have agents or durations",
        });
      }
    }
  });

const schema = z.object({
  sampleTag: z.string(),
  sampleType: z.enum(sampleTypeOptions),
  bufferTag: z.string(),
  tray: z.enum(trayOptions),
  row: z.enum(trayRows),
  col: z.enum(trayColumns),
  volume: z.number(),
  acquireTime: z.enum(acquireTimeOptions),
  numExposures: z.number(),
  expUvTime: z.number(),
  measureUvNumber: z.number(),
  standardOption: z.string().optional(),
  agentsList: z.array(z.string()).optional(),
  agentsDuration: z.array(z.number()).optional(),
  proposal: z.string(),
});

export { name, schema, tableSchema, cleaningSchema };
export type PlanKwargs = z.infer<typeof schema>;

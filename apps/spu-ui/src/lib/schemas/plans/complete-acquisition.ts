import { z } from "zod";
import {
  cleaningAgents,
  cleaningOptions,
  picoloChannels,
  sampleTypeOptions,
  trayColumns,
  trayOptions,
  trayRows,
} from "../../constants";

const name = "setup1_complete_standard_acquisition";

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
  bufferTag: z.string().optional(),
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
  acquireTime: z.coerce
    .number()
    .min(0.1, "Acquire time (in seconds) must be at least 0.1"),
  volume: z.coerce.number().min(0, "Volume must be a positive number"),
  temperature: z.coerce.number().positive(),
  setTemperature: z.boolean().optional(),
  numExposures: z.coerce
    .number()
    .min(1, "Number of exposures must be at least 1"),
  expUvTime: z.coerce.number({
    message: "Exposure UV time must be a number",
  }),
  measureUvNumber: z.coerce.number({
    message: "Measure UV number must be a number",
  }),
  picoloChannel: z.enum(picoloChannels).optional(),
});

const cleaningSchema = z
  .object({
    standardOption: z.string().optional(),
    agentsList: z
      .array(
        z.enum(cleaningAgents, {
          message: `Agents must be one of ${cleaningAgents.join(", ")}`,
        }),
        {
          message: `Agents must be a list of strings`,
        },
      )
      .optional(),
    agentsDuration: z
      .array(
        z.coerce.number({
          message: "Duration must be a number",
        }),
        {
          message: "Duration must be a list of numbers",
        },
      )
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
  sampleType: z.enum(sampleTypeOptions),
  sampleTag: z.string(),
  bufferTag: z.string().optional(),
  tray: z.enum(trayOptions),
  row: z.enum(trayRows),
  col: z.enum(trayColumns),
  volume: z.number(),
  acquireTime: z.coerce
    .number()
    .min(0.1, "Acquire time (in seconds) must be at least 0.1"),
  numExposures: z.number(),
  expUvTime: z.number(),
  measureUvNumber: z.number(),
  standardOption: z
    .enum(cleaningOptions)
    .optional()
    .default("normal")
    .refine((val) => val !== "custom", {
      message: "Custom cleaning option is not supported in this schema",
    }),
  agentsList: z.array(z.string()).optional(),
  agentsDuration: z.array(z.number()).optional(),
  proposal: z.string(),
  temperature: z.number().positive(),
  setTemperature: z.boolean().optional(),
  picoloChannel: z.enum(picoloChannels).optional(),
});

export { name, schema, tableSchema, cleaningSchema };
export type PlanKwargs = z.infer<typeof schema>;

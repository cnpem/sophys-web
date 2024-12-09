import { z } from "zod";
import {
  acquireTimeOptions,
  trayColumns,
  trayOptions,
  trayRows,
} from "../constants";

export const info = {
  sampleType: "Type of the sample to be measured (buffer or sample)",
  sampleTag: "Tag (Identifier) of the sample to be measured.",
  bufferTag: "Buffer tag to be linked for this experiment.",
  tray: "Desired tray for collection",
  row: "Sample row in the Tray",
  col: "Sample column in the Tray",
  volume: "Amount of the sample to be collected in uL.",
  acquireTime:
    "The time for the acquisition of one sample in milliseconds in both pimega and picolo.",
  numExposures: "Number of acquisitions to be made.",
  expUvTime: "Exposure time of the UV-Vis spectrum.",
  measureUvNumber: "Number of measurements in the UV-Vis spectrum.",
  proposal: "Proposal associated with the experiment being executed.",
  standardOption: "Standard pre determined cleaning agent types and durations.",
};

function checkSampleType(sampleType: string): boolean {
  return ["buffer", "sample"].includes(sampleType);
}

function checkColumn(colNumber: number): boolean {
  const colString = colNumber
    .toString()
    .padStart(2, "0") as (typeof trayColumns)[number];
  return trayColumns.includes(colString);
}

function checkRow(row: string): boolean {
  return trayRows.includes(row as (typeof trayRows)[number]);
}

function checkTray(tray: string): boolean {
  return trayOptions.includes(tray as (typeof trayOptions)[number]);
}

function checkAcquireTime(acquireTime: number): boolean {
  return acquireTimeOptions.includes(
    acquireTime as (typeof acquireTimeOptions)[number],
  );
}

export const tableSchema = z.object({
  sampleType: z
    .string()
    .min(1, "Sample type is required")
    .refine((type) => checkSampleType(type), {
      message: "Sample type must be 'buffer' or 'sample'",
    }),
  sampleTag: z
    .string()
    .min(1, "Sample name or other form of identification is required")
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message:
        "Sample tag can only contain letters, numbers, dashes, and underscores",
    }),
  bufferTag: z.string(), // validated when the full list of samples is parsed
  tray: z.string().refine((tray) => checkTray(tray), {
    message: `Tray must be one of the following options ${trayOptions.join(", ")}`,
  }),
  row: z.string().refine((row) => checkRow(row), {
    message: `Row must be one of the following options ${trayRows.join(", ")}`,
  }),
  col: z.coerce.number().refine((col) => checkColumn(col), {
    message: `Column must be one of the following options ${trayColumns.join(", ")}`,
  }),
  volume: z.coerce.number().min(0, "Volume must be a positive number"),
  acquireTime: z
    .string()
    .transform((val) => Number(`${val}`.replace(",", ".")))
    .pipe(
      z.number().refine((acquireTime) => checkAcquireTime(acquireTime), {
        message: `Acquire time (ms) must be one of the following options ${acquireTimeOptions.join("; ")}`,
      }),
    ),
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

// the sampleTableItemSchema is the schema expected for all lines of the CSV file
// so it extends the sampleSubmitSchema and adds the order field used for
// submitting the full list of samples
export const tableItemSchema = tableSchema
  .extend({
    order: z.coerce.number(),
    cleaningProcedure: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.sampleType !== "buffer") {
      if (!data.bufferTag) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Buffer tag is required for non-buffer samples.`,
        });
      }
    }
  });

export type TableItem = z.infer<typeof tableItemSchema>;

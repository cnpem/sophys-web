import { z } from "zod";
import {
  acquireTimeOptions,
  trayColumns,
  trayOptions,
  trayRows,
} from "../constants";

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

// the sampleSubmitSchema is the schema expected for submitting a single sample to the queue API
export const sampleSubmitSchema = z.object({
  sampleType: z
    .string()
    .min(1, "Sample type is required")
    .refine((type) => checkSampleType(type), {
      message: "Sample type must be 'buffer' or 'sample'",
    }),
  sampleTag: z
    .string()
    .min(1, "Sample name or other form of identification is required")
    .refine((s) => !s.includes("/"), {
      message: "Sample tag cannot have the slash (/) character",
    }),
  bufferTag: z.string(),
  tray: z.string().refine((tray) => checkTray(tray)),
  row: z.string().refine((row) => checkRow(row)),
  col: z.coerce.number().refine((col) => checkColumn(col)),
  volume: z.coerce.number(),
  acquireTime: z
    .string()
    .transform((val) => Number(`${val}`.replace(",", ".")))
    .pipe(
      z.number().refine((acquireTime) => checkAcquireTime(acquireTime), {
        message: `Acquire time (ms) must be one of the following options ${acquireTimeOptions.join(", ")}`,
      }),
    ),
  numExposures: z.coerce.number(),
  expUvTime: z.coerce.number(),
  measureUvNumber: z.coerce.number(),
});

// the sampleSchema is the schema expected for all lines of the CSV file
// so it extends the sampleSubmitSchema and adds the order field used for
// submitting the full list of samples
export const sampleSchema = sampleSubmitSchema
  .extend({
    order: z.coerce.number(),
  })
  .superRefine((data, ctx) => {
    if (data.sampleType !== "buffer") {
      if (!data.bufferTag) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Buffer tag is required for non-buffer samples",
        });
      }
    }
  });

export type SampleParams = z.infer<typeof sampleSchema>;

// the csv file will parse an array of sampleSchema objects.
// there is a higher level validation that all bufferTag values must exist in the list
// of all sampleTag values except for the buffer samples themselves
// which will ignore the bufferTag field
export const samplesSchema = z.array(sampleSchema).superRefine((data, ctx) => {
  const sampleIds = data.map((s) => s.sampleTag);
  const missingBufferTagsInSamples = data.filter(
    (s) => s.sampleType !== "buffer" && !sampleIds.includes(s.bufferTag),
  );
  if (missingBufferTagsInSamples.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Buffer references must be one of the samples. Missing references in: \
      ${missingBufferTagsInSamples.map((s) => s.bufferTag).join(", ")}`,
    });
  }
});

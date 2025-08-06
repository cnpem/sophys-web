import { z } from "zod";

/**
 * interesting pvs
 *
 * SPU:B:PICO02:Current1 Changes rapidly and is a good test case vtype is VDouble
 * SPU:B:RIO01:9401H:bo5 Does not change rapidly but is a good test case vtype is VEnum
 * sim://sine is a good test case for a simulated PV vtype is VDouble
 */

// export const PVWS_URL = "http://10.30.1.50:3000/pvws/"; // this should become an env variable
// export const PVWS_URL = env.PVWS_URL;

const numberFieldSchema = z.union([
  z.number(),
  z.literal("NaN", { description: "Special case for NaN values" }),
]);

export const updateMessageSchema = z
  .object({
    pv: z.string().describe("Name of the PV"),
    readonly: z.boolean().describe("'true' for read-only PV, no write access"),
    type: z.literal("update").describe("Type of the pvws message"),
    seconds: z
      .number()
      .describe("Timestamp seconds since January 1, 1970 epoch"),
    nanos: z.number().describe("Timestamp nanoseconds since epoch"),
    vtype: z.string().describe("Value type of the PV"), // this is not in the documentation but is present in the data
    units: z.string().nullable().optional().describe("Numeric PV units"),
    description: z.string().nullable().optional(), // this is not in the documentation but is present in the data
    precision: z.number().describe("Numeric PV precision"),
    min: numberFieldSchema.describe("Low end of expected value range"),
    max: numberFieldSchema.describe("High end of expected value range"),
    warn_low: numberFieldSchema.describe("Low end of warning range"),
    warn_high: numberFieldSchema.describe("High end of warning range"),
    alarm_low: numberFieldSchema.describe("Low end of alarm range"),
    alarm_high: numberFieldSchema.describe("High end of alarm range"),
    severity: z
      .enum(["NONE", "MINOR", "MAJOR", "INVALID", "UNDEFINED"])
      .describe("Severity of the Alarm or Warning?"),
    value: numberFieldSchema.describe(
      "Value of numeric PV or 'NaN'; Enum PV's numeric value",
    ),
    text: z
      .string()
      .nullable()
      .optional()
      .describe("Text value of the PV, if applicable; Enum PV's text value"),
  })
  .partial()
  .omit({ type: true });

export type PvData = z.infer<typeof updateMessageSchema>;

import { z } from "zod";
import { appSchema as acquisitionSchema } from "./acquisition";

// the sampleTableItemSchema is the schema expected for all lines of the CSV file
// so it extends the sampleSubmitSchema and adds the order field used for
// submitting the full list of samples
export const tableItemSchema = acquisitionSchema
  .omit({ proposal: true })
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

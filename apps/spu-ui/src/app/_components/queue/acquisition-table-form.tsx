import { zodResolver } from "@hookform/resolvers/zod";
import { MoveRightIcon } from "lucide-react";
import { parse } from "papaparse";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@sophys-web/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@sophys-web/ui/form";
import { Input } from "@sophys-web/ui/input";
import { toast } from "@sophys-web/ui/sonner";
import { tableSchema as acquisitionTableSchema } from "../../../lib/schemas/plans/complete-acquisition";

const TABLE_DATA_SKIP_INDEX = 2;
interface TableLineError {
  lineIndex: number;
  message: string;
  issues: { path: string; message: string }[];
}
interface TableValidationError {
  lineIndex: number;
  message: string;
}

async function parseFileToTableAsync(file: File) {
  const data: z.infer<typeof acquisitionTableSchema>[] = [];
  const lineErrors: TableLineError[] = [];
  const validationErrors: TableValidationError[] = [];
  // Parse CSV file
  await new Promise<void>((resolve, reject) => {
    parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data: csvData, errors: parseErrors } = results;
        if (parseErrors.length > 0) {
          console.error("Error reading CSV file", parseErrors);
          reject(
            new Error(
              `Error reading CSV file: ${parseErrors
                .map((e) => e.message)
                .join(", ")}`,
            ),
          );
          return;
        }
        csvData.forEach((tableItem, index) => {
          const result = acquisitionTableSchema.safeParse(tableItem);
          if (!result.success) {
            console.error(
              `Error parsing table item on line ${index + 1}`,
              result.error,
            );
            lineErrors.push({
              lineIndex: index + TABLE_DATA_SKIP_INDEX,
              message: `Error parsing table item on line ${index + 1}`,
              issues: result.error.issues.map((issue) => ({
                path: issue.path.toString(),
                message: issue.message,
              })),
            });
            return;
          }
          data.push(result.data);
        });
        resolve();
      },
    });
  });
  // Validate table data consistency
  const positionMap = new Map<string, z.infer<typeof acquisitionTableSchema>>();
  data.forEach((item, index) => {
    const key = `${item.row}-${item.col}-${item.tray}`;
    if (positionMap.has(key)) {
      const existingItem = positionMap.get(key);
      if (existingItem && existingItem.sampleTag !== item.sampleTag) {
        validationErrors.push({
          lineIndex: index + TABLE_DATA_SKIP_INDEX,
          message: `Inconsistent sample tags at position (${key}). Trying to add "${item.sampleTag}" but "${existingItem.sampleTag}" is already set.`,
        });
      }
    } else {
      positionMap.set(key, item);
    }
  });
  return { data, lineErrors, validationErrors };
}

const acquisitionTableFormSchema = z.object({
  file: z.instanceof(File),
});
export function AcquisitionTableForm({
  onSubmit,
}: {
  onSubmit: (data: z.infer<typeof acquisitionTableSchema>[]) => void;
}) {
  const form = useForm<z.infer<typeof acquisitionTableFormSchema>>({
    resolver: zodResolver(acquisitionTableFormSchema),
  });

  async function onSubmitFile(
    data: z.infer<typeof acquisitionTableFormSchema>,
  ) {
    try {
      const {
        data: parsedData,
        lineErrors,
        validationErrors,
      } = await parseFileToTableAsync(data.file);
      if (lineErrors.length > 0) {
        lineErrors.forEach((err) => {
          toast.error(err.message, {
            description: (
              <div>
                <ul>
                  {err.issues.map((issue, i) => (
                    <li key={i} className="ml-4 list-disc">
                      <span className="font-bold">{`${issue.path}: `}</span>
                      {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            ),
            closeButton: true,
          });
        });
      }
      if (validationErrors.length > 0) {
        validationErrors.forEach((err) => {
          toast.error(`Error validating table data on line ${err.lineIndex}`, {
            description: <div>{err.message}</div>,
            closeButton: true,
          });
        });
      }
      if (lineErrors.length === 0 && validationErrors.length === 0) {
        onSubmit(parsedData);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Error parsing CSV file", {
        description: message,
        closeButton: true,
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitFile)}
        className="flex flex-col items-end space-y-8"
      >
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CSV Queue</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file !== undefined) {
                      field.onChange(file);
                    }
                  }}
                />
              </FormControl>
              <FormDescription>
                This is the CSV file containing the experiment queue.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          Next
          <MoveRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
}

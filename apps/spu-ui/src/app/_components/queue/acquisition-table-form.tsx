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

  function parseFileToTable(file: File) {
    return new Promise<z.infer<typeof acquisitionTableSchema>[]>(
      (resolve, reject) => {
        parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const { data: csvData, errors } = results;
            if (errors.length > 0) {
              console.error("Error reading CSV file", errors);
              reject(
                new Error(
                  `Error reading CSV file: ${errors.map((e) => e.message).join(", ")}`,
                ),
              );
              return;
            }
            const parsedData = csvData
              .map((data, index) => {
                const result = acquisitionTableSchema.safeParse(data);
                if (!result.success) {
                  console.error(
                    `Error parsing table item on line ${index + 1}`,
                    result.error.message,
                  );
                  toast.error(`Error parsing table item on line ${index + 1}`, {
                    description: result.error.issues
                      .map((issue) => issue.message)
                      .join(", "),
                    closeButton: true,
                  });
                  return null;
                }
                return result.data;
              })
              .filter(
                (item): item is z.infer<typeof acquisitionTableSchema> =>
                  item !== null,
              );
            if (parsedData.length < csvData.length) {
              reject(
                new Error(
                  "Error parsing table items. See previous messages for details",
                ),
              );
            }
            resolve(parsedData);
          },
        });
      },
    );
  }

  function onSubmitFile(data: z.infer<typeof acquisitionTableFormSchema>) {
    parseFileToTable(data.file)
      .then((data) => {
        onSubmit(data);
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        toast.error("Error parsing CSV file", {
          description: message,
          closeButton: true,
        });
      });
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

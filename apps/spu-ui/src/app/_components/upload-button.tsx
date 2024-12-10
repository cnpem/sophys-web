"use client";

import { useRef, useState } from "react";
import { parse } from "papaparse";
import { cn } from "@sophys-web/ui";
import { buttonVariants } from "@sophys-web/ui/button";
import { Input } from "@sophys-web/ui/input";
import { Label } from "@sophys-web/ui/label";
import { toast } from "@sophys-web/ui/sonner";
import type { SampleParams } from "../../lib/schemas/sample";
import type { TableItem } from "../../lib/schemas/table";
import type { Sample } from "./sample";
import { useSSEData } from "../_hooks/use-sse-data";
import { tableItemSchema } from "../../lib/schemas/table";
import { setSamples as setServerSamples } from "../actions/samples";
import { samplePosition } from "./experiment";

interface ButtonProps {
  children: React.ReactNode;
}

export function UploadButton(props: ButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const { data: samples } = useSSEData<Sample[]>("/api/samples");

  const uploadSamples = async (data: SampleParams[]) => {
    const prevSamples = samples;
    const newSamples = data.map((sample) => {
      const { complete, relative } = samplePosition(
        sample.row,
        sample.col,
        sample.tray,
      );
      return {
        id: complete,
        relativePosition: relative,
        type: sample.sampleType,
        ...sample,
      } as Sample;
    });
    if (!prevSamples) {
      await setServerSamples(newSamples);
      return;
    }
    const updatedSamples = prevSamples.map((prevSample) => {
      const newSample = newSamples.find(
        (sample) => sample.id === prevSample.id,
      );
      return newSample ?? prevSample;
    });
    await setServerSamples(updatedSamples);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <Label
        className={cn(
          buttonVariants({ variant: "link" }),
          "flex cursor-pointer items-center",
        )}
        htmlFor="upload-button"
      >
        {props.children}
      </Label>
      <Input
        accept=".csv"
        className="sr-only"
        id="upload-button"
        onChange={(e) => {
          toast.info("Parsing CSV file...");
          const files = e.target.files;
          if (!files) return;
          const file = files[0];
          if (!file) {
            toast.error("No file selected");
            return;
          }
          parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const { data: csvData, errors } = results;
              if (errors.length > 0) {
                console.error("Error reading CSV file", errors);
                toast.error("Error reading CSV file", {
                  description: errors.map((error) => error.message).join("\n"),
                });
                return;
              }
              const parsedData = csvData
                .map((data, index) => {
                  const result = tableItemSchema.safeParse(data);
                  if (!result.success) {
                    console.error(
                      `Error parsing table item on line ${index + 1}`,
                      result.error.message,
                    );
                    const messages = result.error.errors.map(
                      (error) => error.message,
                    );
                    if (messages.length > 0) {
                      toast.error(
                        `Error parsing table item on line ${index + 1}`,
                        {
                          description: messages.join("; "),
                        },
                      );
                      setErrorMessages(messages);
                    }
                    return null;
                  }
                  return result.data;
                })
                .filter((item): item is TableItem => item !== null);
              if (parsedData.length === 0) {
                console.error("Error parsing table items. No data returned");
                toast.error("Error parsing table items. No data returned");
                return;
              }
              // toast.success("CSV file parse complete");
              if (errorMessages.length > 0) {
                toast.info("CSV file parsed with errors");
              } else {
                toast.success("CSV file parsed successfully");
              }
              void uploadSamples(parsedData);
            },
          });
          if (inputRef.current) {
            inputRef.current.value = "";
          }
        }}
        ref={inputRef}
        type="file"
      />
    </div>
  );
}

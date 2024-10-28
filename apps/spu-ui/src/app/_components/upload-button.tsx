"use client";

import { useRef } from "react";
import { parse } from "papaparse";
import { cn } from "@sophys-web/ui";
import { buttonVariants } from "@sophys-web/ui/button";
import { Input } from "@sophys-web/ui/input";
import { Label } from "@sophys-web/ui/label";
import { toast } from "@sophys-web/ui/sonner";
import type { SampleParams } from "../../lib/schemas/sample";
import { samplesSchema } from "../../lib/schemas/sample";

interface ButtonProps {
  children: React.ReactNode;
  handleUpload: (data: SampleParams[]) => void;
}

export function UploadButton(props: ButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
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
          parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
              const { data: csvData, errors } = results;
              if (errors.length > 0) {
                console.error("Error reading CSV file", errors);
                toast.error("Error reading CSV file", {
                  description: errors.map((error) => error.message).join("\n"),
                });
                return;
              }
              const parsedData = await samplesSchema.safeParseAsync(csvData);
              if (!parsedData.success) {
                console.error(
                  "Error parsing expected file variables",
                  parsedData.error.errors,
                );
                toast.error("Error parsing expected file variables", {
                  description: parsedData.error.errors
                    .map((err) => err.message)
                    .join("\n"),
                });
                return;
              }
              toast.success("CSV file parsed successfully");
              props.handleUpload(parsedData.data);
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

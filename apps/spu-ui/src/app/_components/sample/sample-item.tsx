import { PlusIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import type {
  sampleTypeOptions,
  trayColumns,
  trayOptions,
  trayRows,
} from "~/lib/constants";
import { LoadSampleForm } from "./load-sample-form";
import { RegisterSampleForm } from "./register-sample-form";

export interface Sample {
  id: string | number;
  relativePosition: string;
  sampleTag: string | undefined;
  bufferTag: string | undefined;
  type: (typeof sampleTypeOptions)[number] | undefined;
  row: (typeof trayRows)[number];
  col: (typeof trayColumns)[number];
  tray: (typeof trayOptions)[number];
}

export function SampleItem({ sample }: { sample: Sample }) {
  const isRegistered = sample.type !== undefined;
  return (
    <>
      {!isRegistered ? (
        <RegisterSampleForm sample={sample}>
          <Button
            variant="outline"
            size="icon"
            className="bg-muted cursor-cell rounded-full text-sm opacity-50 select-none hover:scale-105 hover:ring hover:ring-slate-400"
          >
            <PlusIcon className="size-4" />
          </Button>
        </RegisterSampleForm>
      ) : (
        <LoadSampleForm sample={sample}>
          <Button
            data-sample-type={sample.type}
            variant="outline"
            size="icon"
            className="cursor-context-menu rounded-full text-sm select-none hover:scale-105 hover:ring data-[sample-type=buffer]:border-emerald-400 data-[sample-type=buffer]:bg-emerald-200 data-[sample-type=buffer]:text-emerald-800 data-[sample-type=buffer]:hover:bg-emerald-300 data-[sample-type=sample]:border-sky-400 data-[sample-type=sample]:bg-sky-200 data-[sample-type=sample]:text-sky-800 data-[sample-type=sample]:hover:bg-sky-300"
          >
            {sample.type?.charAt(0) ?? "-"}
          </Button>
        </LoadSampleForm>
      )}
    </>
  );
}

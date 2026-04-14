import { useState } from "react";
import { cva } from "class-variance-authority";
import {
  CameraIcon,
  EraserIcon,
  PencilIcon,
  PipetteIcon,
  PlusIcon,
} from "lucide-react";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sophys-web/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import { Field, FieldLabel } from "@sophys-web/ui/field";
import { Progress } from "@sophys-web/ui/progress";
import type { Sample } from "./use-sample-store";
import { CompleteAcquisitionForm } from "../../plans/complete-aquisition-form";
import { initialVolume, trayColumns, trayOptions, trayRows } from "./constants";
import { DeleteSampleForm } from "./delete-sample-form";
import { LoadSampleForm } from "./load-sample-form";
import { RegisterSampleForm } from "./register-sample-form";
import { positionFromSampleId, useSampleStore } from "./use-sample-store";

/**
 * Sample item component representing an empty slot or a registered sample.
 * @param sample - The sample data or undefined if the slot is empty.
 * @param sampleId - The unique identifier for the sample slot.
 *
 * @example
 * <SampleItem sample={sample} sampleId="Tray1-A1" />
 */
export function SampleItem({
  sample,
  sampleId,
}: {
  sample: Sample | undefined;
  sampleId: string;
}) {
  // if sample is undefined, render empty slot
  if (!sample) {
    return <EmptySampleSlotDialog sampleId={sampleId} />;
  }

  // if sample is defined, render registered sample
  return <SampleDropdownMenu sample={sample} />;
}

function EmptySampleSlotDialog({
  sampleId,
  trigger,
}: {
  sampleId: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { tray, col, row } = positionFromSampleId(sampleId);
  const { error } = useSampleStore();

  // check if tray, row and col are valid values, if not return null
  if (
    !trayOptions.includes(tray as (typeof trayOptions)[number]) ||
    !trayRows.includes(row as (typeof trayRows)[number]) ||
    !trayColumns.includes(col as (typeof trayColumns)[number])
  ) {
    return null;
  }
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      {!trigger && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="cursor-cell rounded-full bg-zinc-100 text-sm opacity-50 select-none hover:scale-105 hover:ring hover:ring-slate-400"
            disabled={!!error}
          >
            <PlusIcon className="size-4" />
          </Button>
        </DialogTrigger>
      )}
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="flex w-fit flex-col items-center">
        <DialogHeader>
          <DialogTitle>Register sample</DialogTitle>
          <DialogDescription className="flex flex-col items-start">
            <span>{`position: ${tray}-${row}${col}`}</span>
          </DialogDescription>
        </DialogHeader>
        <RegisterSampleForm
          tray={tray as (typeof trayOptions)[number]}
          row={row as (typeof trayRows)[number]}
          column={col as (typeof trayColumns)[number]}
          onSubmitCallback={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function SampleInfo({
  sample,
  className,
}: {
  sample: Sample;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      <p>{`${sample.tray}-${sample.row}${sample.col}`}</p>
      <p>{`type: ${sample.sampleType}`}</p>
      <p>{`name: ${sample.sampleTag}`}</p>
      {sample.bufferTag && <p>{`buffer: ${sample.bufferTag}`}</p>}
      <Field className="w-full max-w-sm gap-2">
        <FieldLabel htmlFor="sample-volume">
          <span>volume:</span>
          <span className="ml-auto">{sample.volume} µL</span>
        </FieldLabel>
      </Field>
    </div>
  );
}

export const sampleTypeVariants = cva(
  "border border-gray-300 bg-white text-gray-800 hover:bg-gray-100",
  {
    variants: {
      sampleType: {
        sample: "border-cyan-400 bg-cyan-300 text-cyan-800 hover:bg-cyan-300",
        buffer:
          "border-cyan-300 bg-cyan-200/60 text-cyan-600 hover:bg-cyan-200",
      },
    },
    defaultVariants: {
      sampleType: "sample",
    },
  },
);

/**
 * Trigger component for the sample dropdown menu, displaying the sample type and allowing access to sample actions.
 * Also renders its background color based on the sample type (cyan for samples, light cyan for buffers).
 * The background color changes height to indicate the remaining volume of the sample (full height for 100% volume, empty for 0% volume).
 * @param sample - The sample data to determine the display and actions.
 *
 * @example
 * <SampleDropdownTrigger sample={sample} />
 */
function SampleDropdownTrigger({ sample }: { sample: Sample }) {
  return (
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          "relative size-9 cursor-context-menu overflow-hidden rounded-full text-sm select-none hover:scale-105 hover:ring",
          sampleTypeVariants({ sampleType: sample.sampleType }),
        )}
      >
        <div
          className="bg-muted absolute inset-0 top-0 w-9"
          id="negative-space-volume-fill"
          style={{
            height: `${(1 - sample.volume / initialVolume) * 100}%`,
          }}
        ></div>
        <span className="relative z-10">{sample.sampleType.charAt(0)}</span>
      </Button>
    </DropdownMenuTrigger>
  );
}

function SampleDropdownMenu({ sample }: { sample: Sample }) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <SampleDropdownTrigger sample={sample} />
      <DropdownMenuContent>
        <DropdownMenuItem disabled className="flex flex-col items-start gap-1">
          <SampleInfo sample={sample} />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <EditSampleMenuItem
          sample={sample}
          onSubmitCallback={() => setOpen(false)}
        />
        <DeleteSampleMenuItem
          sample={sample}
          onSubmitCallback={() => setOpen(false)}
        />
        <DropdownMenuSeparator />
        <LoadSampleMenuItem
          sample={sample}
          onSubmitCallback={() => setOpen(false)}
        />
        <CompleteAcquisitionMenuItem
          sample={sample}
          onSubmitCallback={() => setOpen(false)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EditSampleMenuItem({
  sample,
  onSubmitCallback,
}: {
  sample: Sample;
  onSubmitCallback?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const handleOpen = (e: Event) => {
    e.preventDefault();
    setOpen(true);
  };
  const handleSubmitSuccess = () => {
    setOpen(false);
    onSubmitCallback?.();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={handleOpen}>
          <PencilIcon className="mr-2 size-4" />
          Edit
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="flex w-fit flex-col items-center">
        <DialogHeader>
          <DialogTitle>Edit sample</DialogTitle>
          <DialogDescription className="flex flex-col items-start">
            <span>{`position: ${sample.tray}-${sample.row}${sample.col}`}</span>
          </DialogDescription>
        </DialogHeader>
        <RegisterSampleForm
          tray={sample.tray}
          row={sample.row}
          column={sample.col}
          sampleType={sample.sampleType}
          sampleTag={sample.sampleTag}
          bufferTag={sample.bufferTag}
          volume={sample.volume}
          onSubmitCallback={handleSubmitSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

function DeleteSampleMenuItem({
  sample,
  onSubmitCallback,
}: {
  sample: Sample;
  onSubmitCallback?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const handleOpen = (e: Event) => {
    e.preventDefault();
    setOpen(true);
  };
  const handleSubmitSuccess = () => {
    setOpen(false);
    onSubmitCallback?.();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={handleOpen}>
          <EraserIcon className="mr-2 size-4" />
          Delete
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="flex w-fit flex-col items-center">
        <DialogHeader>
          <DialogTitle>Deleting sample</DialogTitle>
          <DialogDescription className="flex flex-col items-start"></DialogDescription>
        </DialogHeader>
        <SampleInfo sample={sample} />
        <DeleteSampleForm
          sample={sample}
          onSubmitCallback={handleSubmitSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

function LoadSampleMenuItem({
  sample,
  onSubmitCallback,
}: {
  sample: Sample;
  onSubmitCallback?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const handleOpen = (e: Event) => {
    e.preventDefault();
    setOpen(true);
  };
  const handleSubmitSuccess = () => {
    setOpen(false);
    onSubmitCallback?.();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={handleOpen}>
          <PipetteIcon className="mr-2 size-4" />
          Load
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="flex w-fit flex-col items-center">
        <DialogHeader>
          <DialogTitle>Load sample</DialogTitle>
          <DialogDescription className="flex flex-col items-start">
            <span>{`position: ${sample.tray}-${sample.row}${sample.col}`}</span>
            <span>{`type: ${sample.sampleType}`}</span>
            <span>{`name: ${sample.sampleTag}`}</span>
            {sample.bufferTag && <span>{`buffer: ${sample.bufferTag}`}</span>}
          </DialogDescription>
        </DialogHeader>
        <LoadSampleForm
          sample={sample}
          onSubmitCallback={handleSubmitSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

function CompleteAcquisitionMenuItem({
  sample,
  onSubmitCallback,
}: {
  sample: Sample;
  onSubmitCallback?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const handleOpen = (e: Event) => {
    e.preventDefault();
    setOpen(true);
  };
  const handleSubmitSuccess = () => {
    setOpen(false);
    onSubmitCallback?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={handleOpen}>
          <CameraIcon className="mr-2 h-4 w-4" />
          Complete Acquisition
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Acquisition</DialogTitle>
          <DialogDescription className="flex flex-col items-center">
            <span>{`position: ${sample.tray}-${sample.row}${sample.col}`}</span>
          </DialogDescription>
        </DialogHeader>
        <CompleteAcquisitionForm
          sampleParams={sample}
          onSubmitSuccess={handleSubmitSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

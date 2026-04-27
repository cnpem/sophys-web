import { useState } from "react";
import {
  CameraIcon,
  CircleArrowRightIcon,
  CircleDotIcon,
  EraserIcon,
  PencilIcon,
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
import type { Sample } from "./use-sample-store";
import { CompleteAcquisitionForm } from "../../plans/setup2-complete-acquisition-form";
import { MoveInsideSampleForm } from "../../plans/setup2-move-inside-sample-form";
import { MoveToSampleForm } from "../../plans/setup2-move-to-sample-form";
import { cardColumns, cardIndexOptions, cardRows } from "./constants";
import { DeleteSampleForm } from "./delete-sample-form";
// import { LoadSampleForm } from "./load-sample-form";
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
  const { cardIndex, row, column } = positionFromSampleId(sampleId);
  const { error } = useSampleStore();

  // check if tray, row and col are valid values, if not return null
  if (
    !cardIndexOptions.includes(
      cardIndex as (typeof cardIndexOptions)[number],
    ) ||
    !cardRows.includes(row as (typeof cardRows)[number]) ||
    !cardColumns.includes(column as (typeof cardColumns)[number])
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
            <span>{`position: ${cardIndex}-${row}${column}`}</span>
          </DialogDescription>
        </DialogHeader>
        <RegisterSampleForm
          cardIndex={cardIndex as (typeof cardIndexOptions)[number]}
          row={row as (typeof cardRows)[number]}
          column={column as (typeof cardColumns)[number]}
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
    <div className={cn("flex w-40 flex-col items-start gap-1", className)}>
      <p>
        <span className="font-bold">Index:</span>{" "}
        {`${sample.cardIndex}-${sample.row}${sample.column}`}
      </p>
      <p>
        <span className="font-bold">Name:</span> {sample.sampleTag}
      </p>
      <p>
        <span className="font-bold">Position:</span> ({sample.samplePositionX},{" "}
        {sample.samplePositionY})
      </p>
      {sample.meta && (
        <p className="overflow-wrap">
          <span className="font-bold">Meta:</span> {sample.meta}
        </p>
      )}
    </div>
  );
}

export const defaultSampleStyle =
  "border border-gray-300 bg-orange-300 text-gray-800 hover:bg-gray-100";

function SampleDropdownTrigger({ sample }: { sample: Sample }) {
  return (
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "cursor-context-menu rounded-full text-sm select-none hover:scale-105 hover:ring",
          defaultSampleStyle,
        )}
      >
        {`${sample.row}${sample.column}`}
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
        <CompleteAcquisitionMenuItem
          sample={sample}
          onSubmitCallback={() => setOpen(false)}
        />
        <MoveToSampleMenuItem
          sample={sample}
          onSubmitCallback={() => setOpen(false)}
        />
        <MoveInsideSampleMenuItem
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
          <DialogTitle>Register sample</DialogTitle>
          <DialogDescription className="flex flex-col items-start">
            <span>{`position: ${sample.cardIndex}-${sample.row}${sample.column}`}</span>
          </DialogDescription>
        </DialogHeader>
        <RegisterSampleForm
          cardIndex={sample.cardIndex}
          row={sample.row}
          column={sample.column}
          sampleTag={sample.sampleTag}
          samplePositionX={sample.samplePositionX}
          samplePositionY={sample.samplePositionY}
          meta={sample.meta}
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
            Complete acquisition for sample {sample.sampleTag} at position{" "}
            {`${sample.cardIndex}-${sample.row}${sample.column}`}
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

function MoveToSampleMenuItem({
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
          <CircleArrowRightIcon className="mr-2 size-4" />
          Move to Sample
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to Sample</DialogTitle>
          <DialogDescription className="flex flex-col items-center">
            Move to sample {sample.sampleTag} at position{" "}
            {`${sample.cardIndex}-${sample.row}${sample.column}`}
          </DialogDescription>
        </DialogHeader>
        <MoveToSampleForm
          row={sample.row}
          col={sample.column}
          onSubmitSuccess={handleSubmitSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

function MoveInsideSampleMenuItem({
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
          <CircleDotIcon className="mr-2 size-4" />
          Move Inside Sample
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Inside Sample</DialogTitle>
          <DialogDescription className="flex flex-col items-center">
            Move inside sample {sample.sampleTag} at position{" "}
            {`${sample.cardIndex}-${sample.row}${sample.column}`}
          </DialogDescription>
        </DialogHeader>
        <MoveInsideSampleForm
          x={sample.samplePositionX}
          y={sample.samplePositionY}
          onSubmitSuccess={handleSubmitSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

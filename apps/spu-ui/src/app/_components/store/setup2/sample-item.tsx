import { useState } from "react";
import { cva } from "class-variance-authority";
import {
  CameraIcon,
  CircleArrowRightIcon,
  CircleDotIcon,
  EraserIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-react";
import { cn } from "@sophys-web/ui";
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
import type { cardModes } from "./constants";
import type { Sample } from "./use-sample-store";
import { Setup2AquisitionForm } from "../../plans/setup2-acquisition";
import { CompleteAcquisitionForm } from "../../plans/setup2-complete-acquisition-form";
import { Setup2FindSampleHorizontalScanForm } from "../../plans/setup2-find-sample-horizontal-scan";
import { Setup2FindSampleVerticalScanForm } from "../../plans/setup2-find-sample-vertical-scan";
import { MoveInsideSampleForm } from "../../plans/setup2-move-inside-sample-form";
import { MoveToSampleForm } from "../../plans/setup2-move-to-sample-form";
import { DeleteSampleForm } from "./delete-sample-form";
// import { LoadSampleForm } from "./load-sample-form";
import { EditSampleForm, RegisterNewSampleForm } from "./register-sample-form";
import {
  // getSamplePositionFromId,
  // gridPositionToObject,
  sampleIdDecoder,
  useSampleStore,
} from "./use-sample-store";

const sampleTypeVariants = cva(
  "flex items-center justify-around border text-sm",
  {
    variants: {
      cardType: {
        standard: "size-10 rounded-full",
        capillary: "h-32 w-6 rounded-md",
      },
      registerState: {
        unregistered:
          "bg-muted cursor-cell text-gray-800 hover:bg-gray-100 hover:ring hover:ring-gray-400",

        registered:
          "hover:ring-primary/50 cursor-context-menu border-orange-800/10 bg-orange-300 text-gray-800 hover:bg-orange-300/90 hover:ring",
      },
    },
    defaultVariants: {
      cardType: "standard",
      registerState: "unregistered",
    },
  },
);

/**
 * Sample item component representing an empty slot or a registered sample.
 * @param sampleId - The unique identifier for the sample slot.
 *
 * @example
 * <SampleItem sampleId="Tray1-A1" />
 */
export function SampleItem({
  // sample,
  sampleId,
  cardType,
}: {
  // sample: Sample | undefined;
  sampleId: string;
  cardType: (typeof cardModes)[number];
}) {
  const { storeData } = useSampleStore();
  const sample = storeData?.[sampleId];
  // if sample is undefined, render empty slot
  if (!sample) {
    return <EmptySampleSlotDialog sampleId={sampleId} cardType={cardType} />;
  }

  // if sample is defined, render registered sample
  return <SampleDropdownMenu sample={sample} />;
}

function EmptySampleSlotDialog({
  sampleId,
  cardType,
}: {
  sampleId: string;
  cardType: (typeof cardModes)[number];
}) {
  const [open, setOpen] = useState(false);
  const { error } = useSampleStore();

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <button
          className={cn(
            sampleTypeVariants({
              cardType: cardType,
              registerState: "unregistered",
            }),
          )}
          disabled={!!error}
        >
          <PlusIcon className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="flex w-fit flex-col items-center">
        <DialogHeader>
          <DialogTitle>Register new sample</DialogTitle>
          <DialogDescription className="flex flex-col items-start">
            <span>{`position: ${sampleId}`}</span>
          </DialogDescription>
        </DialogHeader>
        <RegisterNewSampleForm
          sampleId={sampleId}
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
        <span className="font-bold">Index:</span>
        {sample.id}
      </p>
      <p>
        <span className="font-bold">Name:</span> {sample.sampleTag}
      </p>
      <p>
        <span className="font-bold">Position:</span> ({sample.position?.x},{" "}
        {sample.position?.y})
      </p>
      {sample.notes && (
        <p className="overflow-wrap">
          <span className="font-bold">Notes:</span> {sample.notes}
        </p>
      )}
    </div>
  );
}

export const defaultSampleStyle =
  "border border-gray-300 bg-orange-300 text-gray-800 hover:bg-gray-100";

function SampleDropdownTrigger({ sample }: { sample: Sample }) {
  const decoded = sampleIdDecoder.safeParse(sample.id);
  if (!decoded.success) {
    console.error("Failed to decode sample ID:", decoded.error);
    return <div className={cn("text-destructive")}>?</div>;
  }
  const { position, type } = decoded.data;
  return (
    <DropdownMenuTrigger asChild>
      <button
        className={cn(
          sampleTypeVariants({
            cardType: type,
            registerState: "registered",
          }),
        )}
      >
        {type === "capillary" && "s"}
        {type === "standard" && `${position.column}${position.row}`}
      </button>
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
        <MoveToSampleMenuItem
          sample={sample}
          onSubmitCallback={() => setOpen(false)}
        />
        <MoveInsideSampleMenuItem
          sample={sample}
          onSubmitCallback={() => setOpen(false)}
        />
        <FindSampleVerticalMenuItem
          sample={sample}
          onSubmitCallback={() => setOpen(false)}
        />
        <FindSampleHorizontalMenuItem
          sample={sample}
          onSubmitCallback={() => setOpen(false)}
        />
        <AcquisitionMenuItem
          sample={sample}
          onSubmitCallback={() => setOpen(false)}
        />
        <DropdownMenuSeparator />
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
          <DialogTitle>Register sample</DialogTitle>
          <DialogDescription className="flex flex-col items-start">
            <span>{`id: ${sample.id}`}</span>
          </DialogDescription>
        </DialogHeader>
        <EditSampleForm
          sample={sample}
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
          <DialogDescription className="flex flex-col items-start">
            {`id: ${sample.id}`}
          </DialogDescription>
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

  const decoded = sampleIdDecoder.safeParse(sample.id);
  if (!decoded.success) {
    console.error("Failed to decode sample ID:", decoded.error);
    return (
      <DropdownMenuItem disabled>
        <CameraIcon className="mr-2 h-4 w-4" />
        Complete Acquisition
      </DropdownMenuItem>
    );
  }
  const { card, position, type } = decoded.data;

  if (type === "capillary") {
    return (
      <DropdownMenuItem disabled>
        <CameraIcon className="mr-2 h-4 w-4" />
        Complete Acquisition
      </DropdownMenuItem>
    );
  }

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
            {`${position.column}${position.row}`} on card {card}.
          </DialogDescription>
        </DialogHeader>
        <CompleteAcquisitionForm
          sampleParams={sample}
          cardPosition={position}
          cardIndex={card}
          onSubmitSuccess={handleSubmitSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

function AcquisitionMenuItem({
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
          Acquisition
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Acquisition</DialogTitle>
          <DialogDescription className="flex flex-col items-center">
            Acquisition for sample {sample.sampleTag}.
          </DialogDescription>
        </DialogHeader>
        <Setup2AquisitionForm
          params={{
            sampleTag: sample.sampleTag,
          }}
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
  const decoded = sampleIdDecoder.safeParse(sample.id);

  if (!decoded.success || decoded.data.type === "capillary") {
    if (!decoded.success)
      console.error("Failed to decode sample ID:", decoded.error);
    return (
      <DropdownMenuItem disabled>
        <CircleArrowRightIcon className="mr-2 size-4" />
        Move to Sample
      </DropdownMenuItem>
    );
  }

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
            Move to sample {sample.sampleTag} at {sample.id}
          </DialogDescription>
        </DialogHeader>
        <MoveToSampleForm
          row={decoded.data.position.row}
          col={decoded.data.position.column}
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
            Move inside sample
          </DialogDescription>
        </DialogHeader>
        <MoveInsideSampleForm
          x={sample.position?.x}
          y={sample.position?.y}
          onSubmitSuccess={handleSubmitSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

function FindSampleVerticalMenuItem({
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
          Find Sample (Vertical Scan)
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="w-fit">
        <DialogHeader>
          <DialogTitle>Setup 2 Find Sample (Vertical Scan)</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            This plan runs a vertical scan inside the card hole in order to find
            the sample.
          </DialogDescription>
        </DialogHeader>
        <Setup2FindSampleVerticalScanForm
          onSubmitSuccess={handleSubmitSuccess}
          params={{
            sampleTag: sample.sampleTag,
            posX: sample.position?.x,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function FindSampleHorizontalMenuItem({
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
          Find Sample (Horizontal Scan)
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="w-fit">
        <DialogHeader>
          <DialogTitle>Setup 2 Find Sample (Horizontal Scan)</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            This plan runs a horizontal scan inside the card hole in order to
            find the sample.
          </DialogDescription>
        </DialogHeader>
        <Setup2FindSampleHorizontalScanForm
          onSubmitSuccess={handleSubmitSuccess}
          params={{
            sampleTag: sample.sampleTag,
            posY: sample.position?.y,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
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
import type {
  sampleTypeOptions,
  trayColumns,
  trayOptions,
  trayRows,
} from "~/lib/constants";
import { CompleteAcquisitionForm } from "./complete-aquisition-form";
import { DeleteSampleForm } from "./delete-sample-form";
import { LoadSampleForm } from "./load-sample-form";
import { RegisterSampleForm } from "./register-sample-form";

export interface Sample {
  id: string | number;
  relativePosition: string;
  sampleTag: string | undefined;
  bufferTag: string | undefined;
  sampleType: (typeof sampleTypeOptions)[number] | undefined;
  row: (typeof trayRows)[number];
  col: (typeof trayColumns)[number];
  tray: (typeof trayOptions)[number];
}

export function SampleItemMenu({ sample }: { sample: Sample }) {
  const isRegistered = sample.sampleType !== undefined;
  const [openMenu, setOpenMenu] = useState(false);
  console.log("Rendering SampleItemMenu for sample", sample);

  if (!isRegistered) {
    return <RegisterSampleDialog sample={sample} />;
  }

  return (
    <DropdownMenu modal={false} open={openMenu} onOpenChange={setOpenMenu}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "cursor-context-menu rounded-full text-sm select-none hover:scale-105 hover:ring",
            sample.sampleType === "sample" &&
              "border-cyan-400 bg-cyan-300 text-cyan-800 hover:bg-cyan-300",
            sample.sampleType === "buffer" &&
              "border-cyan-300 bg-cyan-300/10 text-cyan-600 hover:bg-cyan-300/20",
          )}
        >
          {sample.sampleType?.charAt(0) ?? "-"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem disabled className="flex flex-col items-start gap-1">
          <p>{`${sample.tray}-${sample.row}${sample.col}`}</p>
          <p>{`type: ${sample.sampleType}`}</p>
          <p>{`name: ${sample.sampleTag}`}</p>
          {sample.bufferTag && <p>{`buffer: ${sample.bufferTag}`}</p>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <CompleteAcquisitionMenuItem
          sample={sample}
          onSubmitCallback={() => setOpenMenu(false)}
        />
        <LoadSampleMenuItem
          sample={sample}
          onSubmitCallback={() => setOpenMenu(false)}
        />
        <EditSampleMenuItem
          sample={sample}
          onSubmitCallback={() => setOpenMenu(false)}
        />
        <DeleteSampleMenuItem
          sample={sample}
          onSubmitCallback={() => setOpenMenu(false)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RegisterSampleDialog({ sample }: { sample: Sample }) {
  const [open, setOpen] = useState(false);
  const handleSubmitSuccess = () => {
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="cursor-cell rounded-full bg-zinc-100 text-sm opacity-50 select-none hover:scale-105 hover:ring hover:ring-slate-400"
          onClick={() => setOpen(true)}
        >
          <PlusIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex w-fit flex-col items-center">
        <DialogHeader>
          <DialogTitle>Register sample</DialogTitle>
          <DialogDescription className="flex flex-col items-start">
            <span>{`position: ${sample.tray}-${sample.row}${sample.col}`}</span>
          </DialogDescription>
        </DialogHeader>
        <RegisterSampleForm
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
          <DialogTitle>Delete sample</DialogTitle>
          <DialogDescription className="flex flex-col items-start">
            <span>{`position: ${sample.tray}-${sample.row}${sample.col}`}</span>
          </DialogDescription>
        </DialogHeader>
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

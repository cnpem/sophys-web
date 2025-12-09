import { useState } from "react";
import { EraserIcon, PencilIcon, PipetteIcon, PlusIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { DeleteSampleForm } from "./delete-sample-form";
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
  const [openLoadSampleDialog, setOpenLoadSampleDialog] = useState(false);
  const [openRegisterSampleDialog, setOpenRegisterSampleDialog] =
    useState(false);
  const [openDeleteSampleDialog, setOpenDeleteSampleDialog] = useState(false);

  const isRegistered = sample.type !== undefined;

  return (
    <>
      {!isRegistered && (
        <Button
          variant="outline"
          size="icon"
          className="bg-muted cursor-cell rounded-full text-sm opacity-50 select-none hover:scale-105 hover:ring hover:ring-slate-400"
          onClick={() => setOpenRegisterSampleDialog(true)}
        >
          <PlusIcon className="size-4" />
        </Button>
      )}
      {isRegistered && (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              data-sample-type={sample.type}
              variant="outline"
              size="icon"
              className="cursor-context-menu rounded-full text-sm select-none hover:scale-105 hover:ring data-[sample-type=buffer]:border-emerald-400 data-[sample-type=buffer]:bg-emerald-200 data-[sample-type=buffer]:text-emerald-800 data-[sample-type=buffer]:hover:bg-emerald-300 data-[sample-type=sample]:border-sky-400 data-[sample-type=sample]:bg-sky-200 data-[sample-type=sample]:text-sky-800 data-[sample-type=sample]:hover:bg-sky-300"
            >
              {sample.type?.charAt(0) ?? "-"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              disabled
              className="flex flex-col items-start gap-1"
            >
              <p>{`${sample.tray}-${sample.row}${sample.col}`}</p>
              <p>{`type: ${sample.type}`}</p>
              <p>{`name: ${sample.sampleTag}`}</p>
              {sample.bufferTag && <p>{`buffer: ${sample.bufferTag}`}</p>}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setOpenLoadSampleDialog(true)}>
              <PipetteIcon className="mr-2 size-4" />
              Load
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpenRegisterSampleDialog(true)}>
              <PencilIcon className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpenDeleteSampleDialog(true)}>
              <EraserIcon className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <Dialog
        open={openLoadSampleDialog}
        onOpenChange={setOpenLoadSampleDialog}
      >
        <DialogContent className="flex w-fit flex-col items-center">
          <DialogHeader>
            <DialogTitle>Load sample</DialogTitle>
            <DialogDescription className="flex flex-col items-start">
              <span>{`position: ${sample.tray}-${sample.row}${sample.col}`}</span>
              <span>{`type: ${sample.type}`}</span>
              <span>{`name: ${sample.sampleTag}`}</span>
              {sample.bufferTag && <span>{`buffer: ${sample.bufferTag}`}</span>}
            </DialogDescription>
          </DialogHeader>
          <LoadSampleForm
            sample={sample}
            onSubmitCallback={() => setOpenLoadSampleDialog(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={openRegisterSampleDialog}
        onOpenChange={setOpenRegisterSampleDialog}
      >
        <DialogContent className="flex w-fit flex-col items-center">
          <DialogHeader>
            <DialogTitle>Register sample</DialogTitle>
            <DialogDescription className="flex flex-col items-start">
              <span>{`position: ${sample.tray}-${sample.row}${sample.col}`}</span>
            </DialogDescription>
          </DialogHeader>
          <RegisterSampleForm
            sample={sample}
            onSubmitCallback={() => setOpenRegisterSampleDialog(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={openDeleteSampleDialog}
        onOpenChange={setOpenDeleteSampleDialog}
      >
        <DialogContent className="flex w-fit flex-col items-center">
          <DialogHeader>
            <DialogTitle>Delete sample</DialogTitle>
            <DialogDescription className="flex flex-col items-start">
              <span>{`position: ${sample.tray}-${sample.row}${sample.col}`}</span>
            </DialogDescription>
          </DialogHeader>
          <DeleteSampleForm
            sample={sample}
            onSubmitCallback={() => setOpenDeleteSampleDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

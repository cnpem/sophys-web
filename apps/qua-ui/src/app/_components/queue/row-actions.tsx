"use client";

import type { z } from "zod";
import { useCallback, useMemo, useState } from "react";
import { MoreHorizontalIcon } from "lucide-react";
import { toast } from "sonner";
import type { AnySchema } from "@sophys-web/widgets/lib/create-schema";
import { useQueue } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
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
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import { AnyForm } from "@sophys-web/widgets/form";
import { createSchema } from "@sophys-web/widgets/lib/create-schema";
import type { QueueItemProps } from "~/lib/types";
import {
  EditRegionEnergyScanForm,
  PLAN_NAME,
} from "../plans/region-energy-scan";
import {
  EditTimedRegionEnergyScanForm,
  PLAN_NAME_TIMED,
} from "../plans/time-region-energy-scan";

// ========================================================================
// Edit Item from logic
// ========================================================================

/**
 * A function to check which plan the user wants to edit, uses early return
 * logic to return the correct edit form. New forms should be handled inside
 * this function.
 */

function EditItemForm({
  proposal,
  item,
  onSubmitSuccess,
}: {
  proposal: string | undefined;
  item: QueueItemProps;
  onSubmitSuccess: () => void;
}) {
  if (item.name === PLAN_NAME_TIMED)
    return (
      <EditTimedRegionEnergyScanForm
        itemUid={item.itemUid}
        kwargs={item.kwargs}
        proposal={proposal}
        onSubmitSuccess={onSubmitSuccess}
        className="w-2xl"
      />
    );
  if (item.name === PLAN_NAME)
    return (
      <EditRegionEnergyScanForm
        itemUid={item.itemUid}
        kwargs={item.kwargs}
        proposal={proposal}
        onSubmitSuccess={onSubmitSuccess}
        className="w-2xl"
      />
    );
  // default
  return (
    <EditGenericPlanForm
      itemUid={item.itemUid}
      name={item.name}
      kwargs={item.kwargs}
      proposal={proposal}
      onSubmitSuccess={onSubmitSuccess}
    />
  );
}

export function RowActions({ item }: { item: QueueItemProps }) {
  const { data: userData } = api.auth.getUser.useQuery();
  const { move, remove } = useQueue();
  const [open, setOpen] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const handleMove = () => {
    toast.info("Moving item to front...");
    move.mutate(
      { uid: item.itemUid, posDest: "front" },
      {
        onSuccess: () => {
          toast.success("Item moved to front");
        },
        onError: () => {
          toast.error("Failed to move item");
        },
        onSettled: () => {
          setOpen(false);
        },
      },
    );
  };

  const handleRemove = () => {
    toast.info("Removing item...");
    remove.mutate(
      { uid: item.itemUid },
      {
        onSuccess: () => {
          toast.success("Item removed");
        },
        onError: () => {
          toast.error("Failed to remove item");
        },
        onSettled: () => {
          setOpen(false);
        },
      },
    );
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex flex-col" align="end">
          <DropdownMenuItem asChild>
            <Button
              className="justify-start font-normal"
              size="sm"
              variant="ghost"
              onClick={() => setOpenEditDialog(true)}
            >
              Edit Item
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Button
              className="justify-start font-normal"
              size="sm"
              variant="ghost"
              disabled={move.isPending}
              onClick={handleMove}
            >
              Move to Front
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Button
              className="justify-start font-normal"
              size="sm"
              variant="ghost"
              disabled={remove.isPending}
              onClick={handleRemove}
            >
              Remove Item
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="w-fit max-w-full flex-col">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Edit the details of the item in the queue.
            </DialogDescription>
          </DialogHeader>

          <EditItemForm
            item={item}
            proposal={userData?.proposal ?? undefined}
            onSubmitSuccess={() => {
              setOpenEditDialog(false);
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

interface EditGenericPlanFormProps
  extends Pick<QueueItemProps, "name" | "itemUid" | "kwargs"> {
  proposal?: string;
  onSubmitSuccess?: () => void;
}

function EditGenericPlanForm({
  name,
  itemUid,
  proposal,
  kwargs,
  onSubmitSuccess,
}: EditGenericPlanFormProps) {
  const { data: plans } = api.plans.allowed.useQuery(undefined);
  const { data: devices } = api.devices.allowedNames.useQuery(undefined);
  const { update } = useQueue();
  const planDetails = useMemo(() => {
    if (plans) {
      return Object.values(plans.plansAllowed).find(
        (plan) => plan.name === name,
      );
    }
    return undefined;
  }, [plans, name]);

  const planData = useMemo(() => {
    if (planDetails) {
      return {
        name: planDetails.name,
        description: planDetails.description,
        parameters: planDetails.parameters,
      };
    }
    return undefined;
  }, [planDetails]);

  const onSubmit = useCallback(
    async (data: z.infer<AnySchema>) => {
      const kwargs = data;
      await update.mutateAsync(
        {
          item: {
            itemUid: itemUid,
            itemType: "plan",
            name: name,
            kwargs,
            args: [],
          },
        },
        {
          onSuccess: () => {
            if (onSubmitSuccess) onSubmitSuccess();
          },
          onError: (error) => {
            const message = error.message.replace("\n", " ");
            toast.error(`Failed to add plan ${name} to the queue: ${message}`);
          },
        },
      );
    },
    [update, itemUid, name, onSubmitSuccess],
  );

  const initialValues = {
    ...kwargs,
    proposal: proposal ?? undefined,
  };

  if (!planDetails || !planData || !devices) {
    return <div>Loading beamline parameters...</div>;
  }

  return (
    <AnyForm
      devices={devices}
      planData={planData}
      onSubmit={onSubmit}
      schema={createSchema(planDetails.parameters)}
      initialValues={initialValues}
    />
  );
}

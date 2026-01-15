"use client";

import type { z } from "zod";
import { useCallback, useMemo, useState } from "react";
import { EditIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueue } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { Button } from "@sophys-web/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sophys-web/ui/dialog";
import type { AnySchema } from "../lib/create-schema";
import type { QueueItemProps } from "./types";
import { AnyForm } from "../form";
import { createSchema } from "../lib/create-schema";

export function EditItemDialog({ item }: { item: QueueItemProps }) {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  return (
    <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setOpenEditDialog(true)}
        >
          <EditIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-fit max-w-full flex-col">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Edit the details of the item in the queue.
          </DialogDescription>
        </DialogHeader>
        <EditGenericPlanForm
          name={item.name}
          itemUid={item.itemUid}
          kwargs={item.kwargs}
          proposal={undefined}
          onSubmitSuccess={() => {
            setOpenEditDialog(false);
          }}
        />
      </DialogContent>
    </Dialog>
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

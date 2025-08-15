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
  DialogTrigger,
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
import { PlanForm, planName, planSchema } from "../plans/exafs-scan-regions";

export function RowActions({ item }: { item: QueueItemProps }) {
  const [open, setOpen] = useState(false);
  const { itemUid: uid } = item;
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="group/actions flex flex-col" align="end">
        <DropdownMenuItem asChild>
          <EditItem {...item} />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <MoveToFront uid={uid} onOpenChange={setOpen} />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <RemoveItem uid={uid} onOpenChange={setOpen} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MoveToFront({
  uid,
  onOpenChange,
}: {
  uid: string;
  onOpenChange?: (open: boolean) => void;
}) {
  const { move } = useQueue();
  const handleMove = () => {
    toast.info("Moving item to front...");
    move.mutate(
      { uid, posDest: "front" },
      {
        onSuccess: () => {
          toast.success("Item moved to front");
        },
        onError: () => {
          toast.error("Failed to move item");
        },
        onSettled: () => {
          if (onOpenChange) {
            onOpenChange(false);
          }
        },
      },
    );
  };

  return (
    <Button
      className="justify-start font-normal group-has-data-[mutating=true]/actions:pointer-events-none group-has-data-[mutating=true]/actions:opacity-50"
      size="sm"
      variant="ghost"
      data-mutating={move.isPending}
      disabled={move.isPending}
      onClick={handleMove}
    >
      Move to Front
    </Button>
  );
}

function RemoveItem({
  uid,
  onOpenChange,
}: {
  uid: string;
  onOpenChange?: (open: boolean) => void;
}) {
  const { remove } = useQueue();
  const handleRemove = () => {
    toast.info("Removing item...");
    remove.mutate(
      { uid },
      {
        onSuccess: () => {
          toast.success("Item removed");
        },
        onError: () => {
          toast.error("Failed to remove item");
        },
        onSettled: () => {
          if (onOpenChange) {
            onOpenChange(false);
          }
        },
      },
    );
  };
  return (
    <Button
      className="justify-start font-normal group-has-data-[mutating=true]/actions:pointer-events-none group-has-data-[mutating=true]/actions:opacity-50"
      size="sm"
      variant="ghost"
      data-mutating={remove.isPending}
      disabled={remove.isPending}
      onClick={handleRemove}
    >
      Remove Item
    </Button>
  );
}

function EditItem(props: QueueItemProps) {
  const { name, itemUid } = props;
  const { data: plans } = api.plans.allowed.useQuery(undefined);
  const { data: devices } = api.devices.allowedNames.useQuery(undefined);
  const { update } = useQueue();
  const [open, setOpen] = useState(false);

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
            itemUid,
            itemType: "plan",
            name,
            kwargs,
            args: [],
          },
        },
        {
          onSuccess: () => {
            toast.success(`Plan ${name} added to the queue`);
            setOpen(false);
          },
          onError: (error) => {
            const message = error.message.replace("\n", " ");
            toast.error(`Failed to add plan ${name} to the queue: ${message}`);
          },
        },
      );
    },
    [update, itemUid, name],
  );

  function RenderForm() {
    if (!planDetails || !planData || !devices) {
      return <div>Loading...</div>;
    }

    if (planDetails.name === planName) {
      // Special case for EXAFS scan regions plan
      // convert regions from a list of tuples into the expected format
      const regions = (props.kwargs as z.infer<typeof planSchema>).regions.map(
        (region) => {
          if (Array.isArray(region)) {
            return {
              space: region[0],
              initial: region[1],
              final: region[2],
              step: region[3],
            };
          }
          return region;
        },
      );
      const kwargs = {
        ...props.kwargs,
        regions: regions,
      };
      const parsed = planSchema.safeParse(kwargs);
      if (!parsed.success) {
        console.error(
          "Failed to parse kwargs for EXAFS scan regions plan",
          parsed.error,
        );
        return <div>Error parsing plan data</div>;
      }
      return <PlanForm defaultValues={parsed.data} onSubmit={onSubmit} />;
    }

    return (
      <AnyForm
        devices={devices}
        planData={planData}
        onSubmit={onSubmit}
        schema={createSchema(planDetails.parameters)}
        initialValues={props.kwargs as z.infer<AnySchema>}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={!planDetails || !devices}
          size="sm"
          variant="ghost"
          className="justify-start font-normal group-has-data-[mutating=true]/actions:pointer-events-none group-has-data-[mutating=true]/actions:opacity-50"
        >
          Edit Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Edit the details of the item in the queue.
          </DialogDescription>
        </DialogHeader>
        <RenderForm />
      </DialogContent>
    </Dialog>
  );
}

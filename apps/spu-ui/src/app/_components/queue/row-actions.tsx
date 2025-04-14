import type { z } from "zod";
import { useCallback, useState } from "react";
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
      className="group-has-data-[mutating=true]/actions:pointer-events-none group-has-data-[mutating=true]/actions:opacity-50 justify-start font-normal"
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
      className="group-has-data-[mutating=true]/actions:pointer-events-none group-has-data-[mutating=true]/actions:opacity-50 justify-start font-normal"
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
  const { data: plans } = api.plans.allowed.useQuery(undefined);
  const { data: devices } = api.devices.allowedNames.useQuery(undefined);
  const { update } = useQueue();
  const [open, setOpen] = useState(false);

  const planDetails = (() => {
    if (plans) {
      return Object.values(plans.plansAllowed).find(
        (plan) => plan.name === props.name,
      );
    }
    return undefined;
  })();

  const onSubmit = useCallback(
    async (data: z.infer<AnySchema>) => {
      const kwargs = data;
      await update.mutateAsync(
        {
          item: {
            itemUid: props.itemUid,
            itemType: "plan",
            name: props.name,
            kwargs,
            args: [],
          },
        },
        {
          onSuccess: () => {
            toast.success(`Plan ${props.name} added to the queue`);
            setOpen(false);
          },
          onError: (error) => {
            const message = error.message.replace("\n", " ");
            toast.error(
              `Failed to add plan ${props.name} to the queue: ${message}`,
            );
          },
        },
      );
    },
    [update, props.itemUid, props.name],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={!planDetails || !devices}
          size="sm"
          variant="ghost"
          className="group-has-data-[mutating=true]/actions:pointer-events-none group-has-data-[mutating=true]/actions:opacity-50 justify-start font-normal"
        >
          Edit Item
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Edit the details of the item in the queue.
          </DialogDescription>
        </DialogHeader>
        {planDetails && devices && (
          <AnyForm
            devices={devices}
            planData={{
              name: props.name,
              description: planDetails.description,
              parameters: planDetails.parameters,
            }}
            onSubmit={onSubmit}
            schema={createSchema(planDetails.parameters)}
            initialValues={props.kwargs as z.infer<AnySchema>}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

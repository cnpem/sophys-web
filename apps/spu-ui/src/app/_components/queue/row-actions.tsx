import { useState } from "react";
import { MoreHorizontalIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueue } from "@sophys-web/api-client/hooks";
import { Button } from "@sophys-web/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@sophys-web/ui/sheet";
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
          <EditItem />
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

function EditItem() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="justify-start font-normal" size="sm" variant="ghost">
          Edit Item
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Item</SheetTitle>
          <SheetDescription>
            Edit the details of the item in the queue.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

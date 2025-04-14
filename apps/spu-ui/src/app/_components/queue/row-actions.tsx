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
  const { itemUid: uid } = item;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex flex-col" align="end">
        <DropdownMenuItem asChild>
          <MoveToFront uid={uid} />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <EditItem />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <RemoveItem uid={uid} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MoveToFront({ uid }: { uid: string }) {
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
      },
    );
  };

  return (
    <Button
      className="justify-start font-normal"
      size="sm"
      variant="ghost"
      onClick={handleMove}
    >
      Move to Front
    </Button>
  );
}

function RemoveItem({ uid }: { uid: string }) {
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
      },
    );
  };
  return (
    <Button
      className="justify-start font-normal"
      size="sm"
      variant="ghost"
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

import { useState } from "react";
import { EditIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sophys-web/ui/dialog";
import { EditGenericPlanForm } from "@sophys-web/widgets/queue-table/edit-item";
import type { QueueItemProps } from "~/lib/types";
import { EditFlyScanForm, PLAN_NAME_FLY } from "../plans/fly-scan";
import { EditHeatForm, PLAN_NAME_HEAT } from "../plans/heat-sample";
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
  item,
  onSubmitSuccess,
}: {
  item: QueueItemProps;
  onSubmitSuccess: () => void;
}) {
  if (item.name === PLAN_NAME_FLY)
    return (
      <EditFlyScanForm
        itemUid={item.itemUid}
        kwargs={item.kwargs}
        onSubmitSuccess={onSubmitSuccess}
        className="w-2xl"
      />
    );
  if (item.name === PLAN_NAME_TIMED)
    return (
      <EditTimedRegionEnergyScanForm
        itemUid={item.itemUid}
        kwargs={item.kwargs}
        onSubmitSuccess={onSubmitSuccess}
        className="w-2xl"
      />
    );
  if (item.name === PLAN_NAME)
    return (
      <EditRegionEnergyScanForm
        itemUid={item.itemUid}
        kwargs={item.kwargs}
        onSubmitSuccess={onSubmitSuccess}
        className="w-2xl"
      />
    );
  if (item.name === PLAN_NAME_HEAT) {
    return (
      <EditHeatForm
        itemUid={item.itemUid}
        kwargs={item.kwargs}
        onSubmitSuccess={onSubmitSuccess}
        className="w-2xl"
      />
    );
  }
  // default
  return (
    <EditGenericPlanForm
      itemUid={item.itemUid}
      name={item.name}
      kwargs={item.kwargs}
      onSubmitSuccess={onSubmitSuccess}
    />
  );
}

export function CustomEditItemDialog({ item }: { item: QueueItemProps }) {
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
        <EditItemForm
          item={item}
          onSubmitSuccess={() => {
            setOpenEditDialog(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

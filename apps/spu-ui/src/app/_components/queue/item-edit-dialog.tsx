import type { z } from "zod";
import { useCallback } from "react";
import { PencilIcon } from "lucide-react";
import type { AnySchema } from "@sophys-web/widgets/lib/create-schema";
import { useQueue } from "@sophys-web/api-client/hooks/use-queue";
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
import { toast } from "@sophys-web/ui/sonner";
import { AnyForm } from "@sophys-web/widgets/form";
import { createSchema } from "@sophys-web/widgets/lib/create-schema";
import type { QueueItemProps } from "~/lib/types";

export function ItemEditDialog(props: QueueItemProps) {
  const { data: plans } = api.plans.allowed.useQuery(undefined);
  const { data: devices } = api.devices.allowedNames.useQuery(undefined);
  const { update } = useQueue();

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
    <Dialog>
      <DialogTrigger>
        <Button disabled={!planDetails || !devices} variant="outline">
          <PencilIcon className="mr-2 h-4 w-4" />
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

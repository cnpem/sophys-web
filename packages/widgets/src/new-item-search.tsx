"use client";

import type { z } from "zod";
import { useCallback, useMemo, useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import type { AnySchema } from "@sophys-web/widgets/lib/create-schema";
import { useQueue } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { Button } from "@sophys-web/ui/button";
import { Input } from "@sophys-web/ui/input";
import { AnyForm } from "@sophys-web/widgets/form";
import { createSchema } from "@sophys-web/widgets/lib/create-schema";

interface EditItemProps {
  onSuccessCallback?: () => void;
  onErrorCallback?: (error: string) => void;
}

export function NewItemSearch(props: EditItemProps) {
  const { data: plans, isLoading: isLoadingPlans } =
    api.plans.allowed.useQuery(undefined);
  const { data: devices } = api.devices.allowedNames.useQuery(undefined);
  const { add } = useQueue();
  const [search, setSearch] = useState<string>("");

  const filteredPlans = useMemo(() => {
    if (!plans) return [];
    if (!search) return Object.values(plans.plansAllowed);
    return Object.values(plans.plansAllowed).filter((plan) =>
      plan.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [plans, search]);

  const planDetails = useMemo(() => {
    if (!plans) return undefined;
    return Object.values(plans.plansAllowed).find(
      (plan) => plan.name === search,
    );
  }, [plans, search]);

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
      await add.mutateAsync(
        {
          item: {
            itemType: "plan",
            name: search,
            kwargs,
            args: [],
          },
        },
        {
          onSuccess: () => {
            props.onSuccessCallback?.();
          },
          onError: (error) => {
            const message = error.message.replace("\n", " ");
            props.onErrorCallback?.(message);
          },
        },
      );
    },
    [add, search, props],
  );

  return (
    <>
      {isLoadingPlans && (
        <div className="flex items-center justify-center">
          <span>Loading plans...</span>
        </div>
      )}

      {!isLoadingPlans && plans && (
        <Input
          placeholder="Search a plan name"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
      )}
      <div className="bg-background max-h-48 overflow-y-auto" role="listbox">
        {filteredPlans.length === 0 && (
          <div className="text-muted-foreground p-2 text-sm">
            No plans found.
          </div>
        )}
        {!planDetails &&
          filteredPlans.map((plan) => (
            <Button
              role="option"
              key={plan.name}
              variant={"ghost"}
              className="w-full justify-start px-3 py-2"
              onClick={() => {
                setSearch(plan.name);
              }}
            >
              <ArrowRightIcon className="mr-2 h-4 w-4" />
              {plan.name}
            </Button>
          ))}
      </div>

      {planDetails && planData && devices && (
        <AnyForm
          devices={devices}
          planData={planData}
          onSubmit={onSubmit}
          schema={createSchema(planDetails.parameters)}
        />
      )}
    </>
  );
}

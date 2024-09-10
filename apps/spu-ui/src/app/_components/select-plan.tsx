"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import { useState } from "react";
import { api } from "../../trpc/react";

export function SelectPlan() {
  const { data } = api.plans.allowed.useQuery(undefined);
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>(
    undefined
  );

  const names = (() => {
    if (data) {
      return Object.keys(data);
    }
    return [];
  })();

  const planDetails = (() => {
    if (data && selectedPlan) {
      return data[selectedPlan];
    }
    return undefined;
  })();

  return (
    <div className="flex flex-col items-center my-auto gap-2">
      <Select
        onValueChange={(value) => {
          setSelectedPlan(value);
        }}
        value={selectedPlan}
      >
        <SelectTrigger disabled={!data}>
          <SelectValue placeholder="Select a plan" />
        </SelectTrigger>
        <SelectContent>
          {names.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!planDetails ? (
        <p>Select a plan to view details</p>
      ) : (
        <Details
          description={planDetails.description}
          name={planDetails.name}
          parameters={JSON.stringify(planDetails.parameters)}
        />
      )}
    </div>
  );
}

function Details({
  name,
  description,
  parameters,
}: {
  name: string;
  description: string;
  parameters: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-col items-center gap-2">
        <p>Name: {name}</p>
        <p>Parameters: {parameters}</p>
      </div>
      <p>{description}</p>
    </div>
  );
}

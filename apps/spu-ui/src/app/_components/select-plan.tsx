"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import { api } from "../../trpc/react";

export function SelectPlan() {
  const { data } = api.plans.allowed.useQuery(undefined);
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>(
    undefined,
  );

  const names = (() => {
    if (data) {
      return Object.keys(data).sort();
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
    <div className="my-auto flex flex-col items-center gap-2">
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
  const parObj = JSON.parse(parameters) as Record<
    string,
    Record<string, unknown>
  >;
  const parNames = Object.entries(parObj).map(([_, par]) => {
    if ("name" in par) {
      return par.name;
    }
    return null;
  });
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-col items-center gap-2">
        <p>Name: {name}</p>
        <p>Parameters List:</p>
        <p>{parNames.join(", ")}</p>
        <p>Parameters details:</p>
        <pre className="text-wrap text-left text-sm text-muted-foreground">
          {JSON.stringify(parObj, null, 2)}
        </pre>
      </div>
      <p>{description}</p>
    </div>
  );
}

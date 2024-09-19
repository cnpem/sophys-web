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
import PlanForm from "./form/plan-form";

export function SelectPlan() {
  const { data: plans } = api.plans.allowed.useQuery(undefined);
  const { data: namedDevices } = api.devices.allowedNamed.useQuery(undefined);

  const [selectedPlan, setSelectedPlan] = useState<string | undefined>(
    undefined
  );

  const names = (() => {
    if (plans) {
      return Object.keys(plans);
    }
    return [];
  })();

  const planDetails = (() => {
    if (plans && selectedPlan) {
      return plans[selectedPlan];
    }
    return undefined;
  })();

  const planParams = (() => {
    if (planDetails) {
      return planDetails.parameters;
    }
    return undefined;
  })();

  if (!plans) {
    return <p>Loading plans...</p>;
  }

  if (!namedDevices) {
    return <p>Loading devices...</p>;
  }

  return (
    <div className="flex flex-col items-center my-auto gap-2">
      <Select
        onValueChange={(value) => {
          setSelectedPlan(value);
        }}
        value={selectedPlan}
      >
        <SelectTrigger disabled={!plans}>
          <SelectValue placeholder="Select a plan" />
        </SelectTrigger>
        <SelectContent>
          {names.sort().map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!planDetails ? (
        <div className="flex flex-col gap-2">
          <p>Select a plan to view details</p>
          <PlansStatistics />
        </div>
      ) : (
        <PlanForm
          devices={namedDevices}
          planData={{
            name: planDetails.name,
            description: planDetails.description,
            parameters: planParams || [],
          }}
        />
      )}
    </div>
  );
}


function PlansStatistics() {
  const { data } = api.plans.allowed.useQuery(undefined);

  if (!data) {
    return <p>Loading...</p>;
  }

  // list unique plan annotation.type, kind.name,
  const uniqueAnnotations = new Set<string>();
  const uniqueKinds = new Set<string>();
  Object.values(data).forEach((plan) => {
    plan.parameters.forEach((param) => {
      if (param.annotation?.type) {
        uniqueAnnotations.add(param.annotation.type);
      }
      uniqueKinds.add(param.kind.name);
    });
  });

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-semibold text-lg">Stats</h2>
      <p>Number of plans: {Object.keys(data).length}</p>
      <p>Unique annotation types:</p>
      <ul className="flex flex-col gap-1 pl-4 text-sm">
        {Array.from(uniqueAnnotations).map((annotation) => (
          <li key={annotation}>{annotation}</li>
        ))}
      </ul>
      <p>Unique kind names:</p>
      <ul className="flex flex-col gap-1 pl-4 text-sm">
        {Array.from(uniqueKinds).map((kind) => (
          <li key={kind}>{kind}</li>
        ))}
      </ul>
    </div>
  );
}

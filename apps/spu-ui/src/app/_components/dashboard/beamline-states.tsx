"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sophys-web/ui/card";
import { ItemGroup } from "@sophys-web/ui/item";
import { CapillaryStateMonitor } from "./capillary-state-monitor";
import { SampleTemperatureMonitor } from "./sample-temperature";

export function BeamlineStates() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Variables</CardTitle>
        <CardDescription>Current environmental conditions</CardDescription>
      </CardHeader>
      <CardContent>
        <ItemGroup className="grid grid-cols-2 gap-2">
          <SampleTemperatureMonitor />
          <CapillaryStateMonitor />
        </ItemGroup>
      </CardContent>
    </Card>
  );
}

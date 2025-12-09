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
    <Card className="gap-2 pb-2">
      <CardHeader>
        <CardTitle>Beamline Variables</CardTitle>
        <CardDescription>Current environmental conditions</CardDescription>
      </CardHeader>
      <CardContent>
        <ItemGroup>
          <SampleTemperatureMonitor />
          <CapillaryStateMonitor />
        </ItemGroup>
      </CardContent>
    </Card>
  );
}

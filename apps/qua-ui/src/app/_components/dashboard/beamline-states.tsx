"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sophys-web/ui/card";
import { ItemGroup } from "@sophys-web/ui/item";
import { MachineInfo } from "./machine";
import { MonochromatorEnergy, MonochromatorMode } from "./monochromator";
import { SampleInfo } from "./sample";

export function BeamlineStates() {
  return (
    <Card className="gap-2 pb-2">
      <CardHeader>
        <CardTitle>Beamline Variables</CardTitle>
        <CardDescription>Current environmental conditions</CardDescription>
      </CardHeader>
      <CardContent>
        <ItemGroup className="grid grid-cols-2 items-center">
          <MonochromatorEnergy />
          <MachineInfo />
          <SampleInfo />
          <MonochromatorMode />
        </ItemGroup>
      </CardContent>
    </Card>
  );
}

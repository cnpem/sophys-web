import { PlusIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@sophys-web/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import { CapillaryStateBadge } from "~/app/_components/capillary-state-badge";
import { useCapillaryState } from "~/app/_hooks/use-capillary-state";
import { CleaningDialog } from "./cleaning";
import { QueueStop } from "./queue-stop";
import { SingleAcquisition } from "./single-acquisition";

export function OnDemandQueueItems() {
  const { loadedSample } = useCapillaryState();

  return (
    <Card className="flex space-y-4 rounded-md pt-0 shadow-none">
      <CardHeader className="flex items-center justify-center border-b border-slate-300 bg-slate-100 p-2">
        <CardTitle className="flex items-center justify-center text-base font-semibold text-slate-700">
          On Demand Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CapillaryStateBadge className="mb-2 text-sm font-semibold" />
        {loadedSample && (
          <p className="space-x-2 text-sm text-muted-foreground">
            <span>Loaded Sample:</span>
            <span className="font-semibold">{`${loadedSample.tray}, ${loadedSample.row}-${loadedSample.col},`}</span>
            <span>{`type: ${loadedSample.sampleType},`}</span>
            <span>{`tag: "${loadedSample.sampleTag}",`}</span>
            <span>
              {loadedSample.bufferTag
                ? `buffer: "${loadedSample.bufferTag}"`
                : ""}
            </span>
          </p>
        )}
        <div className="mt-4 flex items-center justify-start space-x-4">
          <SingleAcquisition lastSampleParams={loadedSample} />
          <QueueStop />
          <CleaningDialog />
        </div>
      </CardContent>
    </Card>
  );
}

export function OnDemandSelector() {
  const { loadedSample } = useCapillaryState();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <PlusIcon />
          Add
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>On demand</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <SingleAcquisition
            className="w-full justify-start font-normal"
            lastSampleParams={loadedSample}
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <QueueStop className="w-full justify-start font-normal" />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <CleaningDialog className="w-full justify-start font-normal" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

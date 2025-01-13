import { Card, CardContent, CardHeader, CardTitle } from "@sophys-web/ui/card";
import { CapillaryStateBadge } from "~/app/_components/capillary-state-badge";
import { useCapillaryState } from "~/app/_hooks/use-capillary-state";
import { CleaningDialog } from "./cleaning";
import { QueueStop } from "./queue-stop";
import { SingleAcquitision } from "./single-acquisition";

export function OnDemandQueueItems() {
  const { loadedSample } = useCapillaryState();

  return (
    <Card className="space-y-4 rounded-md shadow-none">
      <CardHeader className="relative flex items-center justify-center border-b border-slate-300 bg-slate-100 p-2">
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
        <div className="mt-4 flex flex-row items-center justify-between gap-2">
          <SingleAcquitision
            lastSampleParams={loadedSample}
            className="w-full"
          />
          <QueueStop className="w-full" />
          <CleaningDialog className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

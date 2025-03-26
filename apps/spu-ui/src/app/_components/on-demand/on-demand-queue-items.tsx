import { Card, CardContent, CardHeader, CardTitle } from "@sophys-web/ui/card";
import { CapillaryStateBadge } from "~/app/_components/capillary-state-badge";
import { useCapillaryState } from "~/app/_hooks/use-capillary-state";
import { CleaningDialog } from "./cleaning";
import { QueueStop } from "./queue-stop";
import { SingleAcquitision } from "./single-acquisition";

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
          <SingleAcquitision lastSampleParams={loadedSample} />
          <QueueStop />
          <CleaningDialog />
        </div>
      </CardContent>
    </Card>
  );
}

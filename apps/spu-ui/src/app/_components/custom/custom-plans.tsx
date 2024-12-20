import { Card, CardContent, CardHeader, CardTitle } from "@sophys-web/ui/card";
import { CapillaryStateBadge } from "~/app/_components/capillary-state-badge";
import { useCapillaryState } from "~/app/_hooks/use-capillary-state";
import { SingleAcquitision } from "./single-acquisition";

export function CustomPlans() {
  const { loadedSample } = useCapillaryState();

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle className="flex flex-row items-center justify-between text-lg font-medium">
          Custom Plans
          <CapillaryStateBadge className="rounded-md  bg-secondary p-2 text-sm font-semibold" />
        </CardTitle>
      </CardHeader>
      <CardContent>
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
        <SingleAcquitision lastSampleParams={loadedSample} />
      </CardContent>
    </Card>
  );
}
// load, acquire, queue_stop, clean

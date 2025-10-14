import { JsonEditor, monoLightTheme } from "json-edit-react";
import { AlertCircleIcon } from "lucide-react";
import { api } from "@sophys-web/api-client/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sophys-web/ui/card";

export function RunningItem() {
  const {
    data: runningItem,
    isLoading,
    isError,
    error,
  } = api.queue.get.useQuery(undefined, {
    select: (data) => data.runningItem,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Running Item</CardTitle>
          <CardDescription>Currently running task</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">Fetching...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Running Item</CardTitle>
          <CardDescription>Currently running task</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircleIcon className="text-destructive mb-2 size-8" />
            <p className="text-destructive font-semibold">Error loading data</p>
            <p className="text-muted-foreground text-sm">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!runningItem) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Running Item</CardTitle>
          <CardDescription>Currently running task</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircleIcon className="text-muted-foreground mb-2 size-8" />
            <p className="text-muted-foreground">No task currently running</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Running Item</CardTitle>
        <CardDescription>Currently running task</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">
              {runningItem.name.replace(/_/g, " ")}
            </h3>
            <p className="text-muted-foreground">{runningItem.user}</p>
          </div>
          {runningItem.kwargs && (
            <div>
              <h3>Parameters</h3>
              <JsonEditor
                restrictAdd={true}
                restrictDelete={true}
                restrictEdit={true}
                restrictDrag={true}
                data={runningItem.kwargs}
                rootName={"kwargs"}
                theme={monoLightTheme}
                className="!text-sm"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

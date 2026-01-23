import { useState } from "react";
import { format, fromUnixTime } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "@sophys-web/api-client/react";
import { cn } from "@sophys-web/ui";
import { Badge } from "@sophys-web/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@sophys-web/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@sophys-web/ui/hover-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sophys-web/ui/table";

export function PrefectArtifactRenderer({ artifact }: { artifact: any }) {
  if (typeof artifact.data === "string") {
    if (artifact.type === "image" || artifact.data.startsWith("data:image")) {
      const src = artifact.data.startsWith("data:")
        ? artifact.data
        : `data:image/png;base64,${artifact.data}`;

      return <img src={src} alt={artifact.key} />;
    }

    if (artifact.type === "markdown" && typeof artifact.data === "string") {
      return (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {artifact.data}
          </ReactMarkdown>
        </div>
      );
    }

    if (typeof artifact.data === "string") {
      return (
        <div className="prose prose-sm max-w-none">
          <pre className="break-words whitespace-pre-wrap">{artifact.data}</pre>
        </div>
      );
    }

    return (
      <div className="text-muted-foreground text-sm italic">
        Unsupported artifact type
      </div>
    );
  }

  return <pre>{JSON.stringify(artifact.data, null, 2)}</pre>;
}

export function FlowRunRow({ run }: { run: any }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <span
            onClick={() => setOpen(true)}
            className="hover:text-muted-foreground cursor-pointer font-mono text-sm underline"
          >
            {run.id}
          </span>
        </HoverCardTrigger>

        <HoverCardContent
          side="right"
          align="start"
          className="max-h-[300px] w-[420px] space-y-4 overflow-y-auto"
        >
          <div>
            <div className="font-semibold">{run.name}</div>
            <div className="text-muted-foreground text-sm">
              {run.state_name}
            </div>
          </div>

          {run.artifacts.length === 0 && (
            <div className="text-muted-foreground text-sm italic">
              No artifacts
            </div>
          )}

          {run.artifacts.slice(0, 3).map((artifact: any) => (
            <div key={artifact.id} className="space-y-1">
              <div className="text-sm font-medium">{artifact.key}</div>
              <PrefectArtifactRenderer artifact={artifact} />
            </div>
          ))}

          {run.artifacts.length > 3 && (
            <div className="text-muted-foreground text-xs">
              Click to view all artifacts
            </div>
          )}
        </HoverCardContent>
      </HoverCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Flow Run Artifacts</DialogTitle>
            <div className="text-muted-foreground text-sm">
              {run.name} · {run.state_name}
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {run.flow_id}
            {run.artifacts.length === 0 && (
              <div className="text-muted-foreground italic">No artifacts</div>
            )}

            {run.artifacts.map((artifact: any) => (
              <div key={artifact.id} className="space-y-2">
                <div className="text-sm font-semibold">{artifact.key}</div>

                <PrefectArtifactRenderer artifact={artifact} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function PrefectRunsTable() {
  const { data, isLoading, error } = api.prefect.listRunsWithArtifacts.useQuery(
    { page: 0, pageSize: 10 },
    { refetchInterval: 1000 },
  );

  //https://docs.prefect.io/v3/concepts/states#state-transitions
  return (
    <div className="space-y-2">
      <div className="flex items-center"></div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Artifacts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.runs.map((run) => (
              <TableRow key={run.id}>
                <TableCell>{run.name}</TableCell>
                <TableCell>
                  {format(run.start_time, "yyyy/MM/dd HH:mm:ss")}
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn("border-none bg-slate-200 text-slate-800", {
                      "bg-red-200 text-red-800": run.state_name === "Failed",
                      "bg-slate-200 text-slate-800":
                        run.state_name === "Enqueued",
                      "animate-pulse bg-blue-200 text-blue-800":
                        run.state_name === "Running" ||
                        run.state_name === "Retrying",
                      "bg-green-200 text-green-800":
                        run.state_name === "Completed" ||
                        run.state_name === "Cached" ||
                        run.state_name === "Rolled Back",
                      "bg-yellow-200 text-yellow-800":
                        run.state_name === "Scheduled" ||
                        run.state_name === "Late" ||
                        run.state_name === "Awaiting Retry" ||
                        run.state_name === "Awaiting Concurrency Slot",
                      "bg-gray-200 text-gray-800":
                        run.state_name === "Cancelled" ||
                        run.state_name === "Paused" ||
                        run.state_name === "Cancelling",
                      "bg-orange-200 text-orange-800":
                        run.state_name === "Crashed",
                    })}
                    variant="outline"
                  >
                    {run.state_name}
                  </Badge>
                </TableCell>

                <TableCell>
                  <FlowRunRow run={run} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

"use-client";

import { ListOrderedIcon } from "lucide-react";
import { useQueue } from "@sophys-web/api-client/hooks";
import { Badge } from "@sophys-web/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sophys-web/ui/tabs";
import {
  WindowCard,
  WindowCardContent,
  WindowCardHeader,
  WindowCardTitle,
} from "@sophys-web/ui/window-card";
import { DataTable as History } from "./history-table/data-table";
import { DataTable as Queue } from "./queue-table/data-table";
import { RunningItem } from "./running-item";

export function CompactQueue({
  runningItem,
  queueTable,
  historyTable,
}: {
  runningItem?: React.ReactNode;
  queueTable?: React.ReactNode;
  historyTable?: React.ReactNode;
}) {
  const { queue } = useQueue();
  return (
    <WindowCard>
      <WindowCardHeader className="h-9">
        <WindowCardTitle className="gap-2 px-1">
          <ListOrderedIcon className="size-4" />
          Queue
        </WindowCardTitle>
      </WindowCardHeader>
      <WindowCardContent className="flex w-full flex-col gap-2 pb-6">
        {runningItem ?? <RunningItem />}
        <Tabs defaultValue={"queue"}>
          <TabsList>
            <TabsTrigger value="queue">
              Queue
              {queue.data?.items && queue.data.items.length > 0 && (
                <Badge className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums">
                  {queue.data.items.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">History </TabsTrigger>
          </TabsList>
          <TabsContent value="queue">{queueTable ?? <Queue />}</TabsContent>
          <TabsContent value="history">
            {historyTable ?? <History />}
          </TabsContent>
        </Tabs>
      </WindowCardContent>
    </WindowCard>
  );
}

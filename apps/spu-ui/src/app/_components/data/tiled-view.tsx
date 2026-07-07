"use client";

import { useCallback } from "react";
import dynamic from "next/dynamic";
import { JsonEditor, monoLightTheme } from "json-edit-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { api } from "@sophys-web/api-client/react";
import { cn } from "@sophys-web/ui";
import { Field, FieldLabel, FieldSet } from "@sophys-web/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import { Separator } from "@sophys-web/ui/separator";

const Heatmap = dynamic(() => import("@sophys-web/widgets/heatmap"), {
  ssr: false,
});
const Lineplot = dynamic(() => import("@sophys-web/widgets/lineplot"), {
  ssr: false,
});

/**
 * Main container for the data view page. It is responsible for reading url search params for the data source with runUid, viewType, and axisKeys.
 * These parameters are used to fetch the data from the API and render the appropriate child components for visualization.
 */
export function DataViewContainer() {
  const [runUid] = useQueryState("runuid", { defaultValue: "" });

  if (!runUid) {
    // should I render a list? or throw 404? or throw back to the main page?
    return <div className="text-muted-foreground text-sm">Not found</div>;
  }

  return <TiledRunUidtableData runUid={runUid} />;
}

function HistoryItemInfo({ className }: { className?: string }) {
  const [historyItemUid] = useQueryState("historyitemuid", {
    defaultValue: "",
  });
  const { data: history, isPending } = api.httpserver.history.get.useQuery();

  if (isPending) {
    return <div>Loading...</div>;
  }

  const item = history?.items.find((item) => item.itemUid === historyItemUid);

  if (!item) {
    return (
      <div className="text-muted-foreground text-sm">
        No history item found for uid: {historyItemUid}
      </div>
    );
  }

  const runUids = item.result.runUids ?? [];

  return (
    <div className="flex flex-col gap-2">
      <p className="mt-8 mb-4 text-xl font-semibold">{item.name}</p>
      <ul className={"flex flex-col items-start gap-2 text-sm"}>
        {runUids.map((runUid) => (
          <li key={runUid}>
            <p className="max-w-full whitespace-pre-wrap">
              {runUid}: {item.result.msg ?? "No message"}
            </p>
          </li>
        ))}
      </ul>

      <JsonEditor
        restrictAdd={true}
        restrictDelete={true}
        restrictEdit={true}
        restrictDrag={true}
        data={item.kwargs}
        rootName={"parameters"}
        theme={monoLightTheme}
        className={cn("!ml-0 !text-sm", className)}
      />
    </div>
  );
}

const viewTypesParser = parseAsStringLiteral(["heatmap", "lineplot"] as const);
/**
 * Container for the ruiId data navigation and visualization.
 * It is responsible for fetching the data from the API and rendering an appropriate visualization and components for changing the viewType and axisKeys.
 * It is also responsible for updating the url search params when the viewType or axisKeys are changed.
 */
function TiledRunUidtableData({ runUid }: { runUid: string }) {
  const { data, isPending } = api.tiled.getTable.useQuery({
    path: `/${runUid}/primary/internal`,
  });
  const [viewType, setViewType] = useQueryState("viewtype", viewTypesParser);
  const [xKey, setXKey] = useQueryState("xkey", { defaultValue: "" });
  const [yKey, setYKey] = useQueryState("ykey", { defaultValue: "" });
  const [zKey, setZKey] = useQueryState("zkey", { defaultValue: "" });

  const handleViewTypeChange = useCallback(
    async (value: "heatmap" | "lineplot") => {
      if (value === "lineplot" && !!zKey) {
        await Promise.all([setZKey(null), setViewType(value)]);
      } else {
        await setViewType(value);
      }
    },
    [zKey, setZKey, setViewType],
  );

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return (
      <div className="text-muted-foreground text-sm">
        No data available for runUid: {runUid}
      </div>
    );
  }
  const dataKeys = Object.keys(data);

  const xData: number[] = xKey ? (data[xKey] ?? []) : [];
  const yData: number[] = yKey ? (data[yKey] ?? []) : [];
  const zData: number[] = zKey ? (data[zKey] ?? []) : [];

  return (
    <div className="flex h-full w-full flex-row items-center justify-center gap-8 px-8 align-middle">
      <div className="flex w-1/3 flex-col items-center gap-2">
        <HistoryItemInfo />
        <FieldSet className="flex flex-col gap-2">
          <Field>
            <FieldLabel>View Type</FieldLabel>
            <Select
              value={viewType ?? undefined}
              onValueChange={handleViewTypeChange}
            >
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Select view type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="heatmap">Heatmap</SelectItem>
                  <SelectItem value="lineplot">Lineplot</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>x key</FieldLabel>
            <Select value={xKey} onValueChange={setXKey}>
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Select x key" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {dataKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>y key</FieldLabel>
            <Select value={yKey} onValueChange={setYKey}>
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Select y key" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {dataKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>z key</FieldLabel>
            <Select
              disabled={viewType !== "heatmap"}
              value={zKey}
              onValueChange={setZKey}
            >
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Select z key" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {dataKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldSet>
      </div>
      <Separator orientation="vertical" className="h-full" />
      <div className="flex w-2/3 flex-col items-center gap-2">
        {viewType === "heatmap" && zKey && xKey && yKey && (
          <Heatmap
            z={zData}
            x={xData}
            y={yData}
            layout={{
              xaxis: { title: { text: xKey } },
              yaxis: { title: { text: yKey } },
              width: 800,
              height: 800,
            }}
          />
        )}

        {viewType === "lineplot" && (
          <Lineplot
            traces={[
              {
                mode: "lines",
                name: "Lineplot",
                x: xData,
                y: yData,
              },
            ]}
            layout={{
              xaxis: { title: { text: xKey } },
              yaxis: { title: { text: yKey } },
            }}
          />
        )}
      </div>
    </div>
  );
}

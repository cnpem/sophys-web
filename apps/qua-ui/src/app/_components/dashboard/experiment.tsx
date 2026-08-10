"use client";

import { useEffect, useState } from "react";
import {
  FlaskConicalIcon,
  RotateCwIcon,
  TestTubeDiagonalIcon,
} from "lucide-react";
import { useStatus } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sophys-web/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@sophys-web/ui/item";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";

export function ExperimentState() {
  const { status } = useStatus();
  const utils = api.useUtils();

  const [isReloading, setIsReloading] = useState(false);

  const {
    data: sampleName,
    isLoading: sampleLoading,
    isError: sampleError,
  } = api.prefect.variable.getVariableByName.useQuery({
    name: "sample_name",
  });

  const {
    data: experimentName,
    isLoading: experimentLoading,
    isError: experimentError,
  } = api.prefect.variable.getVariableByName.useQuery({
    name: "experiment_name",
  });

  const handleReload = async () => {
    setIsReloading(true);
    await utils.prefect.variable.getVariableByName.invalidate();
    setIsReloading(false);
  };

  useEffect(() => {
    void utils.prefect.variable.getVariableByName.invalidate();
  }, [utils, status.data?.planHistoryUid]);

  return (
    <Card className="gap-2 pb-2">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Experiment Information</CardTitle>
          <CardDescription>Current experiment conditions</CardDescription>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={handleReload}
              disabled={isReloading}
            >
              <RotateCwIcon className={cn({ "animate-spin": isReloading })} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh</TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent>
        <ItemGroup className="grid grid-cols-2 items-center gap-2">
          <Item
            variant={"muted"}
            className={cn({ "opacity-50": experimentLoading })}
            size="sm"
          >
            <ItemMedia>
              <FlaskConicalIcon className="size-4 text-sm text-blue-600" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Experiment name</ItemTitle>
              <ItemDescription
                className={cn(
                  "flex gap-2 text-sm font-semibold",
                  experimentLoading && "text-slate-800",
                )}
              >
                <span>
                  {experimentLoading || experimentError
                    ? "--"
                    : (experimentName?.value ?? "--")}
                </span>
              </ItemDescription>
            </ItemContent>
          </Item>
          <Item
            variant={"muted"}
            className={cn({ "opacity-50": experimentLoading })}
            size="sm"
          >
            <ItemMedia>
              <TestTubeDiagonalIcon className="size-4 text-sm text-emerald-600" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Sample name</ItemTitle>
              <ItemDescription
                className={cn(
                  "flex gap-2 text-sm font-semibold",
                  sampleLoading && "text-slate-800",
                )}
              >
                <span>
                  {sampleLoading || sampleError
                    ? "--"
                    : (sampleName?.value ?? "--")}
                </span>
              </ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>
      </CardContent>
    </Card>
  );
}

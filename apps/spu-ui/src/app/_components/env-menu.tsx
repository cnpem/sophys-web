"use client";

import { buttonVariants } from "@sophys-web/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import { api } from "../../trpc/react";

export function EnvMenu() {
  const apiUtils = api.useUtils();

  const {
    data: status,
    isError,
    isLoading,
  } = api.status.get.useQuery(undefined);

  const { mutate: envUpdate } = api.environment.update.useMutation({
    onSuccess: async () => {
      await apiUtils.status.get.invalidate();
    },
  });

  const { mutate: envOpen } = api.environment.open.useMutation({
    onSuccess: async () => {
      await apiUtils.status.get.invalidate();
    },
  });

  const statusMessage = () => {
    if (isLoading) {
      return "Loading...";
    }
    if (isError) {
      return "Error";
    }
    return status?.reState || "Unknown";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={buttonVariants({ variant: "secondary" })}
        disabled={isLoading || isError}
        onClick={async () => {
          await apiUtils.status.get.invalidate();
        }}
      >
        Status: {statusMessage()}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Env controls</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => {
            envUpdate();
          }}
        >
          Update
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            envOpen();
          }}
        >
          Open
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Full status</DropdownMenuLabel>
        <div className="mb-2 p-2">
          {status
            ? Object.entries(status).map(([key, value]) => (
                <p
                  className="text-ellipsis text-xs text-muted-foreground"
                  key={key}
                >
                  {key}: {value?.toString()}
                </p>
              ))
            : null}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

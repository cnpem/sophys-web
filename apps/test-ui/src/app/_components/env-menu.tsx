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
import { useStatus } from "../_hooks/use-status";

export function EnvMenu() {
  const { status, envUpdate, envOpen, envClose } = useStatus();

  const statusMessage = () => {
    if (status.isLoading) {
      return "Loading...";
    }
    if (status.isError) {
      return "Error";
    }
    return status.data?.reState || "Unknown";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={buttonVariants({ variant: "secondary" })}
        disabled={status.isLoading || status.isError}
      >
        Status: {statusMessage()}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Env controls</DropdownMenuLabel>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            envUpdate.mutate();
          }}
        >
          Update
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            envOpen.mutate();
          }}
        >
          Open
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-muted-foreground hover:font-semibold hover:!text-red-500"
          onClick={() => {
            envClose.mutate();
          }}
        >
          Close
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Full status</DropdownMenuLabel>
        <div className="mb-2 p-2">
          {status.data
            ? Object.entries(status.data).map(([key, value]) => (
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
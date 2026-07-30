"use client";

import type { Session } from "next-auth";
import React from "react";
import Link from "next/link";
import BoringAvatar from "boring-avatars";
import { ChevronsUpDownIcon, LogInIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@sophys-web/ui/sidebar";

export function NavUser(props: {
  session: Session | null;
  signOut: React.ReactNode;
}) {
  const { isMobile } = useSidebar();
  const { session } = props;
  const user = session?.user;

  if (!session || !user?.name) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Sign in">
            <Link href="/auth/signin">
              <LogInIcon className="h-4 w-4" />
              Sign in
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip="User">
              <BoringAvatar
                className="rounded-sm"
                square
                variant="beam"
                name={user.name}
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">
                  {user.roles?.join(", ")}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="flex gap-2 p-0 font-normal">
              <BoringAvatar
                className="rounded-sm"
                square
                variant="beam"
                name={user.name}
                size={48}
              />

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">
                  {user.roles?.join(", ")}
                </span>
                <span className="truncate text-xs">{`p${user.proposal}`}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {session.error && (
              <>
                <DropdownMenuLabel className="flex gap-2 p-0 font-normal">
                  <span className="text-xs text-red-500">{`${session.error}: Please sign in again`}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild>{props.signOut}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

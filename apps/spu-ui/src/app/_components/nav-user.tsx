"use client";

import type { Session } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import BoringAvatar from "boring-avatars";
import { ChevronsUpDown, LogInIcon, LogOutIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { api } from "@sophys-web/api-client/react";
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

export function NavUser(props: { session: Session | null }) {
  const { isMobile } = useSidebar();
  const { session } = props;
  const { data: user, isPending } = api.auth.getUser.useQuery(undefined, {
    enabled: !!session,
  });

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    redirect("/");
  };

  if (!session) {
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
  if (session.error) {
    redirect("/auth/signin");
  }

  if (isPending || !user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <BoringAvatar
              className="rounded-sm"
              square
              variant="marble"
              name="Loading..."
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">username</span>
              <span className="truncate text-xs">roles</span>
            </div>
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
              <ChevronsUpDown className="ml-auto size-4" />
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
                size={32}
              />

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">
                  {user.roles?.join(", ")}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleSignOut()}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

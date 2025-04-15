import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { HistoryIcon, LogOutIcon, TableIcon } from "lucide-react";
import { auth, signOut } from "@sophys-web/auth";
import { Button } from "@sophys-web/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@sophys-web/ui/sidebar";
import { env } from "~/env";
import { NavUser } from "./nav-user";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  // little hack to refresh the session after sign in
  const _cookieStore = await cookies();
  const session = await auth();
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between ">
            <SidebarMenuButton tooltip="Sapucaia UI">
              <Image
                alt="Sapucaia seed"
                height={20}
                src={`${env.NEXT_PUBLIC_BASE_PATH}/sapucaia/seed-color.svg`}
                width={20}
              />
              Sapucaia UI
            </SidebarMenuButton>
            <SidebarTrigger className="group-data-[collapsible=icon]:sr-only" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuButton tooltip="Queue" asChild>
              <Link href="#queue">
                <TableIcon className="mr-2 h-4 w-4" />
                Queue
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton tooltip="History" asChild>
              <Link href="#history">
                <HistoryIcon className="mr-2 h-4 w-4" />
                History
              </Link>
            </SidebarMenuButton>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Toggle Sidebar" asChild>
              <SidebarTrigger className="group-data-[state=expanded]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser session={session} signOut={<SignOut />} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({
          redirect: false,
        });
        redirect("/");
      }}
    >
      <Button
        className="flex w-full justify-start gap-2 p-0"
        type="submit"
        size="sm"
        variant="ghost"
      >
        <LogOutIcon />
        Log out
      </Button>
    </form>
  );
}

import Image from "next/image";
import Link from "next/link";
import { TableIcon } from "lucide-react";
import { auth } from "@sophys-web/auth";
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
              <Link href="/">
                <TableIcon className="mr-2 h-4 w-4" />
                Queue
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
        <NavUser session={session} />
      </SidebarFooter>
      <SidebarRail />:
    </Sidebar>
  );
}

import "@sophys-web/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { GeistMono } from "geist/font/mono";
import { TRPCReactProvider } from "@sophys-web/api-client/react";
import { SidebarInset, SidebarProvider } from "@sophys-web/ui/sidebar";
import { Toaster } from "@sophys-web/ui/sonner";
import { AppSidebar } from "./_components/app-sidebar";

export const metadata: Metadata = {
  title: "Sapucaia UI",
  description: "Sapucaia Beamline UI for the SOPHYS project",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <html lang="en">
      <body className={GeistMono.className}>
        <Toaster richColors theme="light" />
        <TRPCReactProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar variant="sidebar" collapsible="icon" />
            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}

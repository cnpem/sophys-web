import "@sophys-web/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import { Toaster } from "@sophys-web/ui/sonner";
import { TRPCReactProvider } from "../trpc/react";
import UserAvatar from "./_components/user-avatar";

const roboto = Roboto_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sapucaia UI",
  description: "Sapucaia Beamline UI for the SOPHYS project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <div className="absolute right-1 top-1 rounded-md border p-1">
          <UserAvatar />
        </div>
        <Toaster richColors theme="light" />
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}

import "@sophys-web/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import { Toaster } from "@sophys-web/ui/sonner";
import { TRPCReactProvider } from "../trpc/react";
import Navbar from "./_components/navbar";
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
        <Navbar avatar={<UserAvatar />} />
        <Toaster richColors theme="light" />
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}

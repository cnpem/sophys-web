import "@sophys-web/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import Image from "next/image";
import { GeistMono } from "geist/font/mono";
import { TRPCReactProvider } from "@sophys-web/api-client/react";
import { Toaster } from "@sophys-web/ui/sonner";
import { env } from "../env";
import UserAvatar from "./_components/user-avatar";

export const metadata: Metadata = {
  title: "Sapucaia UI",
  description: "Sapucaia Beamline UI for the SOPHYS project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={GeistMono.className}>
        <div className="absolute right-1 top-1 rounded-md p-1 text-muted-foreground">
          <UserAvatar />
        </div>
        <Toaster richColors theme="light" />
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Image
          alt="Sapucaia seed"
          className="absolute bottom-4 right-4"
          height={100}
          src={`${env.NEXT_PUBLIC_BASE_PATH}/sapucaia/seed-black.svg`}
          width={100}
        />
      </body>
    </html>
  );
}

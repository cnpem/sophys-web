import "@sophys-web/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import Image from "next/image";
import { Toaster } from "@sophys-web/ui/sonner";
import { env } from "../env";
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
        <div className="absolute right-1 top-1 rounded-md p-1 text-muted-foreground">
          <UserAvatar />
        </div>
        <Toaster richColors theme="light" />
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Image
          alt="Sapucaia seed"
          className="absolute bottom-0 right-0"
          height={100}
          src={`${env.NEXT_PUBLIC_BASE_PATH}/sapucaia/sementinha.png`}
          width={100}
        />
      </body>
    </html>
  );
}

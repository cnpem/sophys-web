import "./globals.css";
import "@repo/ui/styles.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@repo/ui/sonner";
import { TRPCReactProvider } from "../trpc/react";
import Navbar from "./_components/navbar";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <Navbar />
        <Toaster />
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}

import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { api, HydrateClient } from "@sophys-web/api-client/server";
import { auth } from "@sophys-web/auth";
import { buttonVariants } from "@sophys-web/ui/button";
import { appendBasePath } from "~/lib/appendBasePath";
import { Dashboard } from "./_components/dashboard/dashboard";
import { env as runtimeEnv } from "node:process";
import { PVWSConnectionHandler } from "@sophys-web/pvws-store";


export default async function Page() {
  const pvwsUrl = runtimeEnv.PVWS_URL;
  const session = await auth();

  if (!session) {
    return (
      <main className="flex flex-col items-center gap-10 p-40">
        <Image
          src={appendBasePath("/logo_cnb.png")}
          alt="Logo"
          width={200}
          height={200}
        />
        <h1 className="text-primary text-4xl font-bold">Sophys CNB</h1>
        <p className="text-lg">
          This is the UI for experiments conducted at the Carnaúba beamline.
        </p>
        <Link
          className={buttonVariants({ variant: "link" })}
          href="/auth/signin"
        >
          Sign in
        </Link>
      </main>
    );
  }

  if (session.error) {
    redirect("/auth/signin");
  }

  await Promise.allSettled([
    api.httpserver.queue.get.prefetch(),
    api.httpserver.history.get.prefetch(),
    api.httpserver.status.get.prefetch(),
  ]);

  return (
    <HydrateClient>
      <Dashboard />
      <PVWSConnectionHandler url={pvwsUrl} />
    </HydrateClient>
  );
}

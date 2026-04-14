import { env as runtimeEnv } from "node:process";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { api, HydrateClient } from "@sophys-web/api-client/server";
import { auth } from "@sophys-web/auth";
import { PVWSConnectionHandler } from "@sophys-web/pvws-store";
import { buttonVariants } from "@sophys-web/ui/button";
import { Dashboard } from "./_components/dashboard/dashboard";

export default async function Page() {
  // read pvwsURL from the server runtime environment
  const pvwsUrl = runtimeEnv.PVWS_URL;
  const session = await auth();

  if (!session) {
    return (
      <main className="flex flex-col items-center gap-4 p-24">
        <h1 className="text-primary text-4xl font-bold">Sophys Sapucaia UI</h1>
        <p className="text-lg">
          This is the UI for experiments conducted at the Sapucaia beamline.
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
    api.httpserver.devices.allowedNames.prefetch(),
    api.httpserver.plans.allowed.prefetch(),
  ]);

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <PVWSConnectionHandler url={pvwsUrl} />
        <Dashboard />
      </Suspense>
    </HydrateClient>
  );
}

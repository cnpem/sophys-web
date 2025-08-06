import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { api, HydrateClient } from "@sophys-web/api-client/server";
import { auth } from "@sophys-web/auth";
import { PVWSConnectionHandler } from "@sophys-web/pvws-store";
import { buttonVariants } from "@sophys-web/ui/button";
import { Dashboard } from "./_components/dashboard/dashboard";
import { getSamples } from "./actions/samples";

export default async function Page() {
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
  const [samples] = await Promise.allSettled([
    getSamples(),
    api.queue.get.prefetch(),
    api.history.get.prefetch(),
    api.status.get.prefetch(),
  ]);

  if (samples.status === "rejected") {
    return <div>{samples.reason}</div>;
  }

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <PVWSConnectionHandler />
        <Dashboard initialData={samples.value} />
      </Suspense>
    </HydrateClient>
  );
}

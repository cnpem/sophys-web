import Link from "next/link";
import { redirect } from "next/navigation";
import { api, HydrateClient } from "@sophys-web/api-client/server";
import { auth } from "@sophys-web/auth";
import { buttonVariants } from "@sophys-web/ui/button";
import { Dashboard } from "./_components/dashboard/dashboard";

export default async function Page() {
  const session = await auth();

  if (!session) {
    return (
      <main className="flex flex-col items-center gap-4 p-24">
        <h1 className="text-primary text-4xl font-bold">qua-ui</h1>
        <p className="text-lg">
          This is the UI for experiments conducted at the qua-ui beamline.
        </p>
      </main>
    );
  }

  if (session.error) {
    redirect("/auth/signin");
  }

  await Promise.allSettled([
    api.queue.get.prefetch(),
    api.history.get.prefetch(),
    api.status.get.prefetch(),
  ]);

  return (
    <HydrateClient>
      <Dashboard />
    </HydrateClient>
  );
}

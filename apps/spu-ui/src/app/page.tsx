import { redirect } from "next/navigation";
import { api, HydrateClient } from "@sophys-web/api-client/server";
import { auth } from "@sophys-web/auth";
import Experiment from "./_components/experiment";
import UserAvatar from "./_components/user-avatar";
import { getSamples } from "./actions/samples";

export default async function Page() {
  const session = await auth();

  if (!session) {
    return (
      <main className="flex flex-col items-center gap-4 p-24">
        <h1 className="text-4xl font-bold text-primary">Sophys Sapucaia UI</h1>
        <p className="text-lg">
          This is the UI for experiments conducted at the Sapucaia beamline.
        </p>
        <UserAvatar />
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
      <Experiment initialData={samples.value} />
    </HydrateClient>
  );
}

import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { auth } from "@sophys-web/auth";

const Experiment = dynamic(() => import("../_components/experiment"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default async function QueuePage() {
  const session = await auth();
  if (!session || session.error) {
    return redirect("/auth/signin?callbackUrl=/queues");
  }

  return <Experiment />;
}

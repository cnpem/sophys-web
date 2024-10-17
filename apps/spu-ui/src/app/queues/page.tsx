import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { auth } from "@sophys-web/auth";
import { getSamples } from "../actions/samples";

const Experiment = dynamic(() => import("../_components/experiment"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default async function QueuePage() {
  const session = await auth();
  if (!session || session.error) {
    return redirect("/auth/signin?callbackUrl=/queues");
  }
  const samples = await getSamples();

  return <Experiment initialSamples={samples} />;
}

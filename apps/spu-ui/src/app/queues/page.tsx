// import { Experiment } from "../_components/experiment";

import dynamic from "next/dynamic";

const Experiment = dynamic(() => import("../_components/experiment"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function QueuePage() {
  return <Experiment />;
}

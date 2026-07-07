import { redirect } from "next/navigation";
import { HydrateClient } from "@sophys-web/api-client/server";
import { auth } from "@sophys-web/auth";
import { DataViewContainer } from "../_components/data/tiled-view";

export default async function Page() {
  const session = await auth();

  if (!session || session.error) {
    redirect("/auth/signin");
  }

  return (
    <HydrateClient>
      <DataViewContainer />
    </HydrateClient>
  );
}

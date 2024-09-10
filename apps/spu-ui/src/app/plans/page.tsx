import { redirect } from "next/navigation";
import { auth } from "@sophys-web/auth";
import { SelectPlan } from "../_components/select-plan";

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-24">
      <h1 className="text-lg font-bold">Plans for user {session.user.name}</h1>
      <div className="flex flex-col items-center justify-center my-auto gap-2">
        <div className="flex gap-2 w-full">
          <SelectPlan />
        </div>
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@sophys-web/auth";
import { SelectPlan } from "../_components/select-plan";

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-lg font-bold">Plans for user {session.user.name}</h1>
      <div className="my-auto flex flex-col items-center justify-center gap-2">
        <div className="flex w-full gap-2">
          <SelectPlan />
        </div>
      </div>
    </main>
  );
}

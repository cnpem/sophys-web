import { redirect } from "next/navigation";
import { auth } from "@sophys-web/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sophys-web/ui/tabs";
import { Console } from "../_components/console";
import { History } from "../_components/history";
import { Queue } from "../_components/queue";
import { SelectPlan } from "../_components/select-plan";

export default async function Page() {
  const session = await auth();

  if (!session || session.error) {
    return redirect("/auth/signin?callbackUrl=/plans");
  }

  return (
    <main className="mx-24 flex min-h-screen items-center justify-between gap-4">
      <div className="flex w-1/2 flex-col gap-2">
        <Tabs className="w-full space-y-2" defaultValue="queue">
          <TabsContent value="queue">
            <Queue />
          </TabsContent>
          <TabsContent value="history">
            <History />
          </TabsContent>
          <TabsList>
            <TabsTrigger value="queue">Queue</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </Tabs>
        <Console />
      </div>
      <div className="w-1/2">
        <SelectPlan />
      </div>
    </main>
  );
}

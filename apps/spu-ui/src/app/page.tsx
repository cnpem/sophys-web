import { Input } from "@repo/ui/input";
import ClickMe from "./_components/click-me";

export default function Page(): JSX.Element {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-24">
      <div className="flex flex-col items-center my-auto *:space-y-12">
        <ClickMe />

        <Input placeholder="Enter your email" type="email" />
      </div>
    </main>
  );
}

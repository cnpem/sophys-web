
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";


export default function Page(): JSX.Element {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-24">
      <div className="flex flex-col items-center my-auto *:space-y-12">
        <Button>Click me!</Button>
        <Input placeholder="Enter your email" type="email" />
      </div>
    </main>
  );
}

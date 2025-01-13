import { SquareIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import { useQueue } from "~/app/_hooks/use-queue";

export function QueueStop({ className }: { className?: string }) {
  const { add } = useQueue();

  const handleSubmit = () => {
    add.mutate({
      item: {
        name: "queue_stop",
        itemType: "instruction",
        args: [],
        kwargs: {},
      },
      pos: "front",
    });
  };

  return (
    <Button variant="outline" className={className} onClick={handleSubmit}>
      <SquareIcon className="mr-2 h-4 w-4" />
      Stop
    </Button>
  );
}

import { SquareIcon } from "lucide-react";
import { useQueue } from "@sophys-web/api-client/hooks";
import { Button } from "@sophys-web/ui/button";

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
    });
  };

  return (
    <Button variant="ghost" className={className} onClick={handleSubmit}>
      <SquareIcon className="mr-2 h-4 w-4" />
      Stop
    </Button>
  );
}

"use client"
import { toast } from "@repo/ui/sonner";
import { Button } from "@repo/ui/button";

export default function ClickMe(): JSX.Element {
    return (
        <Button
        onClick={() => {
          toast.success("Hello, world!");
        }}
      >
        Click me!
      </Button>
    );
}
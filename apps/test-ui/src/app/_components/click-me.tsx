"use client";
import { toast } from "@sophys-web/ui/sonner";
import { Button } from "@sophys-web/ui/button";

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

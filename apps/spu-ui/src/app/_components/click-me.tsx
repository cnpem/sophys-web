"use client";

import { Button } from "@sophys-web/ui/button";
import { toast } from "@sophys-web/ui/sonner";

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

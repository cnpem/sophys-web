import { useState } from "react";
import { GlassWaterIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import {
  WindowCard,
  WindowCardAction,
  WindowCardContent,
  WindowCardHeader,
  WindowCardTitle,
} from "@sophys-web/ui/window-card";
import { Samples as Setup1Samples } from "../store/setup1/sample-store";
import { Samples as Setup2Samples } from "../store/setup2/sample-store";

export function ExperimentalEnvironment() {
  const [selectedStore, setSelectedStore] = useState<"setup1" | "setup2">(
    "setup1",
  );
  return (
    <WindowCard className="w-fit">
      <WindowCardHeader>
        <WindowCardTitle>
          <GlassWaterIcon className="mx-1 size-4" />
          Experimental Environment
        </WindowCardTitle>
        <WindowCardAction>
          <Select
            value={selectedStore}
            onValueChange={(value) =>
              setSelectedStore(value as "setup1" | "setup2")
            }
          >
            <SelectTrigger className="mb-0.5 bg-white text-sm">
              <SelectValue placeholder="Select Sample Store" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="setup1">Setup 1</SelectItem>
              <SelectItem value="setup2">Setup 2</SelectItem>
            </SelectContent>
          </Select>
        </WindowCardAction>
      </WindowCardHeader>
      <WindowCardContent>
        {selectedStore === "setup1" && <Setup1Samples />}
        {selectedStore === "setup2" && <Setup2Samples />}
      </WindowCardContent>
    </WindowCard>
  );
}

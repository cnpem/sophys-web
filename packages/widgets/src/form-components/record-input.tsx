import { useCallback, useState } from "react";
import { XCircleIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import { Input } from "@sophys-web/ui/input";

interface KVPair {
  key: string;
  value: string;
}

interface RecordInputProps {
  onValueChange: (value: Record<string, string>) => void;
}

export function RecordInput({ onValueChange }: RecordInputProps) {
  const [pairs, setPairs] = useState<KVPair[]>([]);

  const addPair = useCallback(() => {
    setPairs((prev) => [...prev, { key: "", value: "" }]);
  }, []);

  const removePair = useCallback((index: number) => {
    setPairs((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updatePair = useCallback(
    (index: number, key: string, value: string) => {
      setPairs((prev) => {
        const newPairs = [...prev];
        newPairs[index] = { key, value };
        onValueChange(
          newPairs.reduce<Record<string, string>>((acc, pair) => {
            acc[pair.key] = pair.value;
            return acc;
          }, {}),
        );
        return newPairs;
      });
    },
    [onValueChange],
  );

  return (
    <div className="flex flex-col space-y-2">
      {pairs.map((pair, index) => (
        <div className="flex space-x-2" key={index}>
          <Input
            name="key"
            onChange={(e) => {
              updatePair(index, e.target.value, pair.value);
              e.preventDefault();
            }}
            placeholder="Key"
            type="text"
            value={pair.key}
          />
          <Input
            name="value"
            onChange={(e) => {
              updatePair(index, pair.key, e.target.value);
              e.preventDefault();
            }}
            placeholder="Value"
            type="text"
            value={pair.value}
          />
          <Button
            onClick={(e) => {
              removePair(index);
              e.preventDefault();
            }}
            size="icon"
            variant="ghost"
          >
            <XCircleIcon className="text-destructive" />
          </Button>
        </div>
      ))}

      <Button
        onClick={(e) => {
          addPair();
          e.preventDefault();
        }}
      >
        Add
      </Button>
    </div>
  );
}

import type { z } from "zod";
import { JsonEditor, monoLightTheme } from "json-edit-react";
import { useStore } from "@sophys-web/api-client/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sophys-web/ui/card";
import { schema } from "../../lib/schemas/store";

export function StoreCard() {
  const { store, isLoading, isPending, isParsing, setItem } = useStore(schema);

  const freeze = isLoading || isPending || isParsing;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello Store</CardTitle>
        <CardDescription>Store data for the current session</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          data-disabled={freeze}
          className="flex h-fit w-full items-center data-[disabled=true]:opacity-50"
        >
          {isLoading && (
            <div className="flex h-full w-full items-center justify-center">
              <span>Loading...</span>
            </div>
          )}
          {!isLoading && (
            <JsonEditor
              viewOnly={freeze}
              restrictAdd={true}
              restrictDelete={true}
              restrictEdit={freeze}
              restrictDrag={true}
              data={store ?? {}}
              rootName={"store data"}
              theme={monoLightTheme}
              onUpdate={({ name, newValue }) => {
                // check if name is a valid key in the schema
                if (!(name in schema.shape)) {
                  console.warn(`Field "${name}" is not defined in the schema.`);
                  return `Field "${name}" is not defined in the schema.`;
                }
                // check if newValue matches the schema type
                const fieldSchema =
                  schema.shape[name as keyof typeof schema.shape];
                const parsedValue = fieldSchema.safeParse(newValue);
                if (!parsedValue.success) {
                  console.warn(
                    `Value for field "${name}" does not match schema:`,
                    parsedValue.error,
                  );
                  return `Value for field "${name}" does not match schema.`;
                }
                // If both checks pass, set the item in the store
                setItem(name as keyof z.infer<typeof schema>, parsedValue.data);
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

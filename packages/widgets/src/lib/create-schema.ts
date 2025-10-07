import camelCase from "camelcase";
import { z } from "zod";
import type { schemas } from "@sophys-web/api";

export type Parameter = z.infer<
  typeof schemas.plans.plan
>["parameters"][number];

export const createSchema = (parameters: Parameter[]) => {
  const schemaFields: z.ZodRawShape = {};

  parameters.forEach((param) => {
    const { name, annotation } = param;
    const type = annotation?.type ?? "";
    const camelName = camelCase(name);

    if (type.includes("Literal") && !type.includes("list")) {
      const valuesStr = type.replace("typing.", "").replace("Literal[", "").replace("]", "");
      const valueArray = valuesStr.split(", ").map((v) => v.replace(/'/g, ""));
      schemaFields[camelName] = z.coerce
        .string()
        .refine((val) => valueArray.includes(val), {
          message: `Value must be one of: ${valueArray.join(", ")}`,
        });
      return;
    }
    
    if (type.includes("Literal") && type.includes("list")) {
      schemaFields[camelName] = z
          .array(z.string())
          .optional()
          .default([]);
      return;
    }
    switch (type) {
      case "typing.Sequence[__READABLE__]":
      case "typing.Sequence[__FLYABLE__]":
      case "typing.Sequence[__MOVABLE__]":
        schemaFields[camelName] = z.array(z.string()).nonempty();
        break;
      case "__MOVABLE__":
      case "__FLYABLE__":
      case "__READABLE__":
        schemaFields[camelName] = z.string().min(1);
        break;
      case "int":
      case "typing.Optional[int]":
        schemaFields[camelName] = type.includes("Optional")
          ? z.coerce.number().int().optional()
          : z.coerce.number().int();
        break;
      case "typing.List[int]":
      case "list[int]":
        // schemaFields[camelName] = z.array(z.coerce.number().int());
        schemaFields[camelName] = z
          .any()
          .transform((val) => {
            if (Array.isArray(val)) {
              // Already an array of strings
              return val.map(Number);
            }
            if (typeof val === "string") {
              // Split by comma, trim whitespace, filter out empty strings and convert to numbers
              return val
                .split(",")
                .map((v) => v.trim())
                .filter((v) => v.length > 0)
                .map(Number);
            }
            // If null/undefined or other, return empty array
            return [];
          })
          .optional();
        break;
      case "float":
      case "typing.Optional[float]":
        schemaFields[camelName] = type.includes("Optional")
          ? z.coerce.number().optional()
          : z.coerce.number();
        break;
      case "typing.List[float]":
      case "list[float]":
        // schemaFields[camelName] = z.array(z.coerce.number()).optional();
        schemaFields[camelName] = z
          .any()
          .transform((val) => {
            if (Array.isArray(val)) {
              // Already an array of strings
              return val.map(Number);
            }
            if (typeof val === "string") {
              // Split by comma, trim whitespace, filter out empty strings and convert to numbers
              return val
                .split(",")
                .map((v) => v.trim())
                .filter((v) => v.length > 0)
                .map(Number);
            }
            // If null/undefined or other, return empty array
            return [];
          })
          .optional();
        break;
      case "typing.Union[float, typing.Sequence[float], None]":
        schemaFields[camelName] = z
          .union([z.number(), z.array(z.number())])
          .optional();
        break;
      case "str":
        schemaFields[camelName] = z.string().min(1);
        break;
      case "typing.List[str]":
      case "list[str]":
        // schemaFields[camelName] = z.array(z.string()).optional();
        // it also needs to be able to parse strings like "a, b, c" as ["a", "b", "c"] when it comes from the UI
        schemaFields[camelName] = z
          .any()
          .transform((val) => {
            if (Array.isArray(val)) {
              // Already an array of strings
              return val.map(String);
            }
            if (typeof val === "string") {
              // Split by comma, trim whitespace, filter out empty strings
              return val
                .split(",")
                .map((v) => v.trim())
                .filter((v) => v.length > 0);
            }
            // If null/undefined or other, return empty array
            return [];
          })
          .optional();
        break;
      case "dict":
      case "typing.Optional[dict]":
        schemaFields[camelName] = z.record(z.string(), z.string()).optional();
        break;
      case "bool":
        schemaFields[camelName] = z.boolean();
        break;
      case "typing.Union[float, typing.Sequence[float], NoneType]":
        schemaFields[camelName] = z
          .string()
          .optional()
          .refine(
            (val) => {
              if (!val || val === "None") {
                return true;
              }
              // check if the string is a list of floats separated by commas
              const array = val.split(", ").map((v) => parseFloat(v));
              return array.every((v) => !isNaN(v));
            },
            {
              message: "Value must be a list of floats separated by commas",
            },
          )
          .transform((val) => {
            if (!val || val === "None") {
              return null;
            }
            return val.split(", ").map((v) => parseFloat(v));
          });
        break;
      case "typing.Union[int, typing.Sequence[int], NoneType]":
        schemaFields[camelName] = z
          .string()
          .optional()
          .refine(
            (val) => {
              if (!val || val === "None") {
                return true;
              }
              // check if the string is a list of floats separated by commas
              const array = val.split(", ").map((v) => parseInt(v));
              return array.every((v) => !isNaN(v));
            },
            {
              message: "Value must be a list of ints separated by commas",
            },
          )
          .transform((val) => {
            if (!val || val === "None") {
              return null;
            }
            return val.split(", ").map((v) => parseInt(v));
          });
        break;
      // annotations from *args defined by the annotation of the first element of the tuple
      case "__MOVABLE__,typing.Any":
      case "__MOVABLE__,typing.Any,typing.Any":
        // __MOVABLE__ and typing.Any are treated as strings,
        // so we can expect arrays like [movable1, string1, movable2, string2, ..., movableN, stringN]
        schemaFields[camelName] = z.array(z.string()).nonempty();
        break;
      case "__MOVABLE__,typing.List[typing.Any]":
        // i.e.: [movable1, [string1, string2, ..., stringN], movable2, [string1, string2, ..., stringN], ..., movableN, [string1, string2, ..., stringN]]
        schemaFields[camelName] = z
          .array(z.union([z.string(), z.array(z.string())]))
          .nonempty();
        break;
      case "typing.Union[bool, typing.Sequence[__MOVABLE__]]":
        // this is a special case where the value can be a boolean or a list of strings
        // the "true" option represents the selection of all the items of the list
        // the "false" option represents the selection of none of the items of the list
        // in the ui, we will represent this only as a list of strings and add an element to facilitate the selection of all the items
        // if the list is empty, it means that the user selected none of the items
        schemaFields[camelName] = z.array(z.string()).optional();
        break;
      case "typing.Sequence[__CALLABLE__]":
      case "__CALLABLE__":
        // this is a special python object that we don't have a direct equivalent
        schemaFields[camelName] = z.null().optional();
        break;
      default:
        schemaFields[camelName] = z.string().optional();
    }
  });
  return z.object(schemaFields);
};

export type AnySchema = ReturnType<typeof createSchema>;

import { z } from "zod";
import type { schemas } from "@sophys-web/api";

export type Parameter = z.infer<
  typeof schemas.plans.plan
>["parameters"][number];

export const createSchema = (parameters: Parameter[]) => {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  parameters.forEach((param) => {
    const { name, annotation } = param;
    const type = annotation?.type || "";

    if (type.includes("typing.Literal")) {
      const valuesStr = type.replace("typing.Literal[", "").replace("]", "");
      const valueArray = valuesStr.split(", ").map((v) => v.replace(/'/g, ""));
      schemaFields[name] = z.coerce
        .string()
        .refine((val) => valueArray.includes(val), {
          message: `Value must be one of: ${valueArray.join(", ")}`,
        });
      return;
    }
    switch (type) {
      case "typing.Sequence[__READABLE__]":
      case "typing.Sequence[__FLYABLE__]":
      case "typing.Sequence[__MOVABLE__]":
        schemaFields[name] = z.array(z.string()).nonempty();
        break;
      case "__MOVABLE__":
      case "__FLYABLE__":
      case "__READABLE__":
        schemaFields[name] = z.string().min(1);
        break;
      case "int":
      case "typing.Optional[int]":
        schemaFields[name] = type.includes("Optional")
          ? z.coerce.number().int().optional()
          : z.coerce.number().int();
        break;
      case "float":
      case "typing.Optional[float]":
        schemaFields[name] = type.includes("Optional")
          ? z.coerce.number().optional()
          : z.coerce.number();
        break;
      case "typing.Union[float, typing.Sequence[float], None]":
        schemaFields[name] = z
          .union([z.number(), z.array(z.number())])
          .optional();
        break;
      case "str":
        schemaFields[name] = z.string().min(1);
        break;
      case "typing.Optional[dict]":
        schemaFields[name] = z.record(z.string(), z.string()).optional();
        break;
      case "bool":
        schemaFields[name] = z.boolean();
        break;
      case "typing.Union[float, typing.Sequence[float], NoneType]":
        schemaFields[name] = z
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
        schemaFields[name] = z
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
        schemaFields[name] = z.array(z.string()).nonempty();
        break;
      case "__MOVABLE__,typing.List[typing.Any]":
        // i.e.: [movable1, [string1, string2, ..., stringN], movable2, [string1, string2, ..., stringN], ..., movableN, [string1, string2, ..., stringN]]
        schemaFields[name] = z
          .array(z.union([z.string(), z.array(z.string())]))
          .nonempty();
      case "typing.Union[bool, typing.Sequence[__MOVABLE__]]":
        // this is a special case where the value can be a boolean or a list of strings
        // the "true" option represents the selection of all the items of the list
        // the "false" option represents the selection of none of the items of the list
        // in the ui, we will represent this only as a list of strings and add an element to facilitate the selection of all the items
        // if the list is empty, it means that the user selected none of the items
        schemaFields[name] = z.array(z.string()).optional();
        break;
      case "typing.Sequence[__CALLABLE__]":
      case "__CALLABLE__":
        // this is a special python object that we don't have a direct equivalent
        schemaFields[name] = z.null().optional();
        break;
      default:
        schemaFields[name] = z.string().optional();
    }
  });

  return z.object(schemaFields);
};

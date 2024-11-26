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

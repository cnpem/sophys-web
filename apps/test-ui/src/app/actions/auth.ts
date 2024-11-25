"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn as naSignIn } from "@sophys-web/auth";

const SigninSchema = z.object({
  username: z.string().min(2),
  password: z.string().min(2),
});

export async function signIn(data: z.infer<typeof SigninSchema>) {
  const parsed = await SigninSchema.safeParseAsync(data);

  if (!parsed.success) {
    return { error: "Invalid data" };
  }

  try {
    await naSignIn("credentials", {
      username: parsed.data.username,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        case "AccessDenied":
          return { error: "Access denied" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    throw error;
  }
}

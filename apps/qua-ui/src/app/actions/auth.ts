"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn as naSignIn } from "@sophys-web/auth";

const signInSchema = z.object({
  username: z.string().min(2),
  password: z.string().min(2),
  proposal: z.string().length(8),
});

type SignInState =
  | { success: true; message: "Signed in successfully" }
  | {
      success: false;
      message: string;
    };

export async function signIn(data: FormData): Promise<SignInState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) {
    return { success: false, message: "Invalid data" };
  }

  try {
    await naSignIn("credentials", {
      username: parsed.data.username,
      password: parsed.data.password,
      proposal: parsed.data.proposal,
      redirect: false,
    });
    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Invalid data" };
    }
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, message: "Invalid credentials" };
        case "AccessDenied":
          return { success: false, message: "Access denied" };
        default:
          return { success: false, message: "An error occurred" };
      }
    }
    return { success: false, message: "An error occurred" };
  }
}

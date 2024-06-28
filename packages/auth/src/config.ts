import type { DefaultSession, NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { z } from "zod";
import { env } from "../env";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const isSecureContext = env.NODE_ENV !== "development";

export const authConfig: NextAuthConfig = {
  secret: env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "LDAP",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = await z
            .object({
              email: z.string().email(),
              password: z.string(),
            })
            .safeParseAsync(credentials);

          if (!parsed.success) {
            return null;
          }

          const name = parsed.data?.email.split("@")[0];

          const user = {
            id: name,
            name,
            email: parsed.data?.email,
          };

          if (user.name === "test") {
            cookies().set("test", "test", {
              secure: isSecureContext,
              httpOnly: true,
            });
          }
          return user;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
  },
} satisfies NextAuthConfig;

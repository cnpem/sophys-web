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
export const BLUESKY_COOKIE_PREFIX = "bluesky-http_";

export const authConfig: NextAuthConfig = {
  secret: env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  theme: {
    colorScheme: "light",
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

          const formData = new FormData();
          formData.append("username", name);
          formData.append("password", parsed.data?.password);

          const res = await fetch(
            `${env.BLUESKY_HTTPSERVER_URL}/api/auth/provider/ldap/token`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!res.ok) {
            return null;
          }

          const data = await res.json();
          const cookieStore = cookies();
          cookieStore.set(
            `${BLUESKY_COOKIE_PREFIX}access_token`,
            data.access_token,
            {
              secure: isSecureContext,
              httpOnly: true,
            }
          );
          cookieStore.set(
            `${BLUESKY_COOKIE_PREFIX}refresh_token`,
            data.refresh_token,
            {
              secure: isSecureContext,
              httpOnly: true,
            }
          );

          const user = {
            id: name,
            name,
            email: parsed.data?.email,
            blueskyAccessToken: data.access_token as string,
            blueskyRefreshToken: data.refresh_token as string,
          };
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

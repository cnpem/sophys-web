import type { DefaultJWT } from "next-auth/jwt";
import { DefaultSession, NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { env } from "../env";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      blueskyAccessToken: string;
    } & DefaultSession["user"];
    error?: "RefreshAccessTokenError";
  }

  interface User {
    blueskyAccessToken: string;
    blueskyRefreshToken: string;
    expires_in: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    bluesky_access_token: string;
    bluesky_expires_at: number;
    bluesky_refresh_token: string;
    error?: "RefreshAccessTokenError";
  }
}

const blueskyTokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  refresh_token_expires_in: z.number(),
  token_type: z.string(),
});

export const isSecureContext = env.NODE_ENV !== "development";

async function refreshBlueskyToken(refreshToken: string) {
  const res = await fetch(
    `${env.BLUESKY_HTTPSERVER_URL}/api/auth/session/refresh`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    },
  );
  if (!res.ok) {
    throw new Error("Failed to refresh Bluesky token");
  }

  const data = await res.json();
  const parsed = await blueskyTokenSchema.parseAsync(data);
  return parsed;
}

export const authConfig: NextAuthConfig = {
  secret: env.AUTH_SECRET,
  trustHost: env.AUTH_TRUST_HOST,
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
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = await z
          .object({
            username: z.string().min(2),
            password: z.string().min(2),
          })
          .safeParseAsync(credentials);

        if (!parsed.success) {
          throw parsed.error;
        }

        const formData = new FormData();
        formData.append("username", parsed.data?.username);
        formData.append("password", parsed.data?.password);

        const res = await fetch(
          `${env.BLUESKY_HTTPSERVER_URL}/api/auth/provider/ldap/token`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!res.ok) {
          return null;
        }

        const data = await res.json();
        const parsedToken = await blueskyTokenSchema.parseAsync(data);

        const user = {
          id: parsed.data?.username,
          name: parsed.data?.username,
          blueskyAccessToken: parsedToken.access_token,
          blueskyRefreshToken: parsedToken.refresh_token,
          expires_in: parsedToken.expires_in,
        };

        return user;
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
        blueskyAccessToken: token.bluesky_access_token,
      },
      error: token.error,
    }),
    jwt: async ({ token, user }) => {
      if (user) {
        token.bluesky_access_token = user.blueskyAccessToken;
        token.bluesky_refresh_token = user.blueskyRefreshToken;
        const jwt = {
          id: token.sub,
          name: user.name,
          email: user.email,
          bluesky_access_token: user.blueskyAccessToken,
          bluesky_refresh_token: user.blueskyRefreshToken,
          bluesky_expires_at: Math.floor(Date.now() / 1000) + user.expires_in,
        };
        return jwt;
      } else if (Date.now() < token.bluesky_expires_at * 1000) {
        return token;
      } else {
        if (!token.bluesky_refresh_token)
          throw new Error("No refresh token available");
        try {
          const refreshed = await refreshBlueskyToken(
            token.bluesky_refresh_token,
          );
          return {
            ...token,
            bluesky_access_token: refreshed.access_token,
            bluesky_refresh_token: refreshed.refresh_token,
            bluesky_expires_at:
              Math.floor(Date.now() / 1000) + refreshed.expires_in,
          };
        } catch (error) {
          return {
            ...token,
            error: "RefreshAccessTokenError" as const,
          };
        }
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
} satisfies NextAuthConfig;

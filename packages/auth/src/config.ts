import type { DefaultSession, NextAuthConfig } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { env } from "../env";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
    error?: "RefreshAccessTokenError";
  }

  interface User {
    blueskyAccessToken: string;
    blueskyRefreshToken: string;
    expires_in: number;
    proposal: string;
    scopes?: string[];
    roles?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    bluesky_access_token: string;
    bluesky_expires_at: number;
    bluesky_refresh_token: string;
    roles?: string[];
    scopes?: string[];
    proposal: string;
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

async function getBlueskyRolesAndScopes(accessToken: string) {
  const res = await fetch(`${env.BLUESKY_HTTPSERVER_URL}/api/auth/scopes`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to get Bluesky roles and scopes");
  }

  const data: unknown = await res.json();
  const parsed = await z
    .object({
      roles: z.array(z.string()),
      scopes: z.array(z.string()),
    })
    .safeParseAsync(data);
  if (!parsed.success) {
    throw new Error("Failed to parse Bluesky roles and scopes", parsed.error);
  }
  return parsed.data;
}

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
    return null;
  }

  const data: unknown = await res.json();
  const parsed = blueskyTokenSchema.safeParse(data);

  if (!parsed.success) {
    return null;
  }
  return parsed.data;
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
        proposal: { label: "Proposal", type: "text" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            username: z.string().min(2),
            password: z.string().min(2),
            proposal: z.string().length(8),
          })
          .safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const formData = new FormData();
        formData.append("username", parsed.data.username);
        formData.append("password", parsed.data.password);

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

        const data: unknown = await res.json();
        const parsedToken = blueskyTokenSchema.parse(data);

        const rolesAndScopes = await getBlueskyRolesAndScopes(
          parsedToken.access_token,
        );

        const user = {
          id: parsed.data.username,
          name: parsed.data.username,
          proposal: parsed.data.proposal,
          blueskyAccessToken: parsedToken.access_token,
          blueskyRefreshToken: parsedToken.refresh_token,
          expires_in: parsedToken.expires_in,
          roles: rolesAndScopes.roles,
          scopes: rolesAndScopes.scopes,
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
        proposal: token.proposal,
        roles: token.roles,
        scopes: token.scopes,
        blueskyAccessToken: token.bluesky_access_token,
        id: token.sub,
      },
      error: token.error,
    }),
    jwt: async ({ token, user, trigger }) => {
      if (trigger === "signIn") {
        const jwt = {
          id: token.sub,
          name: user.name,
          email: user.email,
          proposal: user.proposal,
          bluesky_access_token: user.blueskyAccessToken,
          bluesky_refresh_token: user.blueskyRefreshToken,
          bluesky_expires_at: Math.floor(Date.now() / 1000) + user.expires_in,
          roles: user.roles,
          scopes: user.scopes,
        };
        return jwt;
      } else if (Date.now() < token.bluesky_expires_at * 1000) {
        return token;
      } else {
        if (!token.bluesky_refresh_token)
          throw new Error("No refresh token available");
        const refreshed = await refreshBlueskyToken(
          token.bluesky_refresh_token,
        );

        if (!refreshed) {
          return {
            ...token,
            error: "RefreshAccessTokenError" as const,
          };
        }
        return {
          ...token,
          bluesky_access_token: refreshed.access_token,
          bluesky_refresh_token: refreshed.refresh_token,
          bluesky_expires_at:
            Math.floor(Date.now() / 1000) + refreshed.expires_in,
        };
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
} satisfies NextAuthConfig;

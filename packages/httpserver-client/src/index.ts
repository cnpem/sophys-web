import type { z } from "zod";
import { baseGetHandler, basePostHandler } from "./lib/handler-generator";
import authLdapTokenSchemas from "./lib/schemas/auth-provider-ldap-token";
import authScopesSchemas from "./lib/schemas/auth-scopes";
import historyGetSchemas from "./lib/schemas/history-get";
import queueGetSchemas from "./lib/schemas/queue-get";
import queueItemAddSchemas from "./lib/schemas/queue-item-add";
import queueItemAddBatchSchemas from "./lib/schemas/queue-item-add-batch";

class HttpServerBaseClient {
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  baseUrl: string;
  accessToken: z.infer<typeof authLdapTokenSchemas.blueskyTokenSchema> | null =
    null;
  scopesData: z.infer<typeof authScopesSchemas.response>["data"] | null = null;

  private requireAccessToken() {
    if (!this.accessToken) {
      throw new Error(
        "Access token is not set. Please set the access token before making requests.",
      );
    }
    if (Date.now() >= this.accessToken.expiresIn) {
      throw new Error("Access token is expired. Please login again.");
    }
    return this.accessToken.accessToken;
  }

  authLdapToken = (params: z.infer<typeof authLdapTokenSchemas.body>) => {
    return basePostHandler(
      this.baseUrl,
      "/api/auth/provider/ldap/token",
      undefined,
      authLdapTokenSchemas.body,
      authLdapTokenSchemas.response,
    )(params);
  };

  authScopes = () => {
    const token = this.requireAccessToken();
    return baseGetHandler(
      this.baseUrl,
      "/api/auth/scopes",
      token,
      authScopesSchemas.response,
    )();
  };

  login = async ({
    username,
    password,
  }: z.infer<typeof authLdapTokenSchemas.body>) => {
    try {
      const tokenResponse = await this.authLdapToken({ username, password });
      if (!tokenResponse.success) {
        throw new Error("Failed to authenticate");
      }
      this.accessToken = tokenResponse.data;

      const scopesResponse = await this.authScopes();
      if (!scopesResponse.success) {
        throw new Error("Failed to fetch scopes");
      }
      this.scopesData = scopesResponse.data;
      return { tokenResponse, scopesResponse };
    } catch (error) {
      this.accessToken = null;
      throw error;
    }
  };

  queueGet = () => {
    const token = this.requireAccessToken();
    return baseGetHandler(
      this.baseUrl,
      "/api/queue/get",
      token,
      queueGetSchemas.response,
    )();
  };

  queueItemAdd = (params: z.infer<typeof queueItemAddSchemas.body>) => {
    const token = this.requireAccessToken();
    return basePostHandler(
      this.baseUrl,
      "/api/queue/item/add",
      token,
      queueItemAddSchemas.body,
      queueItemAddSchemas.response,
    )(params);
  };

  queueItemAddBatch = (
    params: z.infer<typeof queueItemAddBatchSchemas.body>,
  ) => {
    const token = this.requireAccessToken();
    return basePostHandler(
      this.baseUrl,
      "/api/queue/item/add/batch",
      token,
      queueItemAddBatchSchemas.body,
      queueItemAddBatchSchemas.response,
    )(params);
  };

  historyGet = () => {
    const token = this.requireAccessToken();
    return baseGetHandler(
      this.baseUrl,
      "/api/history/get",
      token,
      historyGetSchemas.response,
    )();
  };
}

function createHttpServerClient(baseUrl: string) {
  return new HttpServerBaseClient(baseUrl);
}

export default createHttpServerClient;

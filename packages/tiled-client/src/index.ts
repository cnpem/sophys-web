import { z } from "zod";

class TiledClient {
  constructor({ baseUrl, apiKey }: { baseUrl: string; apiKey: string }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private baseUrl: string;
  private apiKey: string;

  async getMetadata() {
    // pass
  }

  async getContainer() {
    // pass
  }

  async getTable() {
    // pass
  }
}

import { KomodoApiError } from "./errors.js";
import { Types } from "komodo_client";
import type { ReadResponses, WriteResponses, ExecuteResponses } from "komodo_client";

type ReadRequest = Types.ReadRequest;
type WriteRequest = Types.WriteRequest;
type ExecuteRequest = Types.ExecuteRequest;
type Update = Types.Update;

type Route = "read" | "write" | "execute";

export class KomodoClient {
  private baseUrl: string;
  private username: string;
  private password: string;
  private apiKey: string | null = null;
  private apiSecret: string | null = null;
  private token: string | null = null;
  private useApiKey: boolean;

  constructor() {
    this.baseUrl =
      process.env.KOMODO_BASE_URL || process.env.KOMODO_URL || "http://10.10.2.114:9120";
    this.username = process.env.KOMODO_USERNAME || process.env.KOMODO_INIT_ADMIN_USERNAME || "";
    this.password = process.env.KOMODO_PASSWORD || process.env.KOMODO_INIT_ADMIN_PASSWORD || "";
    this.apiKey = process.env.KOMODO_API_KEY || null;
    this.apiSecret = process.env.KOMODO_API_SECRET || null;
    this.useApiKey = !!(this.apiKey && this.apiSecret);
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    if (this.useApiKey) {
      return {
        "X-Api-Key": this.apiKey!,
        "X-Api-Secret": this.apiSecret!,
      };
    }
    await this.ensureAuth();
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }

  private async ensureAuth(): Promise<void> {
    if (this.useApiKey) return;
    if (this.token) return;
    await this.login();
  }

  private async login(): Promise<void> {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "LoginLocalUser",
        params: {
          username: this.username,
          password: this.password,
        },
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Komodo login failed (${res.status}): ${text}`);
    }
    const body = (await res.json()) as { data?: { jwt?: string } };
    const jwt = body?.data?.jwt;
    if (!jwt) {
      throw new Error(`Komodo login succeeded but no data.jwt in response`);
    }
    this.token = jwt;
  }

  private async rawRpc(
    route: Route,
    requestName: string,
    params: Record<string, unknown> = {},
  ): Promise<unknown> {
    await this.ensureAuth();

    const url = `${this.baseUrl}/${route}/${requestName}`;

    const attempt = async (
      authHeaders: Record<string, string>,
    ): Promise<Response> => {
      return fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(30000),
      });
    };

    const authHeaders = await this.getAuthHeaders();
    let res = await attempt(authHeaders);

    if (res.status === 401 && !this.useApiKey) {
      this.token = null;
      await this.login();
      res = await attempt({ Authorization: `Bearer ${this.token}` });
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let message = `Komodo RPC ${route}/${requestName} failed (${res.status}): ${text}`;
      try {
        const body = JSON.parse(text) as {
          error?: string;
          trace?: unknown[];
        };
        if (body.error) {
          message = `Komodo RPC ${route}/${requestName} failed (${res.status}): ${body.error}`;
        }
      } catch {
        // Not JSON, use raw text
      }
      throw new KomodoApiError(message, res.status, route, requestName);
    }

    const text = await res.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  async rpc(
    route: "read",
    requestName: string,
    params?: Record<string, unknown>,
  ): Promise<ReadResponses[ReadRequest["type"]]>;
  async rpc(
    route: "write",
    requestName: string,
    params?: Record<string, unknown>,
  ): Promise<WriteResponses[WriteRequest["type"]]>;
  async rpc(
    route: "execute",
    requestName: string,
    params?: Record<string, unknown>,
  ): Promise<ExecuteResponses[ExecuteRequest["type"]]>;
  async rpc(
    route: Route,
    requestName: string,
    params?: Record<string, unknown>,
  ): Promise<unknown>;
  async rpc(
    route: Route,
    requestName: string,
    params: Record<string, unknown> = {},
  ): Promise<unknown> {
    return this.rawRpc(route, requestName, params);
  }

  async executeAndPoll(
    requestName: ExecuteRequest["type"],
    params: Record<string, unknown> = {},
    opts: { pollIntervalMs?: number; timeoutMs?: number } = {},
  ): Promise<Update> {
    const { pollIntervalMs = 1000, timeoutMs = 300_000 } = opts;

    const result = await this.rawRpc("execute", requestName, params);

    if (Array.isArray(result)) {
      const first = (result as Record<string, unknown>[])[0];
      if (first && first.status === "Err") {
        throw new Error(`Batch execute failed: ${JSON.stringify(first.data)}`);
      }
      const update = result[0] as unknown as Update;
      if (update.status === "Complete" || !update._id?.$oid) {
        return update;
      }
      return this.pollUntilComplete(update._id.$oid, pollIntervalMs, timeoutMs);
    }

    const update = result as unknown as Update;
    if (update.status === "Complete" || !update._id?.$oid) {
      return update;
    }
    return this.pollUntilComplete(update._id.$oid, pollIntervalMs, timeoutMs);
  }

  private async pollUntilComplete(
    updateId: string,
    intervalMs: number,
    timeoutMs: number,
  ): Promise<Update> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, intervalMs));
      const update = (await this.rawRpc("read", "GetUpdate", {
        id: updateId,
      })) as Update;
      if (update.status === "Complete") {
        return update;
      }
    }
    throw new Error(
      `Timed out polling update ${updateId} after ${timeoutMs}ms`,
    );
  }
}

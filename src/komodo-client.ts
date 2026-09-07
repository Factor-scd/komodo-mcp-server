import { KomodoApiError } from "./errors.js";

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
    this.username = process.env.KOMODO_USERNAME || "";
    this.password = process.env.KOMODO_PASSWORD || "";
    this.apiKey = process.env.KOMODO_API_KEY || null;
    this.apiSecret = process.env.KOMODO_API_SECRET || null;
    this.useApiKey = !!(this.apiKey && this.apiSecret);
  }

  /**
   * Returns the appropriate auth headers based on the configured auth method.
   * API key auth (X-Api-Key / X-Api-Secret) is preferred when credentials are set;
   * otherwise falls back to JWT Bearer token.
   */
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
    if (this.useApiKey) return; // No login needed for API key auth
    if (this.token) return;
    await this.login();
  }

  private async login(): Promise<void> {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: this.username,
        password: this.password,
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Komodo login failed (${res.status}): ${text}`);
    }
    this.token = await res.text();
  }

  async rpc(
    route: "read" | "write" | "execute",
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

    // Auto-refresh on 401 (JWT only)
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
}

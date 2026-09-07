export class KomodoClient {
  private baseUrl: string;
  private username: string;
  private password: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = process.env.KOMODO_BASE_URL || process.env.KOMODO_URL || "http://10.10.2.114:9120";
    this.username = process.env.KOMODO_USERNAME || "";
    this.password = process.env.KOMODO_PASSWORD || "";
  }

  private async ensureAuth(): Promise<void> {
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

    const attempt = async (token: string): Promise<Response> => {
      return fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(params),
      });
    };

    let res = await attempt(this.token!);

    // Auto-refresh on 401
    if (res.status === 401) {
      this.token = null;
      await this.login();
      res = await attempt(this.token!);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Komodo RPC ${route}/${requestName} failed (${res.status}): ${text}`,
      );
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

import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";

const UpdateMode = z.enum(["get", "list"]);

export const updatesInputSchema = {
  mode: UpdateMode.describe(
    "get: retrieve a specific update by ID (returns full execution logs). list: list recent updates (returns summary of recent operations)."
  ),
  id: z.string().optional().describe("Update ID (required for get mode). The update ID from a previous list or execute operation."),
  page: z.number().optional().describe("Page number for list mode (0 = most recent, default). Use next_page from response to paginate."),
};

interface UpdateLog {
  stage?: string;
  command?: string;
  stdout?: string;
  stderr?: string;
  success?: boolean;
  start_ts?: number;
  end_ts?: number;
}

interface Update {
  _id?: { $oid: string };
  operation?: string;
  start_ts?: number;
  success?: boolean;
  operator?: string;
  target?: { type: string; id: string };
  logs?: UpdateLog[];
  end_ts?: number;
  status?: string;
  version?: { major: number; minor: number; patch: number };
  commit_hash?: string;
}

function formatUpdate(update: Update): string {
  const lines: string[] = [];
  const id = update._id?.$oid ?? "unknown";
  lines.push(`Update: ${id}`);
  lines.push(`Operation: ${update.operation ?? "unknown"}`);
  lines.push(`Status: ${update.status ?? "unknown"}`);
  lines.push(`Success: ${update.success ?? "unknown"}`);
  lines.push(`Operator: ${update.operator ?? "unknown"}`);
  if (update.target) lines.push(`Target: ${update.target.type} (${update.target.id})`);
  if (update.start_ts) lines.push(`Started: ${new Date(update.start_ts).toISOString()}`);
  if (update.end_ts) lines.push(`Ended: ${new Date(update.end_ts).toISOString()}`);
  if (update.version) lines.push(`Version: ${update.version.major}.${update.version.minor}.${update.version.patch}`);
  if (update.commit_hash) lines.push(`Commit: ${update.commit_hash}`);

  if (update.logs && update.logs.length > 0) {
    lines.push(`\n--- Logs (${update.logs.length} stages) ---`);
    for (const log of update.logs) {
      lines.push(`\n[${log.stage ?? "unknown"}] ${log.success ? "OK" : "FAILED"}`);
      if (log.command) lines.push(`Command: ${log.command}`);
      if (log.start_ts) lines.push(`Start: ${new Date(log.start_ts).toISOString()}`);
      if (log.end_ts) lines.push(`End: ${new Date(log.end_ts).toISOString()}`);
      if (log.stdout) lines.push(`stdout:\n${log.stdout}`);
      if (log.stderr) lines.push(`stderr:\n${log.stderr}`);
    }
  } else {
    lines.push("\nNo logs available.");
  }

  return lines.join("\n");
}

export async function handleUpdates(
  args: {
    mode: z.infer<typeof UpdateMode>;
    id?: string;
    page?: number;
  },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { mode, id, page } = args;

  if (mode === "get") {
    if (!id) throw new Error(`get mode requires an id (update ID)`);
    const result = await client.rpc("read", "GetUpdate", { id });
    return {
      content: [{ type: "text", text: formatUpdate(result as Update) }],
    };
  }

  // list mode
  const params: Record<string, unknown> = {};
  if (page !== undefined) params.page = page;

  const result = await client.rpc("read", "ListUpdates", params) as {
    updates?: Update[];
    next_page?: number;
  };

  const lines: string[] = [];
  if (result.updates && result.updates.length > 0) {
    lines.push(`Found ${result.updates.length} updates:\n`);
    for (const u of result.updates) {
      const uId = u._id?.$oid ?? "unknown";
      const time = u.start_ts ? new Date(u.start_ts).toISOString() : "unknown";
      const target = u.target ? `${u.target.type}` : "unknown";
      lines.push(`- [${u.success ? "OK" : "FAIL"}] ${uId} | ${u.operation ?? "?"} | ${target} | ${u.operator ?? "?"} | ${time}`);
    }
    if (result.next_page !== undefined) {
      lines.push(`\nMore pages available. Use page: ${result.next_page}`);
    }
  } else {
    lines.push("No updates found.");
  }

  return {
    content: [{ type: "text", text: lines.join("\n") }],
  };
}

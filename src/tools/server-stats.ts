import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { SERVER_STATS_REQUEST_MAP } from "../types.js";

const ServerStatType = z.enum([
  "system_information",
  "system_stats",
  "historical_server_stats",
  "server_state",
  "periphery_information",
  "containers_summary",
  "version",
  "core_info",
]);

export const serverStatsInputSchema = {
  stat_type: ServerStatType.describe(
    "Server stat to retrieve: system_information (OS/CPU/hardware), system_stats (live CPU/mem/disk), historical_server_stats (timeseries), server_state (connectivity), periphery_information (agent info), containers_summary (aggregate counts), version (Core API version), core_info (Core configuration)."
  ),
  server: z.string().optional().describe("Server name or ID (required for most stats except version, core_info, containers_summary)"),
  granularity: z.string().optional().describe("Time granularity for historical_server_stats (e.g. '1-hr', '1-day'). Required for historical_server_stats."),
  page: z.number().optional().describe("Page for historical_server_stats pagination"),
};

export async function handleServerStats(
  args: {
    stat_type: z.infer<typeof ServerStatType>;
    server?: string;
    granularity?: string;
    page?: number;
  },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { stat_type, server, granularity, page } = args;

  const requestName = SERVER_STATS_REQUEST_MAP[stat_type];
  if (!requestName) {
    throw new Error(`Unknown server stat type: ${stat_type}`);
  }

  const params: Record<string, unknown> = {};

  switch (stat_type) {
    case "system_information":
    case "system_stats":
    case "server_state":
    case "periphery_information":
      if (!server) throw new Error(`${stat_type} requires a server name or ID`);
      params.server = server;
      break;
    case "historical_server_stats":
      if (!server) throw new Error(`historical_server_stats requires a server name or ID`);
      if (!granularity) throw new Error(`historical_server_stats requires a granularity (e.g. '1-hr', '1-day')`);
      params.server = server;
      params.granularity = granularity;
      if (page !== undefined) params.page = page;
      break;
    case "containers_summary":
    case "version":
    case "core_info":
      // No params needed
      break;
  }

  const result = await client.rpc("read", requestName, params);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

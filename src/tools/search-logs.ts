import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { SEARCH_LOG_REQUEST_MAP } from "../types.js";

const LogResourceType = z.enum(["container", "deployment", "stack", "swarm_service"]);

export const searchLogsInputSchema = {
  resource_type: LogResourceType.describe(
    "Resource type to search logs for (container, deployment, stack, swarm_service)"
  ),
  id: z.string().describe("Resource ID or name"),
  query: z.string().describe("Search query to filter log lines"),
  tail: z.number().optional().describe("Number of recent log lines to return"),
};

export async function handleSearchLogs(
  args: {
    resource_type: z.infer<typeof LogResourceType>;
    id: string;
    query: string;
    tail?: number;
  },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { resource_type, id, query, tail } = args;

  const requestName = SEARCH_LOG_REQUEST_MAP[resource_type];
  if (!requestName) {
    throw new Error(`No log search endpoint for resource type: ${resource_type}`);
  }

  const params: Record<string, unknown> = { id, query };
  if (tail !== undefined) params.tail = tail;

  const result = await client.rpc("read", requestName, params);

  return {
    content: [
      {
        type: "text",
        text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
      },
    ],
  };
}

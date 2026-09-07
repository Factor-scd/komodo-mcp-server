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
  server: z
    .string()
    .optional()
    .describe("Server name (required for container logs)"),
  swarm: z
    .string()
    .optional()
    .describe("Swarm name (required for swarm_service logs)"),
  services: z
    .array(z.string())
    .optional()
    .describe("Service names (required for stack logs)"),
};

export async function handleSearchLogs(
  args: {
    resource_type: z.infer<typeof LogResourceType>;
    id: string;
    query: string;
    tail?: number;
    server?: string;
    swarm?: string;
    services?: string[];
  },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { resource_type, id, query, tail, server, swarm, services } = args;

  const requestName = SEARCH_LOG_REQUEST_MAP[resource_type];
  if (!requestName) {
    throw new Error(`No log search endpoint for resource type: ${resource_type}`);
  }

  // Core log search shapes are not uniform per docs.rs:
  // - deployment: {deployment, terms, tail?}
  // - container:  {server, container, terms, tail?}
  // - stack:      {stack, services, terms, tail?}
  // - swarm_service: {swarm, service, terms, tail?}
  const params: Record<string, unknown> = { terms: [query] };
  if (tail !== undefined) params.tail = tail;

  switch (resource_type) {
    case "deployment":
      params.deployment = id;
      break;
    case "container":
      params.server = server;
      params.container = id;
      break;
    case "stack":
      params.stack = id;
      params.services = services;
      break;
    case "swarm_service":
      params.swarm = swarm;
      params.service = id;
      break;
  }

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

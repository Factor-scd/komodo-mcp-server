import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { RESOURCE_STATS_REQUEST_MAP, ACTION_STATE_REQUEST_MAP } from "../types.js";

const ResourceStatType = z.enum([
  "deployment_stats",
  "deployment_container",
  "build_monthly_stats",
  "action_state",
  "concurrency_limit_usage",
  "resource_matching_container",
]);

const ActionStateResourceType = z.enum([
  "action", "build", "deployment", "procedure",
  "repo", "server", "stack", "swarm", "sync_resource",
]);

export const resourceStatsInputSchema = {
  stat_type: ResourceStatType.describe(
    "Resource stat to retrieve: deployment_stats (CPU/mem/net usage), deployment_container (container details), build_monthly_stats (build frequency), action_state (is resource currently running), concurrency_limit_usage (active limits), resource_matching_container (reverse-lookup container → resource)."
  ),
  id: z.string().optional().describe("Resource ID or name (required for deployment_stats, deployment_container, build_monthly_stats, action_state)"),
  resource_type: ActionStateResourceType.optional().describe("Resource type for action_state (e.g. 'stack', 'deployment', 'build'). Required when stat_type is 'action_state'."),
  server: z.string().optional().describe("Server name (required for resource_matching_container)"),
  container: z.string().optional().describe("Container name (required for resource_matching_container)"),
};

export async function handleResourceStats(
  args: {
    stat_type: z.infer<typeof ResourceStatType>;
    id?: string;
    resource_type?: z.infer<typeof ActionStateResourceType>;
    server?: string;
    container?: string;
  },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { stat_type, id, resource_type, server, container } = args;

  // Handle action_state separately — it dispatches to different endpoints per resource type
  if (stat_type === "action_state") {
    if (!resource_type) throw new Error(`action_state requires a resource_type (e.g. 'stack', 'deployment', 'build')`);
    if (!id) throw new Error(`action_state requires an id`);

    const requestName = ACTION_STATE_REQUEST_MAP[resource_type];
    if (!requestName) {
      throw new Error(`No action state endpoint for resource type: ${resource_type}`);
    }

    // The param key matches the resource type for most, but sync_resource uses "resource_sync"
    const paramKey = resource_type === "sync_resource" ? "resource_sync" : resource_type;
    const params: Record<string, unknown> = { [paramKey]: id };

    const result = await client.rpc("read", requestName, params);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }

  const requestName = RESOURCE_STATS_REQUEST_MAP[stat_type];
  if (!requestName) {
    throw new Error(`Unknown resource stat type: ${stat_type}`);
  }

  const params: Record<string, unknown> = {};

  switch (stat_type) {
    case "deployment_stats":
    case "deployment_container":
      if (!id) throw new Error(`${stat_type} requires an id (deployment name or ID)`);
      params.deployment = id;
      break;
    case "build_monthly_stats":
      if (!id) throw new Error(`${stat_type} requires an id (build name or ID)`);
      params.build = id;
      break;
    case "concurrency_limit_usage":
      // No params needed
      break;
    case "resource_matching_container":
      if (!server) throw new Error(`resource_matching_container requires a server`);
      if (!container) throw new Error(`resource_matching_container requires a container name`);
      params.server = server;
      params.container = container;
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

import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { LIST_DETAIL_REQUEST_MAP } from "../types.js";

const listDetailType = z.enum([
  "containers", "all_containers", "images", "networks", "volumes",
  "system_processes", "schedules", "permissions", "api_keys",
  "api_keys_for_service_user", "onboarding_keys", "secrets", "updates",
  "build_versions", "compose_projects", "user_target_permissions",
  "full_stacks", "full_builds", "full_servers", "full_deployments",
  "full_procedures", "full_repos", "full_builders", "full_swarms",
  "full_actions", "full_alerters", "full_resource_syncs",
  // Swarm detail lists
  "swarm_configs", "swarm_networks", "swarm_nodes", "swarm_secrets",
  "swarm_services", "swarm_stacks", "swarm_tasks",
  // Config lists
  "git_providers_from_config", "image_registries_from_config",
  // Extra args
  "common_build_extra_args", "common_deployment_extra_args",
  "common_stack_build_extra_args", "common_stack_extra_args",
  // Other
  "image_history", "all_stack_services",
]);

export const listDetailInputSchema = {
  list_type: listDetailType.describe(
    "What to list (containers, images, networks, volumes, full_stacks, full_builds, etc.)"
  ),
  server: z.string().optional().describe("Server name (required for container/image/network/volume listings)"),
  pattern: z.string().optional().describe("Filter pattern (for batch operations)"),
};

export async function handleListDetail(
  args: {
    list_type: z.infer<typeof listDetailType>;
    server?: string;
    pattern?: string;
  },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { list_type, server, pattern } = args;

  const requestName = LIST_DETAIL_REQUEST_MAP[list_type];
  if (!requestName) {
    throw new Error(`Unknown list detail type: ${list_type}`);
  }

  const params: Record<string, unknown> = {};
  if (server) params.server = server;
  if (pattern) params.pattern = pattern;

  const result = await client.rpc("read", requestName, params);

  const items = Array.isArray(result) ? result : [result];

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(items, null, 2),
      },
    ],
  };
}

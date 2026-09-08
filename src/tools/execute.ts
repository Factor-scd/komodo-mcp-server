import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { ExecuteOperation, EXECUTE_REQUEST_MAP } from "../types.js";

export const executeInputSchema = {
  operation: ExecuteOperation.describe(
    "Execute operation (run_build, deploy_stack, deploy_stack_service, deploy, deploy_stack_if_changed, destroy_stack, destroy_container, destroy_deployment, pull_stack, pull_deployment, build_repo, clone_repo, pull_repo, cancel_repo_build, clear_repo_cache, run_procedure, run_action, run_sync, cancel_action, cancel_build, cancel_procedure, start_stack, stop_stack, restart_stack, pause_stack, unpause_stack, start_container, stop_container, restart_container, pause_container, unpause_container, start_all_containers, stop_all_containers, restart_all_containers, pause_all_containers, unpause_all_containers, start_deployment, stop_deployment, restart_deployment, pause_deployment, unpause_deployment, run_server_refresh_containers, run_server_prune_images, run_server_prune_containers, run_server_prune_networks, run_server_run_command, run_server_scripts, run_server_copy, run_server_move, rotate_all_server_keys, prune_buildx, prune_docker_builders, prune_system, prune_volumes, delete_image, delete_network, delete_volume, remove_swarm_nodes, remove_swarm_services, remove_swarm_configs, remove_swarm_secrets, remove_swarm_stacks, create_swarm_config, create_swarm_secret, rotate_swarm_config, rotate_swarm_secret, update_swarm_node, batch_run_build, batch_deploy_stack, batch_deploy_stack_if_changed, batch_deploy, batch_pull_stack, batch_pull_repo, batch_build_repo, batch_clone_repo, batch_run_procedure, batch_run_action, batch_destroy_deployment, batch_destroy_stack, backup_core_database, rotate_core_keys, global_auto_update, send_alert, test_alerter)",
  ),
  id: z.string().optional().describe("Resource ID or name for the operation"),
  params: z
    .record(z.string(), z.unknown())
    .optional()
    .describe("Additional parameters for the operation"),
};

export async function handleExecute(
  args: {
    operation: z.infer<typeof ExecuteOperation>;
    id?: string;
    params?: Record<string, unknown>;
  },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { operation, id, params } = args;

  const mapping = EXECUTE_REQUEST_MAP[operation];
  if (!mapping) {
    throw new Error(`Unknown execute operation: ${operation}`);
  }

  const requestParams: Record<string, unknown> = { ...params };
  if (id) requestParams.id = id;

  const result = await client.rpc(mapping.route, mapping.name, requestParams);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

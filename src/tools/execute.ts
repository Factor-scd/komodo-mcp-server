import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { ExecuteOperation, EXECUTE_REQUEST_MAP } from "../types.js";

export const executeInputSchema = {
  operation: ExecuteOperation.describe(
    "Execute operation (run_build, deploy_stack, deploy_stack_service, run_procedure, run_procedure_stage, run_deployment_action, run_deployment_sync, run_resource_sync, run_stack_refresh_cache, run_stack_refresh_content, run_stack_pull, run_stack_pull_deployment, run_stack_stop, run_stack_restart, run_stack_pause, run_stack_unpause, run_stack_remove_orphan_containers, run_stack_toggle_service_dependencies, run_stack_auto_update, run_stack_commit, run_server_refresh, run_server_refresh_containers, run_server_update_periphery, run_server_prune_images, run_server_prune_containers, run_server_prune_networks, run_server_stats, run_server_run_command, run_server_scripts, run_server_copy, run_server_move, run_deployment_execute, run_deployment_redeploy, run_deployment_destroy, run_deployment_stop, run_deployment_logs, run_sync_deployment, get_mcp_token)",
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

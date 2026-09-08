import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { ExecuteOperation, EXECUTE_REQUEST_MAP } from "../types.js";

// Maps each operation to the Komodo API param key for the id field.
// Most operations use their entity type as the key (e.g. "stack", "build").
const OPERATION_PARAM_KEY: Record<string, string> = {
  // Build
  run_build: "build",
  cancel_build: "build",
  // Stack
  deploy_stack: "stack",
  deploy_stack_service: "stack",
  deploy_stack_if_changed: "stack",
  destroy_stack: "stack",
  pull_stack: "stack",
  start_stack: "stack",
  stop_stack: "stack",
  restart_stack: "stack",
  pause_stack: "stack",
  unpause_stack: "stack",
  // Deployment
  deploy: "deployment",
  destroy_deployment: "deployment",
  pull_deployment: "deployment",
  start_deployment: "deployment",
  stop_deployment: "deployment",
  restart_deployment: "deployment",
  pause_deployment: "deployment",
  unpause_deployment: "deployment",
  // Repo
  build_repo: "repo",
  clone_repo: "repo",
  pull_repo: "repo",
  cancel_repo_build: "repo",
  clear_repo_cache: "repo",
  // Procedure & Action
  run_procedure: "procedure",
  cancel_procedure: "procedure",
  run_action: "action",
  cancel_action: "action",
  run_sync: "sync",
  // Container (need both container + server)
  start_container: "container",
  stop_container: "container",
  restart_container: "container",
  pause_container: "container",
  unpause_container: "container",
  destroy_container: "container",
  // Server-scoped (prune, delete, rotate, etc.)
  run_server_prune_images: "server",
  run_server_prune_containers: "server",
  run_server_prune_networks: "server",
  rotate_all_server_keys: "server",
  prune_buildx: "server",
  prune_docker_builders: "server",
  prune_system: "server",
  prune_volumes: "server",
  delete_image: "server",
  delete_network: "server",
  delete_volume: "server",
  // Batch ops — use "ids" array, not single id
  batch_run_build: "ids",
  batch_deploy_stack: "ids",
  batch_deploy_stack_if_changed: "ids",
  batch_deploy: "ids",
  batch_pull_stack: "ids",
  batch_pull_repo: "ids",
  batch_build_repo: "ids",
  batch_clone_repo: "ids",
  batch_run_procedure: "ids",
  batch_run_action: "ids",
  batch_destroy_deployment: "ids",
  batch_destroy_stack: "ids",
  // Admin
  backup_core_database: "_none",
  rotate_core_keys: "_none",
  global_auto_update: "_none",
  send_alert: "alert",
  test_alerter: "alerter",
};

// Operations that need {server: <value>} alongside the entity param
const NEEDS_SERVER_PARAM = new Set([
  "start_container", "stop_container", "restart_container",
  "pause_container", "unpause_container", "destroy_container",
  "start_all_containers", "stop_all_containers", "restart_all_containers",
  "pause_all_containers", "unpause_all_containers",
]);

export const executeInputSchema = {
  operation: ExecuteOperation.describe(
    "Execute operation. Pass the resource name/id in the id field. Server-scoped ops (prune_*, delete_*) require the server name. Batch ops ignore id.",
  ),
  id: z.string().optional().describe("Resource ID, name, or server name (depends on operation)"),
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
  const paramKey = OPERATION_PARAM_KEY[operation];

  if (id && paramKey && paramKey !== "_none" && paramKey !== "ids") {
    requestParams[paramKey] = id;
    // Container ops also need server in params
    if (NEEDS_SERVER_PARAM.has(operation) && params?.server) {
      requestParams.server = params.server;
    }
  }

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

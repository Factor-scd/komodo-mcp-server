import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { ExecuteOperation, EXECUTE_REQUEST_MAP } from "../types.js";

// Operations that need {server: <value>} instead of {id: <value>}
const SERVER_SCOPED_OPS = new Set([
  "run_server_prune_images",
  "run_server_prune_containers",
  "run_server_prune_networks",
  "rotate_all_server_keys",
  "prune_buildx",
  "prune_docker_builders",
  "prune_system",
  "prune_volumes",
  "delete_image",
  "delete_network",
  "delete_volume",
]);

export const executeInputSchema = {
  operation: ExecuteOperation.describe(
    "Execute operation. Server-scoped ops (prune_*, delete_*) require the server name in the id field. RunSync requires the sync name/id in the id field.",
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
  if (id) {
    if (SERVER_SCOPED_OPS.has(operation)) {
      requestParams.server = id;
    } else if (operation === "run_sync") {
      requestParams.sync = id;
    } else {
      requestParams.id = id;
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

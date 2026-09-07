import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { INSPECT_REQUEST_MAP, INSPECT_PARAM_KEY } from "../types.js";

const InspectType = z.enum([
  "container", "image", "network", "volume",
  "deployment_container", "deployment_swarm_service",
  "stack_container", "stack_swarm_info", "stack_swarm_service",
  "swarm", "swarm_config", "swarm_node", "swarm_secret",
  "swarm_service", "swarm_stack", "swarm_task",
]);

export const inspectInputSchema = {
  inspect_type: InspectType.describe(
    "Type of Docker object to inspect (container, image, network, volume, deployment_container, swarm, swarm_node, etc.)"
  ),
  id: z.string().describe("ID or name of the object to inspect"),
  server: z.string().optional().describe("Server name (required for server-scoped inspections)"),
};

export async function handleInspect(
  args: {
    inspect_type: z.infer<typeof InspectType>;
    id: string;
    server?: string;
  },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { inspect_type, id, server } = args;

  const requestName = INSPECT_REQUEST_MAP[inspect_type];
  if (!requestName) {
    throw new Error(`Unknown inspect type: ${inspect_type}`);
  }

  const params: Record<string, unknown> = {};
  const paramKey = server ? INSPECT_PARAM_KEY[inspect_type] : undefined;
  if (paramKey) {
    // Server-scoped Docker objects: {server, <container|image|network|volume>}
    params.server = server;
    params[paramKey] = id;
  } else {
    params.id = id;
    if (server) params.server = server;
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

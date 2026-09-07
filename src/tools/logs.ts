import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";

const LogResourceType = z.enum(["deployment", "stack", "container", "swarm_service"]);

export const logsInputSchema = {
  resource_type: LogResourceType.describe(
    "Resource type to get logs for (deployment, stack, container, swarm_service)"
  ),
  id: z.string().describe("Resource ID or name"),
  tail: z
    .number()
    .optional()
    .describe("Number of recent log lines to return"),
};

export async function handleLogs(
  args: {
    resource_type: z.infer<typeof LogResourceType>;
    id: string;
    tail?: number;
  },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { resource_type, id, tail } = args;

  const params: Record<string, unknown> = { id };
  if (tail !== undefined) params.tail = tail;

  let result: unknown;

  switch (resource_type) {
    case "deployment":
      result = await client.rpc("read", "GetDeploymentLog", params);
      break;
    case "stack":
      result = await client.rpc("read", "GetStackLog", params);
      break;
    case "container":
      result = await client.rpc("read", "GetContainerLog", params);
      break;
    case "swarm_service":
      result = await client.rpc("read", "GetSwarmServiceLog", params);
      break;
  }

  return {
    content: [
      {
        type: "text",
        text:
          typeof result === "string"
            ? result
            : JSON.stringify(result, null, 2),
      },
    ],
  };
}

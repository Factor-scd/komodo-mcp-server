import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";

const LogResourceType = z.enum(["deployment", "stack", "container", "swarm_service"]);

export const logsInputSchema = {
  resource_type: LogResourceType.describe(
    "Resource type to get logs for (deployment, stack, container, swarm_service). Returns log lines as text."
  ),
  id: z.string().describe("Resource ID or name"),
  tail: z
    .number()
    .optional()
    .describe("Number of recent log lines to return"),
  server: z
    .string()
    .optional()
    .describe("Server name (required for container logs)"),
  services: z
    .array(z.string())
    .optional()
    .describe("Service names to include (required for stack logs)"),
};

export async function handleLogs(
  args: {
    resource_type: z.infer<typeof LogResourceType>;
    id: string;
    tail?: number;
    server?: string;
    services?: string[];
  },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { resource_type, id, tail, server, services } = args;

  let result: unknown;

  switch (resource_type) {
    case "deployment": {
      const params: Record<string, unknown> = { id };
      if (tail !== undefined) params.tail = tail;
      result = await client.rpc("read", "GetDeploymentLog", params);
      break;
    }
    case "stack": {
      const params: Record<string, unknown> = { id, services: services ?? [] };
      if (tail !== undefined) params.tail = tail;
      result = await client.rpc("read", "GetStackLog", params);
      break;
    }
    case "container": {
      const params: Record<string, unknown> = { server, container: id };
      if (tail !== undefined) params.tail = tail;
      result = await client.rpc("read", "GetContainerLog", params);
      break;
    }
    case "swarm_service": {
      const params: Record<string, unknown> = { id };
      if (tail !== undefined) params.tail = tail;
      result = await client.rpc("read", "GetSwarmServiceLog", params);
      break;
    }
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

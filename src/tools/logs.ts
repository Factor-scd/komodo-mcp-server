import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";

const LogResourceType = z.enum(["deployment", "stack", "container", "swarm_service", "build"]);

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
    case "build": {
      const build = (await client.rpc("read", "GetBuild", { id })) as Record<string, unknown>;
      const info = build?.info as Record<string, unknown> | undefined;
      const config = build?.config as Record<string, unknown> | undefined;
      const lines: string[] = [];
      lines.push(`Build: ${build?.name ?? id}`);
      if (config?.repo) lines.push(`Repo: ${config.repo}`);
      if (config?.branch) lines.push(`Branch: ${config.branch}`);
      if (info?.last_built_at) lines.push(`Last built: ${new Date(info.last_built_at as number).toISOString()}`);
      if (info?.built_hash) lines.push(`Built hash: ${info.built_hash}`);
      if (info?.latest_hash) lines.push(`Latest hash: ${info.latest_hash}`);
      if (info?.built_message) lines.push(`Built message: ${info.built_message}`);
      if (info?.latest_message) lines.push(`Latest message: ${info.latest_message}`);
      if (info?.remote_error) lines.push(`Remote error: ${info.remote_error}`);
      if (info?.built_contents) lines.push(`--- Built Dockerfile ---\n${info.built_contents}`);
      if (info?.remote_contents) lines.push(`--- Remote Dockerfile ---\n${info.remote_contents}`);
      result = lines.join("\n");
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

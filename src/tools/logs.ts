import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";

const LogResourceType = z.enum(["deployment", "stack", "container", "swarm_service", "build"]);

export const logsInputSchema = {
  resource_type: LogResourceType.describe(
    "Resource type to get logs for (deployment, stack, container, swarm_service, build). Build resolves the builder container and fetches real logs. Returns log lines as text."
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
      const buildName = (build?.name as string) ?? id;

      // Try to resolve the builder and fetch real container logs
      const builderId = config?.builder_id as string | undefined;
      if (builderId) {
        try {
          const builder = (await client.rpc("read", "GetBuilder", { builder: builderId })) as Record<string, unknown>;
          const builderConfig = builder?.config as Record<string, unknown> | undefined;
          const builderName = (builder?.name as string) ?? builderId;
          const builderType = builderConfig?.type as string | undefined;

          let serverName: string | undefined;

          if (builderType === "Server" && builderConfig?.params) {
            const params = builderConfig.params as Record<string, unknown>;
            const serverIds = params.server_ids as string[] | undefined;
            if (serverIds && serverIds.length > 0) {
              // Resolve first server_id to server name
              try {
                const servers = (await client.rpc("read", "ListServers", {})) as Array<Record<string, unknown>>;
                const targetId = serverIds[0];
                const server = servers.find((s) => {
                  const id = s._id as Record<string, unknown> | undefined;
                  return id?.$oid === targetId || s.name === targetId;
                });
                if (server) serverName = server.name as string;
              } catch { /* server lookup failed, try without */ }
            }
          } else if (builderType === "Url" && builderConfig?.params) {
            const params = builderConfig.params as Record<string, unknown>;
            // Url builder uses a Periphery address directly — use it as server reference
            serverName = params.address as string | undefined;
          }

          if (serverName) {
            const logParams: Record<string, unknown> = {
              server: serverName,
              container: builderName,
            };
            if (tail !== undefined) logParams.tail = tail;
            result = await client.rpc("read", "GetContainerLog", logParams);
            break;
          }
        } catch {
          // Builder lookup or container log fetch failed — fall through to build info
        }
      }

      // Fallback: return build resource info (limited on failure)
      const lines: string[] = [];
      lines.push(`Build: ${buildName}`);
      if (config?.repo) lines.push(`Repo: ${config.repo}`);
      if (config?.branch) lines.push(`Branch: ${config.branch}`);
      if (builderId) lines.push(`Builder: ${builderId}`);
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

import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { ResourceType } from "../types.js";
import { detectResource } from "../resource-detect.js";

export const resourceLogsInputSchema = {
  resource: z
    .string()
    .describe("Name or ID of the resource to get logs for"),
  type: ResourceType.optional().describe(
    "Resource type hint to skip auto-detection (e.g. 'stack', 'deployment', 'container'). If omitted, auto-detects by trying all types."
  ),
  tail: z
    .number()
    .optional()
    .describe("Number of recent log lines to return"),
  services: z
    .array(z.string())
    .optional()
    .describe("Service names to include (used for stack logs)"),
};

/** Map resource type → log request name */
const LOG_REQUEST: Record<string, string> = {
  deployment: "GetDeploymentLog",
  stack: "GetStackLog",
};

export async function handleResourceLogs(
  args: {
    resource: string;
    type?: z.infer<typeof ResourceType>;
    tail?: number;
    services?: string[];
  },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { resource, type, tail, services } = args;

  // Handle container type directly (not a Komodo resource — needs server name)
  if (type === "container" as string) {
    return fetchContainerLogs(client, resource, tail);
  }

  // Auto-detect the resource
  const detected = await detectResource(client, resource, type);
  if (!detected) {
    return {
      content: [{
        type: "text",
        text: `Resource not found: "${resource}". Try a different name or ID, or specify the type parameter.`,
      }],
    };
  }

  const { type: resType, resource: res } = detected;
  const name = (res.name as string) ?? resource;

  // Get logs based on resource type
  const logRequest = LOG_REQUEST[resType];

  if (resType === "build") {
    // Build logs need special handling: resolve builder container
    return fetchBuildLogs(client, res, tail);
  }

  if (!logRequest) {
    return {
      content: [{
        type: "text",
        text: `Logs not available for resource type "${resType}" (${name}). Use komodo_get to view the resource details.`,
      }],
    };
  }

  // Build params based on resource type
  const params: Record<string, unknown> = {};

  switch (resType as string) {
    case "deployment":
      params.id = name;
      break;
    case "stack":
      params.id = name;
      params.services = services ?? [];
      break;
  }

  if (tail !== undefined) params.tail = tail;

  try {
    const result = await client.rpc("read", logRequest, params);
    return {
      content: [{
        type: "text",
        text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
      }],
    };
  } catch (err) {
    return {
      content: [{
        type: "text",
        text: `Failed to fetch logs for ${resType} "${name}": ${err instanceof Error ? err.message : err}`,
      }],
    };
  }
}

async function fetchContainerLogs(
  client: KomodoClient,
  container: string,
  tail?: number,
): Promise<{ content: { type: "text"; text: string }[] }> {
  // Container requires server name — try to find it via resource_matching_container
  try {
    const match = (await client.rpc("read", "GetResourceMatchingContainer", {
      container,
    })) as Record<string, unknown> | null;

    if (match?.server) {
      const params: Record<string, unknown> = {
        server: match.server,
        container,
      };
      if (tail !== undefined) params.tail = tail;
      const result = await client.rpc("read", "GetContainerLog", params);
      return {
        content: [{
          type: "text",
          text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
        }],
      };
    }
  } catch {
    // Fall through
  }

  return {
    content: [{
      type: "text",
      text: `Cannot fetch logs for container "${container}": server name is required. Use komodo_logs with resource_type="container" and provide the server parameter.`,
    }],
  };
}

async function fetchBuildLogs(
  client: KomodoClient,
  build: Record<string, unknown>,
  tail?: number,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const config = build?.config as Record<string, unknown> | undefined;
  const info = build?.info as Record<string, unknown> | undefined;
  const buildName = (build?.name as string) ?? "unknown";
  const builderId = config?.builder_id as string | undefined;

  if (!builderId) {
    return {
      content: [{
        type: "text",
        text: `Build "${buildName}" has no builder configured.`,
      }],
    };
  }

  try {
    const builder = (await client.rpc("read", "GetBuilder", {
      builder: builderId,
    })) as Record<string, unknown>;
    const builderConfig = builder?.config as Record<string, unknown> | undefined;
    const builderName = (builder?.name as string) ?? builderId;
    const builderType = builderConfig?.type as string | undefined;

    let serverName: string | undefined;

    if (builderType === "Server" && builderConfig?.params) {
      const params = builderConfig.params as Record<string, unknown>;
      const serverIds = params.server_ids as string[] | undefined;
      if (serverIds && serverIds.length > 0) {
        const servers = (await client.rpc("read", "ListServers", {})) as Array<Record<string, unknown>>;
        const targetId = serverIds[0];
        const server = servers.find((s) => {
          const id = s._id as Record<string, unknown> | undefined;
          return id?.$oid === targetId || s.name === targetId;
        });
        if (server) serverName = server.name as string;
      }
    } else if (builderType === "Url" && builderConfig?.params) {
      const params = builderConfig.params as Record<string, unknown>;
      serverName = params.address as string | undefined;
    }

    if (serverName) {
      const logParams: Record<string, unknown> = {
        server: serverName,
        container: builderName,
      };
      if (tail !== undefined) logParams.tail = tail;
      const result = await client.rpc("read", "GetContainerLog", logParams);
      return {
        content: [{
          type: "text",
          text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
        }],
      };
    }
  } catch {
    // Fall through to build info
  }

  // Fallback: build resource info
  const lines: string[] = [];
  lines.push(`Build: ${buildName} (builder container logs unavailable)`);
  if (config?.repo) lines.push(`Repo: ${config.repo}`);
  if (config?.branch) lines.push(`Branch: ${config.branch}`);
  if (info?.last_built_at) lines.push(`Last built: ${new Date(info.last_built_at as number).toISOString()}`);
  if (info?.built_hash) lines.push(`Built hash: ${info.built_hash}`);
  if (info?.remote_error) lines.push(`Remote error: ${info.remote_error}`);
  return {
    content: [{ type: "text", text: lines.join("\n") }],
  };
}

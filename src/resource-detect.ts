import { KomodoClient } from "./komodo-client.js";
import type { ResourceType } from "./types.js";

/**
 * Resource types we try to detect, in priority order.
 * Covers the most common agent-facing resources.
 */
const DETECT_ORDER: ResourceType[] = [
  "stack",
  "deployment",
  "build",
  "server",
  "procedure",
  "repo",
  "action",
  "alerter",
  "builder",
  "swarm",
  "sync_resource",
];

/** Map resource type → List request name (returns list items with state) */
const LIST_REQUEST: Record<string, string> = {
  stack: "ListStacks",
  deployment: "ListDeployments",
  build: "ListBuilds",
  server: "ListServers",
  procedure: "ListProcedures",
  repo: "ListRepos",
  action: "ListActions",
  alerter: "ListAlerters",
  builder: "ListBuilders",
  swarm: "ListSwarms",
  sync_resource: "ListResourceSyncs",
};

/** Map resource type → Get request name (fallback for types without state in List) */
const GET_REQUEST: Record<string, string> = {
  stack: "GetStack",
  deployment: "GetDeployment",
  build: "GetBuild",
  server: "GetServer",
  procedure: "GetProcedure",
  repo: "GetRepo",
  action: "GetAction",
  alerter: "GetAlerter",
  builder: "GetBuilder",
  swarm: "GetSwarm",
  sync_resource: "GetResourceSync",
};

/** Map resource type → param key for Get request (most use "id", some differ) */
const GET_PARAM_KEY: Record<string, string> = {
  builder: "builder",
  action: "action",
  tag: "tag",
  variable: "name",
  user_group: "user_group",
  sync_resource: "resource_sync",
};

export interface DetectionResult {
  type: ResourceType;
  resource: Record<string, unknown>;
}

/**
 * Auto-detect a resource by trying List endpoints with filter across types.
 * Returns the first match with full list-item info (including state), or null.
 */
export async function detectResource(
  client: KomodoClient,
  nameOrId: string,
  hint?: ResourceType,
): Promise<DetectionResult | null> {
  const typesToTry = hint ? [hint, ...DETECT_ORDER.filter((t) => t !== hint)] : DETECT_ORDER;

  for (const type of typesToTry) {
    // Try List with filter first — returns list items with state info
    const listRequest = LIST_REQUEST[type];
    if (listRequest) {
      try {
        const items = (await client.rpc("read", listRequest, {
          filter: nameOrId,
        })) as Array<Record<string, unknown>>;

        if (Array.isArray(items) && items.length > 0) {
          // Find exact name match
          const match = items.find((item) => {
            if (item.name === nameOrId) return true;
            const id = item._id as Record<string, unknown> | undefined;
            return id?.$oid === nameOrId;
          });
          if (match) {
            return { type, resource: match };
          }
        }
      } catch {
        // List failed — try Get fallback
      }
    }

    // Fallback: try Get endpoint
    const getRequest = GET_REQUEST[type];
    if (getRequest) {
      const paramKey = GET_PARAM_KEY[type] || "id";
      try {
        const resource = (await client.rpc("read", getRequest, {
          [paramKey]: nameOrId,
        })) as Record<string, unknown>;

        if (resource && (resource.name || resource._id)) {
          return { type, resource };
        }
      } catch {
        // Not found on this type — try next
      }
    }
  }

  return null;
}

/**
 * Format a human-readable status summary for a resource.
 */
export function formatStatus(result: DetectionResult): string {
  const { type, resource } = result;
  const name = (resource.name as string) ?? "unknown";
  const info = resource?.info as Record<string, unknown> | undefined;
  const config = resource?.config as Record<string, unknown> | undefined;

  const lines: string[] = [];
  lines.push(`Resource: ${name}`);
  lines.push(`Type: ${type}`);

  switch (type) {
    case "server": {
      const state = info?.state ?? "unknown";
      lines.push(`State: ${state}`);
      if (info?.err) lines.push(`Error: ${info.err}`);
      const stats = info?.stats as Record<string, unknown> | undefined;
      if (stats) {
        lines.push(`CPU: ${stats.cpu_perc ?? "?"}%`);
        const memUsed = stats.mem_used_gb as number | undefined;
        const memTotal = stats.mem_total_gb as number | undefined;
        if (memUsed != null && memTotal != null) {
          lines.push(`Memory: ${memUsed.toFixed(1)} / ${memTotal.toFixed(1)} GB (${((memUsed / memTotal) * 100).toFixed(0)}%)`);
        }
        const diskUsed = stats.disk_used_gb as number | undefined;
        const diskTotal = stats.disk_total_gb as number | undefined;
        if (diskUsed != null && diskTotal != null) {
          lines.push(`Disk: ${diskUsed.toFixed(1)} / ${diskTotal.toFixed(1)} GB (${((diskUsed / diskTotal) * 100).toFixed(0)}%)`);
        }
      }
      break;
    }
    case "stack": {
      const state = info?.state ?? "unknown";
      lines.push(`State: ${state}`);
      const status = info?.status as string | undefined;
      if (status) lines.push(`Status: ${status}`);
      const services = info?.services as Array<Record<string, unknown>> | undefined;
      if (services && services.length > 0) {
        lines.push(`Services (${services.length}):`);
        for (const svc of services) {
          lines.push(`  - ${svc.service ?? "?"}: ${svc.state ?? "unknown"}`);
        }
      }
      break;
    }
    case "deployment": {
      const state = info?.state ?? "unknown";
      lines.push(`State: ${state}`);
      const status = info?.status as string | undefined;
      if (status) lines.push(`Status: ${status}`);
      break;
    }
    case "build": {
      const state = info?.state ?? "unknown";
      lines.push(`State: ${state}`);
      if (info?.last_built_at) {
        lines.push(`Last built: ${new Date(info.last_built_at as number).toISOString()}`);
      }
      if (info?.built_hash) lines.push(`Built hash: ${info.built_hash}`);
      if (info?.remote_error) lines.push(`Remote error: ${info.remote_error}`);
      const builderId = config?.builder_id as string | undefined;
      if (builderId) lines.push(`Builder: ${builderId}`);
      break;
    }
    case "procedure": {
      const running = info?.running ?? false;
      lines.push(`Running: ${running}`);
      break;
    }
    case "repo": {
      const state = info?.state ?? "unknown";
      lines.push(`State: ${state}`);
      if (info?.last_built_at) {
        lines.push(`Last built: ${new Date(info.last_built_at as number).toISOString()}`);
      }
      break;
    }
    case "action": {
      const running = info?.running ?? false;
      lines.push(`Running: ${running}`);
      if (info?.last_run_at) {
        lines.push(`Last run: ${new Date(info.last_run_at as number).toISOString()}`);
      }
      break;
    }
    case "alerter": {
      const enabled = (config as Record<string, unknown>)?.enabled ?? "unknown";
      lines.push(`Enabled: ${enabled}`);
      break;
    }
    case "builder": {
      const builderType = config?.type ?? "unknown";
      lines.push(`Builder type: ${builderType}`);
      const params = config?.params as Record<string, unknown> | undefined;
      if (builderType === "Server" && params?.server_ids) {
        lines.push(`Server IDs: ${(params.server_ids as string[]).join(", ")}`);
      } else if (builderType === "Url" && params?.address) {
        lines.push(`Address: ${params.address}`);
      }
      break;
    }
    case "swarm": {
      const state = info?.state ?? "unknown";
      lines.push(`State: ${state}`);
      break;
    }
    case "sync_resource": {
      const lastStatus = info?.last_sync_status as string | undefined;
      lines.push(`Last sync status: ${lastStatus ?? "never"}`);
      if (info?.last_sync_ts) {
        lines.push(`Last sync: ${new Date(info.last_sync_ts as number).toISOString()}`);
      }
      break;
    }
    default:
      lines.push(`State: ${JSON.stringify(info?.state ?? "unknown")}`);
  }

  return lines.join("\n");
}

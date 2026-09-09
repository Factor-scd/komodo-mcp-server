import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { ResourceType } from "../types.js";
import { detectResource, formatStatus } from "../resource-detect.js";

export const statusInputSchema = {
  resource: z
    .string()
    .describe("Name or ID of the resource to check"),
  type: ResourceType.optional().describe(
    "Resource type hint to skip auto-detection (e.g. 'stack', 'build', 'server'). If omitted, auto-detects by trying all types."
  ),
};

export async function handleStatus(
  args: {
    resource: string;
    type?: z.infer<typeof ResourceType>;
  },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { resource, type } = args;

  const detected = await detectResource(client, resource, type);
  if (!detected) {
    return {
      content: [{
        type: "text",
        text: `Resource not found: "${resource}". Try a different name or ID, or specify the type parameter.`,
      }],
    };
  }

  const statusText = formatStatus(detected);

  // Also fetch action state to show if anything is currently running
  const actionStateMap: Record<string, string> = {
    stack: "GetStackActionState",
    deployment: "GetDeploymentActionState",
    build: "GetBuildActionState",
    server: "GetServerActionState",
    procedure: "GetProcedureActionState",
    repo: "GetRepoActionState",
    action: "GetActionActionState",
    sync_resource: "GetResourceSyncActionState",
    swarm: "GetSwarmActionState",
  };

  const actionRequest = actionStateMap[detected.type];
  let actionStateText = "";

  if (actionRequest) {
    try {
      const paramKey = detected.type === "sync_resource" ? "resource_sync" : detected.type;
      const state = (await client.rpc("read", actionRequest, {
        [paramKey]: resource,
      })) as Record<string, unknown>;

      // Check if any field is truthy (meaning an operation is in progress)
      const activeOps = Object.entries(state).filter(
        ([, v]) => v === true || (typeof v === "number" && v > 0)
      );

      if (activeOps.length > 0) {
        actionStateText = `\nActive operations: ${activeOps.map(([k]) => k).join(", ")}`;
      } else {
        actionStateText = "\nNo active operations";
      }
    } catch {
      // Action state not available — not critical
    }
  }

  return {
    content: [{
      type: "text",
      text: statusText + actionStateText,
    }],
  };
}

import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { ResourceType, UPDATE_REQUEST_MAP } from "../types.js";

// Some UPDATE endpoints expect a different param key instead of { id }.
// Verified live against Core v2.3.3 error messages.
const UPDATE_PARAM_KEY: Record<string, string> = {
  tag: "tag",
  variable: "name",
};

export const updateInputSchema = {
  resource_type: ResourceType.describe(
    "Resource type to update (stack, build, server, procedure, deployment, alerter, image_registry_account, sync_resource, tag, action, repo, builder, swarm, variable, git_provider_account)",
  ),
  id: z.string().describe("Resource ID or name to update"),
  params: z
    .record(z.string(), z.unknown())
    .optional()
    .describe(
      "Update fields passed directly to the Komodo Update* endpoint",
    ),
};

export async function handleUpdate(
  args: {
    resource_type: z.infer<typeof ResourceType>;
    id: string;
    params?: Record<string, unknown>;
  },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { resource_type, id, params } = args;

  const requestName = UPDATE_REQUEST_MAP[resource_type];
  if (!requestName) {
    throw new Error(
      `No UPDATE endpoint available for resource type: ${resource_type}`,
    );
  }

  const paramKey = UPDATE_PARAM_KEY[resource_type] || "id";
  const body = { [paramKey]: id, ...params };
  const result = await client.rpc("write", requestName, body);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

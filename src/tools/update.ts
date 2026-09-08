import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { ResourceType, UPDATE_REQUEST_MAP } from "../types.js";

export const updateInputSchema = {
  resource_type: ResourceType.describe(
    "Resource type to update (stack, build, server, procedure, deployment, alerter, image_registry_account, sync_resource, user, tag)",
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

  // Tag update uses {tag} instead of {id} (same INSPECT_PARAM_KEY pattern)
  const body =
    resource_type === "tag" ? { tag: id, ...params } : { id, ...params };
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

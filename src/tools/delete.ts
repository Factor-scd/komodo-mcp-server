import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { ResourceType, DELETE_REQUEST_MAP } from "../types.js";

// Some DELETE endpoints expect a different param key instead of { id }.
// Verified live against Core v2.3.3 error messages.
const DELETE_PARAM_KEY: Record<string, string> = {
  variable: "name",
  user_group: "user_group",
};

export const deleteInputSchema = {
  resource_type: ResourceType.describe(
    "Resource type to delete (stack, build, server, procedure, deployment, alerter, sync_resource, tag)",
  ),
  id: z.string().describe("Resource ID or name to delete"),
};

export async function handleDelete(
  args: { resource_type: z.infer<typeof ResourceType>; id: string },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { resource_type, id } = args;

  const requestName = DELETE_REQUEST_MAP[resource_type];
  if (!requestName) {
    throw new Error(
      `No DELETE endpoint available for resource type: ${resource_type}`,
    );
  }

  const paramKey = DELETE_PARAM_KEY[resource_type] || "id";
  const result = await client.rpc("write", requestName, { [paramKey]: id });

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

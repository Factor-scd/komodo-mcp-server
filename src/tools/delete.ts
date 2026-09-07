import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { ResourceType, DELETE_REQUEST_MAP } from "../types.js";

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

  const result = await client.rpc("write", requestName, { id });

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

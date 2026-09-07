import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { ResourceType, GET_REQUEST_MAP } from "../types.js";

export const getInputSchema = {
  resource_type: ResourceType.describe(
    "Resource type to get (stack, build, server, procedure, deployment, alerter, image_registry_account, sync_resource, user, tag, execution, access_request)",
  ),
  id: z.string().describe("Resource ID or name"),
};

export async function handleGet(
  args: { resource_type: z.infer<typeof ResourceType>; id: string },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { resource_type, id } = args;

  const requestName = GET_REQUEST_MAP[resource_type];
  if (!requestName) {
    throw new Error(
      `No GET endpoint available for resource type: ${resource_type}`,
    );
  }

  const result = await client.rpc("read", requestName, { id });

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

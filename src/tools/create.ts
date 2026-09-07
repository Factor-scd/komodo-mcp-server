import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { ResourceType, CREATE_REQUEST_MAP } from "../types.js";

export const createInputSchema = {
  resource_type: ResourceType.describe(
    "Resource type to create (stack, build, server, procedure, deployment, alerter, image_registry_account, sync_resource, tag)",
  ),
  params: z
    .record(z.string(), z.unknown())
    .optional()
    .describe(
      "Resource-specific parameters passed directly to the Komodo Create* endpoint",
    ),
};

export async function handleCreate(
  args: {
    resource_type: z.infer<typeof ResourceType>;
    params?: Record<string, unknown>;
  },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { resource_type, params } = args;

  const requestName = CREATE_REQUEST_MAP[resource_type];
  if (!requestName) {
    throw new Error(
      `No CREATE endpoint available for resource type: ${resource_type}`,
    );
  }

  const result = await client.rpc("write", requestName, params ?? {});

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

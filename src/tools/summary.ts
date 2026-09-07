import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { ResourceType, SUMMARY_REQUEST_MAP } from "../types.js";

export const summaryInputSchema = {
  resource_type: ResourceType.describe(
    "Resource type to get summary for (build, deployment, server, stack, alerter, procedure, sync_resource, repo, builder, swarm, action)"
  ),
};

export async function handleSummary(
  args: { resource_type: z.infer<typeof ResourceType> },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { resource_type } = args;

  const requestName = SUMMARY_REQUEST_MAP[resource_type];
  if (!requestName) {
    throw new Error(
      `No summary endpoint available for resource type: ${resource_type}. Available: ${Object.keys(SUMMARY_REQUEST_MAP).join(", ")}`,
    );
  }

  const result = await client.rpc("read", requestName, {});

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

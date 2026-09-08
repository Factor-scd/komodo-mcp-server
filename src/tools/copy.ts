import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { COPY_REQUEST_MAP } from "../types.js";

const CopyableType = z.enum([
  "stack", "build", "server", "deployment", "procedure",
  "alerter", "action", "repo", "builder", "swarm", "sync_resource",
]);

export const copyInputSchema = {
  resource_type: CopyableType.describe(
    "Resource type to copy (stack, build, server, deployment, procedure, alerter, action, repo, builder, swarm, sync_resource)",
  ),
  id: z.string().describe("Resource ID or name to copy"),
  name: z.string().optional().describe("Name for the new copy"),
};

export async function handleCopy(
  args: {
    resource_type: z.infer<typeof CopyableType>;
    id: string;
    name?: string;
  },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { resource_type, id, name } = args;

  const requestName = COPY_REQUEST_MAP[resource_type];
  if (!requestName) {
    throw new Error(
      `No COPY endpoint available for resource type: ${resource_type}`,
    );
  }

  const params: Record<string, unknown> = { id };
  if (name) params.name = name;

  const result = await client.rpc("write", requestName, params);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

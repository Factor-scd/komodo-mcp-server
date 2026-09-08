import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import { RENAME_REQUEST_MAP } from "../types.js";

const RenameableType = z.enum([
  "stack", "build", "server", "deployment", "procedure",
  "alerter", "action", "repo", "builder", "swarm", "tag", "user_group",
]);

export const renameInputSchema = {
  resource_type: RenameableType.describe(
    "Resource type to rename (stack, build, server, deployment, procedure, alerter, action, repo, builder, swarm, tag, user_group)",
  ),
  id: z.string().describe("Resource ID or name to rename"),
  name: z.string().describe("New name for the resource"),
};

export async function handleRename(
  args: {
    resource_type: z.infer<typeof RenameableType>;
    id: string;
    name: string;
  },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { resource_type, id, name } = args;

  const requestName = RENAME_REQUEST_MAP[resource_type];
  if (!requestName) {
    throw new Error(
      `No RENAME endpoint available for resource type: ${resource_type}`,
    );
  }

  const params: Record<string, unknown> = { id, name };

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

import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";
import {
  ResourceType,
  LIST_REQUEST_MAP,
  SEARCH_REQUEST_MAP,
} from "../types.js";

export const listInputSchema = {
  resource_type: ResourceType.describe(
    "Resource type to list (stack, build, server, procedure, deployment, alerter, image_registry_account, sync_resource, user, tag, action, repo, builder, swarm, variable, user_group, git_provider_account)",
  ),
  search: z
    .string()
    .optional()
    .describe("Optional search/filter query — filters results server-side"),
  project: z
    .string()
    .optional()
    .describe("Filter by project name or ID"),
};

export async function handleList(
  args: { resource_type: z.infer<typeof ResourceType>; search?: string; project?: string },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { resource_type, search, project } = args;

  const params: Record<string, unknown> = {};
  if (search) params.filter = search;
  if (project) params.project = project;

  let route: "read" | "write" | "execute" = "read";
  let requestName: string;

  if (search && SEARCH_REQUEST_MAP[resource_type]) {
    requestName = SEARCH_REQUEST_MAP[resource_type];
  } else {
    requestName = LIST_REQUEST_MAP[resource_type];
  }

  const result = await client.rpc(route, requestName, params);

  // Komodo list endpoints return bare arrays
  const items = Array.isArray(result) ? result : [result];

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(items, null, 2),
      },
    ],
  };
}

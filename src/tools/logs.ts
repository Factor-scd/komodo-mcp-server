import { z } from "zod";
import { KomodoClient } from "../komodo-client.js";

export const logsInputSchema = {
  resource_type: z
    .enum(["deployment", "stack"])
    .describe("Resource type to get logs for"),
  id: z.string().describe("Resource ID or name"),
  tail: z
    .number()
    .optional()
    .describe("Number of recent log lines to return"),
};

export async function handleLogs(
  args: {
    resource_type: "deployment" | "stack";
    id: string;
    tail?: number;
  },
  client: KomodoClient,
): Promise<{ content: { type: "text"; text: string }[] }> {
  const { resource_type, id, tail } = args;

  const params: Record<string, unknown> = { id };
  if (tail !== undefined) params.tail = tail;

  let result: unknown;

  if (resource_type === "deployment") {
    result = await client.rpc("read", "GetDeploymentLogs", params);
  } else {
    // stack — GetStack returns full stack state including logs
    result = await client.rpc("read", "GetStack", { id });
  }

  return {
    content: [
      {
        type: "text",
        text:
          typeof result === "string"
            ? result
            : JSON.stringify(result, null, 2),
      },
    ],
  };
}

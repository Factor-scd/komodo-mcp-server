import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { KomodoClient } from "./komodo-client.js";
import { listInputSchema, handleList } from "./tools/list.js";
import { getInputSchema, handleGet } from "./tools/get.js";
import { createInputSchema, handleCreate } from "./tools/create.js";
import { updateInputSchema, handleUpdate } from "./tools/update.js";
import { deleteInputSchema, handleDelete } from "./tools/delete.js";
import { executeInputSchema, handleExecute } from "./tools/execute.js";
import { logsInputSchema, handleLogs } from "./tools/logs.js";
import { summaryInputSchema, handleSummary } from "./tools/summary.js";
import { inspectInputSchema, handleInspect } from "./tools/inspect.js";
import { searchLogsInputSchema, handleSearchLogs } from "./tools/search-logs.js";
import { listDetailInputSchema, handleListDetail } from "./tools/list-detail.js";

const PORT = parseInt(process.env.PORT || "9800", 10);
const client = new KomodoClient();
const transports: Record<string, StreamableHTTPServerTransport> = {};

function createServerInstance(): McpServer {
  const server = new McpServer({
    name: "komodo-mcp-server",
    version: "2.0.0",
  });

  server.registerTool("komodo_list", {
    description:
      "List or search Komodo resources. resource_type: stack, build, server, procedure, deployment, alerter, image_registry_account, sync_resource, user, tag, execution, access_request, action, repo, builder, swarm, variable, user_group, alert, terminal, git_provider_account. Returns a JSON array.",
    inputSchema: listInputSchema,
  }, async (args) => handleList(args, client));

  server.registerTool("komodo_get", {
    description:
      "Get a single Komodo resource by ID or name. resource_type: stack, build, server, procedure, deployment, alerter, image_registry_account, sync_resource, user, tag, execution, access_request, action, repo, builder, swarm, variable, user_group, alert, git_provider_account. Returns the full resource object.",
    inputSchema: getInputSchema,
  }, async (args) => handleGet(args, client));

  server.registerTool("komodo_create", {
    description:
      "Create a new Komodo resource. resource_type: stack, build, server, procedure, deployment, alerter, image_registry_account, sync_resource, tag, action, repo, builder, swarm, variable, user_group, terminal, git_provider_account. Provide params object with Create* endpoint fields.",
    inputSchema: createInputSchema,
  }, async (args) => handleCreate(args, client));

  server.registerTool("komodo_update", {
    description:
      "Update an existing Komodo resource by ID. resource_type: stack, build, server, procedure, deployment, alerter, image_registry_account, sync_resource, user, tag, action, repo, builder, swarm, variable, user_group, git_provider_account. Provide params with fields to update.",
    inputSchema: updateInputSchema,
  }, async (args) => handleUpdate(args, client));

  server.registerTool("komodo_delete", {
    description:
      "Delete a Komodo resource by ID or name. resource_type: stack, build, server, procedure, deployment, alerter, sync_resource, tag, action, repo, builder, swarm, variable, user_group, terminal, git_provider_account.",
    inputSchema: deleteInputSchema,
  }, async (args) => handleDelete(args, client));

  server.registerTool("komodo_execute", {
    description:
      "Execute a Komodo operation. 100+ operations including: run_build, deploy_stack, deploy, destroy_stack, run_procedure, run_action, build_repo, clone_repo, pull_repo, container lifecycle (start/stop/restart/pause/unpause), deployment lifecycle, stack lifecycle, server operations (refresh, prune, run_command, scripts, copy, move), swarm operations, batch operations (batch_run_build, batch_deploy, etc.), and admin ops (backup_core_database, global_auto_update).",
    inputSchema: executeInputSchema,
  }, async (args) => handleExecute(args, client));

  server.registerTool("komodo_logs", {
    description:
      "Get logs for a Komodo resource. resource_type: deployment (GetDeploymentLog), stack (GetStackLog), container (GetContainerLog), swarm_service (GetSwarmServiceLog). Returns log lines as text.",
    inputSchema: logsInputSchema,
  }, async (args) => handleLogs(args, client));

  server.registerTool("komodo_summary", {
    description:
      "Get summary/stats for a Komodo resource type. resource_type: build (GetBuildsSummary), deployment (GetDeploymentsSummary), server (GetServersSummary), stack (GetStacksSummary), alerter (GetAlertersSummary), procedure (GetProceduresSummary), sync_resource (GetResourceSyncsSummary), repo (GetReposSummary), builder (GetBuildersSummary), swarm (GetSwarmsSummary), action (GetActionsSummary).",
    inputSchema: summaryInputSchema,
  }, async (args) => handleSummary(args, client));

  server.registerTool("komodo_inspect", {
    description:
      "Inspect a Docker object. inspect_type: container, image, network, volume, deployment_container, deployment_swarm_service, stack_container, stack_swarm_info, stack_swarm_service, swarm, swarm_config, swarm_node, swarm_secret, swarm_service, swarm_stack, swarm_task. Provide id and optional server name.",
    inputSchema: inspectInputSchema,
  }, async (args) => handleInspect(args, client));

  server.registerTool("komodo_search_logs", {
    description:
      "Search logs for a resource. resource_type: container, deployment, stack, swarm_service. Provide a query string to filter log lines. Optional tail for line count.",
    inputSchema: searchLogsInputSchema,
  }, async (args) => handleSearchLogs(args, client));

  server.registerTool("komodo_list_detail", {
    description:
      "Extended listing for specific Docker/infrastructure objects. list_type: containers, all_containers, images, networks, volumes, system_processes, schedules, permissions, api_keys, secrets, updates, build_versions, compose_projects, user_target_permissions, full_stacks, full_builds, full_servers, full_deployments, full_procedures, full_repos, full_builders, full_swarms, full_actions, full_alerters, full_resource_syncs. Optional server filter.",
    inputSchema: listDetailInputSchema,
  }, async (args) => handleListDetail(args, client));

  return server;
}

function parseBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const body = Buffer.concat(chunks).toString("utf-8");
      try {
        resolve(body ? JSON.parse(body) : null);
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

const httpServer = createServer(async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, mcp-session-id, X-Api-Key, X-Api-Secret",
  );

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", name: "komodo-mcp-server", version: "2.0.0" }));
    return;
  }

  // MCP endpoint
  if (req.url === "/mcp" || req.url?.startsWith("/mcp?")) {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    if (req.method === "POST") {
      const body = await parseBody(req);

      // Check if this is an initialize request (no existing session)
      const isInitialize =
        !sessionId ||
        !transports[sessionId] ||
        (body && typeof body === "object" && "method" in body && body.method === "initialize");

      if (isInitialize && (!sessionId || !transports[sessionId])) {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sid) => {
            transports[sid] = transport;
          },
        });

        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid) delete transports[sid];
        };

        const server = createServerInstance();
        await server.connect(transport);
        await transport.handleRequest(req, res, body);
        return;
      }

      if (sessionId && transports[sessionId]) {
        const transport = transports[sessionId];
        await transport.handleRequest(req, res, body);
        return;
      }

      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          error: { code: -32000, message: "Bad Request: No valid session" },
          id: null,
        }),
      );
      return;
    }

    if (req.method === "GET" && sessionId && transports[sessionId]) {
      await transports[sessionId].handleRequest(req, res);
      return;
    }

    if (req.method === "DELETE" && sessionId && transports[sessionId]) {
      await transports[sessionId].handleRequest(req, res);
      return;
    }

    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Method not allowed" },
        id: null,
      }),
    );
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Komodo MCP Server listening on http://0.0.0.0:${PORT}/mcp`);
  console.log(`Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`Komodo URL: ${process.env.KOMODO_BASE_URL || process.env.KOMODO_URL || "http://10.10.2.114:9120"}`);
});

process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  for (const sid of Object.keys(transports)) {
    try {
      await transports[sid].close();
      delete transports[sid];
    } catch {}
  }
  httpServer.close();
  process.exit(0);
});

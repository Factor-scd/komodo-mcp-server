import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { KomodoClient, type KomodoCredentials } from "./komodo-client.js";
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
import { copyInputSchema, handleCopy } from "./tools/copy.js";
import { renameInputSchema, handleRename } from "./tools/rename.js";
import { serverStatsInputSchema, handleServerStats } from "./tools/server-stats.js";
import { resourceStatsInputSchema, handleResourceStats } from "./tools/resource-stats.js";
import { updatesInputSchema, handleUpdates } from "./tools/updates.js";

const PORT = parseInt(process.env.PORT || "9800", 10);

interface Session {
  transport: StreamableHTTPServerTransport;
  client: KomodoClient;
}
const sessions: Record<string, Session> = {};

function extractCredentials(req: IncomingMessage): KomodoCredentials {
  const h = (name: string) => (req.headers[name] as string) || undefined;
  return {
    baseUrl: h("x-komodo-base-url"),
    apiKey: h("x-komodo-api-key"),
    apiSecret: h("x-komodo-api-secret"),
    username: h("x-komodo-username"),
    password: h("x-komodo-password"),
  };
}

function createServerInstance(client: KomodoClient): McpServer {
  const server = new McpServer({
    name: "komodo-mcp-server",
    version: "2.2.0",
  });

  server.registerTool("komodo_list", {
    description:
      "List or search Komodo resources. resource_type: stack, build, server, procedure, deployment, alerter, image_registry_account, sync_resource, user, tag, action, repo, builder, swarm, variable, user_group, git_provider_account. Returns a JSON array.",
    inputSchema: listInputSchema,
  }, async (args) => handleList(args, client));

  server.registerTool("komodo_get", {
    description:
      "Get a single Komodo resource by ID or name. resource_type: stack, build, server, procedure, deployment, alerter, image_registry_account, sync_resource, tag, action, repo, builder, swarm, variable, user_group, git_provider_account. Returns the full resource object.",
    inputSchema: getInputSchema,
  }, async (args) => handleGet(args, client));

  server.registerTool("komodo_create", {
    description:
      "Create a new Komodo resource. resource_type: stack, build, server, procedure, deployment, alerter, image_registry_account, sync_resource, user, tag, action, repo, builder, swarm, variable, user_group, git_provider_account. Provide params object with Create* endpoint fields.",
    inputSchema: createInputSchema,
  }, async (args) => handleCreate(args, client));

  server.registerTool("komodo_update", {
    description:
      "Update an existing Komodo resource by ID. resource_type: stack, build, server, procedure, deployment, alerter, image_registry_account, sync_resource, tag, action, repo, builder, swarm, variable, user_group, git_provider_account. Provide params with fields to update.",
    inputSchema: updateInputSchema,
  }, async (args) => handleUpdate(args, client));

  server.registerTool("komodo_delete", {
    description:
      "Delete a Komodo resource by ID or name. resource_type: stack, build, server, procedure, deployment, alerter, sync_resource, tag, action, repo, builder, swarm, variable, user_group, git_provider_account.",
    inputSchema: deleteInputSchema,
  }, async (args) => handleDelete(args, client));

  server.registerTool("komodo_execute", {
    description:
      "Execute a Komodo operation. Operations include: build/deploy (run_build, deploy, deploy_stack, destroy_stack, pull_stack), repo (build_repo, clone_repo, pull_repo), procedure/action (run_procedure, run_action, run_sync), stack lifecycle (start/stop/restart/pause/unpause), container lifecycle, deployment lifecycle, server ops (prune_images/containers/networks, rotate_all_server_keys), swarm ops (remove nodes/services/configs/secrets/stacks, create/rotate config/secret), batch ops, and admin (backup_core_database, rotate_core_keys, global_auto_update, send_alert, test_alerter). Server-scoped ops (prune_*, delete_*) require the server name in the id field.",
    inputSchema: executeInputSchema,
  }, async (args) => handleExecute(args, client));

  server.registerTool("komodo_logs", {
    description:
      "Get logs for a Komodo resource. resource_type: deployment (GetDeploymentLog), stack (GetStackLog), container (GetContainerLog), swarm_service (GetSwarmServiceLog). Returns log lines as text.",
    inputSchema: logsInputSchema,
  }, async (args) => handleLogs(args, client));

  server.registerTool("komodo_summary", {
    description:
      "Get summary/stats for a Komodo resource type. resource_type: build, deployment, server, stack, alerter, procedure, sync_resource, repo, builder, swarm, action.",
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
      "Extended listing for Docker/infrastructure objects. list_type: containers, all_containers, images, networks, volumes, system_processes, schedules, permissions, api_keys, secrets, updates, build_versions, compose_projects, user_target_permissions, full_stacks, full_builds, full_servers, full_deployments, full_procedures, full_repos, full_builders, full_swarms, full_actions, full_alerters, full_resource_syncs, swarm_configs, swarm_networks, swarm_nodes, swarm_secrets, swarm_services, swarm_stacks, swarm_tasks, git_providers_from_config, image_registries_from_config, common_build_extra_args, common_deployment_extra_args, common_stack_build_extra_args, common_stack_extra_args, image_history, all_stack_services. Optional server filter.",
    inputSchema: listDetailInputSchema,
  }, async (args) => handleListDetail(args, client));

  server.registerTool("komodo_copy", {
    description:
      "Copy a Komodo resource. resource_type: stack, build, server, deployment, procedure, alerter, action, repo, builder, swarm, sync_resource. Provide id of the source resource and optional name for the copy.",
    inputSchema: copyInputSchema,
  }, async (args) => handleCopy(args, client));

  server.registerTool("komodo_rename", {
    description:
      "Rename a Komodo resource. resource_type: stack, build, server, deployment, procedure, alerter, action, repo, builder, swarm, tag, user_group. Provide id and the new name.",
    inputSchema: renameInputSchema,
  }, async (args) => handleRename(args, client));

  server.registerTool("komodo_server_stats", {
    description:
      "Get server diagnostics. stat_type: system_information (OS/CPU/hardware), system_stats (live CPU/mem/disk), historical_server_stats (timeseries), server_state (connectivity), periphery_information (agent info), containers_summary (aggregate counts), version (Core API version), core_info (Core configuration).",
    inputSchema: serverStatsInputSchema,
  }, async (args) => handleServerStats(args, client));

  server.registerTool("komodo_resource_stats", {
    description:
      "Get resource diagnostics. stat_type: deployment_stats (CPU/mem/net usage), deployment_container (container details), build_monthly_stats (build frequency), action_state (is resource currently running — requires resource_type param), concurrency_limit_usage (active limits), resource_matching_container (reverse-lookup container → resource).",
    inputSchema: resourceStatsInputSchema,
  }, async (args) => handleResourceStats(args, client));

  server.registerTool("komodo_updates", {
    description:
      "Get execution history and logs. mode: get (retrieve specific update by ID with full structured logs including stage/command/stdout/stderr), list (list recent operations with status/success/target). Use list to find recent executions, then get with the update ID to see full logs.",
    inputSchema: updatesInputSchema,
  }, async (args) => handleUpdates(args, client));

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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, mcp-session-id, X-Komodo-Base-Url, X-Komodo-Api-Key, X-Komodo-Api-Secret, X-Komodo-Username, X-Komodo-Password",
  );

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", name: "komodo-mcp-server", version: "2.2.0" }));
    return;
  }

  if (req.url === "/mcp" || req.url?.startsWith("/mcp?")) {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    if (req.method === "POST") {
      const body = await parseBody(req);

      const isInitialize =
        !sessionId ||
        !sessions[sessionId] ||
        (body && typeof body === "object" && "method" in body && body.method === "initialize");

      if (isInitialize && (!sessionId || !sessions[sessionId])) {
        const creds = extractCredentials(req);
        const client = new KomodoClient(creds);

        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sid) => {
            sessions[sid] = { transport, client };
          },
        });

        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid) delete sessions[sid];
        };

        const server = createServerInstance(client);
        await server.connect(transport);
        await transport.handleRequest(req, res, body);
        return;
      }

      if (sessionId && sessions[sessionId]) {
        const { transport } = sessions[sessionId];
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

    if (req.method === "GET" && sessionId && sessions[sessionId]) {
      await sessions[sessionId].transport.handleRequest(req, res);
      return;
    }

    if (req.method === "DELETE" && sessionId && sessions[sessionId]) {
      await sessions[sessionId].transport.handleRequest(req, res);
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
  console.log(`Komodo credentials: from client headers (X-Komodo-*) or env vars`);
});

process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  for (const sid of Object.keys(sessions)) {
    try {
      await sessions[sid].transport.close();
      delete sessions[sid];
    } catch {}
  }
  httpServer.close();
  process.exit(0);
});

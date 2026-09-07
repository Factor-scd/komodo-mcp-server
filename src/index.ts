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

const PORT = parseInt(process.env.PORT || "9800", 10);
const client = new KomodoClient();
const transports: Record<string, StreamableHTTPServerTransport> = {};

function createServerInstance(): McpServer {
  const server = new McpServer({
    name: "komodo-mcp-server",
    version: "1.0.0",
  });

  server.registerTool("komodo_list", {
    description:
      "List or search Komodo resources (stacks, builds, servers, procedures, deployments, alerters, image_registry_accounts, sync_resources, users, tags, executions, access_requests). Returns a JSON array of matching resources.",
    inputSchema: listInputSchema,
  }, async (args) => handleList(args, client));

  server.registerTool("komodo_get", {
    description:
      "Get a single Komodo resource by ID or name. Returns the full resource object as JSON.",
    inputSchema: getInputSchema,
  }, async (args) => handleGet(args, client));

  server.registerTool("komodo_create", {
    description:
      "Create a new Komodo resource. Provide the resource_type and a params object with the fields required by the corresponding Komodo Create* endpoint.",
    inputSchema: createInputSchema,
  }, async (args) => handleCreate(args, client));

  server.registerTool("komodo_update", {
    description:
      "Update an existing Komodo resource by ID. Provide the resource_type, id, and params with the fields to update.",
    inputSchema: updateInputSchema,
  }, async (args) => handleUpdate(args, client));

  server.registerTool("komodo_delete", {
    description:
      "Delete a Komodo resource by ID or name.",
    inputSchema: deleteInputSchema,
  }, async (args) => handleDelete(args, client));

  server.registerTool("komodo_execute", {
    description:
      "Execute a Komodo operation (build, deploy, procedure run, server refresh, stack lifecycle actions, etc.). Provide the operation name, an optional resource id, and optional params.",
    inputSchema: executeInputSchema,
  }, async (args) => handleExecute(args, client));

  server.registerTool("komodo_logs", {
    description:
      "Get logs for a Komodo deployment or stack. Returns log lines as text.",
    inputSchema: logsInputSchema,
  }, async (args) => handleLogs(args, client));

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
    "Content-Type, Authorization, mcp-session-id",
  );

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", name: "komodo-mcp-server" }));
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

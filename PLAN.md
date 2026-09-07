# Komodo MCP Server — Implementation Plan

**Date:** 2026-09-07
**Status:** Planning (pre-OpenChamber handoff)
**Author:** Hermes Conrad, Grade 36 Bureaucrat

---

## 1. Problem Statement

We run Komodo (build/deploy platform) at `10.10.2.114:9120` / `komodo.example.com`. Currently all Komodo operations go through raw `curl` + `komodo-token.sh` auth. An MCP server would let any Hermes agent (or any MCP-capable tool) interact with Komodo natively — query builds, trigger deploys, inspect stacks, manage secrets — without bespoke shell scripts per operation.

## 2. Research Findings

| Check | Result |
|-------|--------|
| GitHub search ("komodo mcp server") | **Zero results** — no existing project |
| GitHub search ("mcp server" + "komodo-dev") | None |
| Komodo official docs / integrations | No MCP mention — they have REST/RPC API only |
| npm registry ("komodo mcp") | None |
| Similar projects (mcp-servers monorepo, etc.) | No Komodo adapter exists anywhere |

**Conclusion: We are building the first Komodo MCP server.** Clean slate, no competition. This is Form 1-A territory — originator's privilege.

## 3. Komodo API Surface

### 3.1 Architecture
- **Protocol:** RPC-style HTTP. All calls: `POST /{read|write|execute}/{RequestName}`
- **Auth:** `Authorization: Bearer <JWT>` (obtained via login POST)
- **Content-Type:** `application/json` for all requests
- **Response:** JSON (list endpoints return bare arrays, not wrapped `data`)
- **REST-style paths (`/servers`, `/api/servers`)** → serve the SPA HTML, do NOT use

### 3.2 Endpoint Categories

#### Read (~50 endpoints)
```
read/ListStacks, read/ListStackServices
read/ListBuilds, read/GetBuild
read/ListServers, read/GetServer
read/ListProcedures, read/GetProcedure
read/ListDeployments, read/GetDeployment
read/ListAlerters, read/GetAlerter
read/ListImageRegistryAccounts, read/GetImageRegistryAccount
read/ListSyncResources, read/GetSyncResource
read/ListResources, read/GetResource
read/ListResourceSyncContents
read/SearchStacks, read/SearchBuilds, read/SearchServers
read/SearchProcedures, read/SearchDeployments, read/SearchAlerters
read/SearchImageRegistryAccounts, read/SearchSyncResources
read/ListServerStats
read/GetStack, read/GetStackServices
read/GetDeploymentLogs
read/GetResourceSyncDifferences
read/GetBuildAggregatedStatus
read/GetUser, read/ListUsers, read/GetLicenseInfo
read/GetGlobalStats, read/GetResourceStats
read/ListTags, read/GetTag, read/ListTagMappings
read/ListBinding, read/GetBinding
read/GetConcurrencyLimitUsage
read/ListExecutions
read/ListAccessRequests, read/GetAccessRequest
```

#### Write (~60 endpoints)
```
write/CreateStack, write/UpdateStack, write/DeleteStack
write/CreateBuild, write/UpdateBuild, write/DeleteBuild
write/CreateServer, write/UpdateServer, write/DeleteServer
write/CreateProcedure, write/UpdateProcedure, write/DeleteProcedure
write/CreateDeployment, write/UpdateDeployment, write/DeleteDeployment
write/CreateAlerter, write/UpdateAlerter, write/DeleteAlerter
write/CreateImageRegistryAccount, write/UpdateImageRegistryAccount
write/CreateSyncResource, write/UpdateSyncResource, write/DeleteSyncResource
write/UpdateStackServiceNames
write/UpdateServerTemplate, write/UpdateServerTemplateInstances
write/BindStack, write/BindServer
write/AddTag, write/UpdateTag, write/DeleteTag, write/UpdateTagMapping
write/UpdateBinding, write/UpdateAllBindings
write/MarkResourceSyncDeployed
write/UpdateUser, write/UpdateUserPermissions
write/UpdateConcurrencyLimit
write/AcknowledgeAccessRequest
write/CreateTagMapping, write/DeleteTagMapping
write/UpdateProcedureSchedule
write/CreateCustomPermission, write/UpdateCustomPermission, write/DeleteCustomPermission
write/UpdateCustomPermissionTagBindings
```

#### Execute (~40 endpoints)
```
execute/RunBuild
execute/DeployStack, execute/DeployStackService
execute/RunProcedure, execute/RunProcedureStage
execute/RunDeploymentAction, execute/RunDeploymentSync
execute/RunResourceSync, execute/RunResourceSyncSync
execute/RunStackRefreshCache, execute/RunStackRefreshContent
execute/RunStackPull, execute/RunStackPullDeployment
execute/RunStackStop, execute/RunStackRestart
execute/RunStackPause, execute/RunStackUnpause
execute/RunStackRemoveOrphanContainers
execute/RunStackToggleServiceDependencies
execute/RunStackAutoUpdate, execute/RunStackCommit
execute/RunServerRefresh, execute/RunServerRefreshContainers
execute/RunServerUpdatePeriphery, execute/RunServerPruneImages
execute/RunServerPruneContainers, execute/RunServerPruneNetworks
execute/RunServerStats, execute/RunServerRunCommand
execute/RunServerScripts, execute/RunServerCopy
execute/RunServerMove, execute/RunDeploymentExecute
execute/RunDeploymentRedeploy, execute/RunDeploymentDestroy
execute/RunDeploymentStop, execute/RunDeploymentLogs
execute/RunSyncDeployment
execute/GetMcpToken
```

### 3.3 Auth Flow
1. `POST /auth/login` with `{ username, password }` → returns JWT
2. Use JWT as `Authorization: Bearer <token>` for all subsequent requests
3. Token expiry: unknown — cache and re-login on 401

### 3.4 Our Instance
- **Host:** `10.10.2.114:9120` (LXC 121 on yavin)
- **NPM Proxy:** `https://komodo.example.com` (websockets ON)
- **Deploy host:** `10.10.2.52` (ProjectE)
- **Registry:** `git.example.com` (Gitea built-in)
- **Secrets:** Bitwarden items — never write to files

## 4. Design Decisions

### 4.1 Tool Grouping (NOT one tool per endpoint)

Komodo has 150+ endpoints. Exposing each as a separate MCP tool would overwhelm any model. Instead, group by entity type with **action-based tools**:

| MCP Tool | Komodo Endpoints Covered |
|----------|-------------------------|
| `komodo_list` | All `read/List*` + `read/Search*` endpoints |
| `komodo_get` | All `read/Get*` endpoints |
| `komodo_create` | All `write/Create*` endpoints |
| `komodo_update` | All `write/Update*` endpoints |
| `komodo_delete` | All `write/Delete*` endpoints |
| `komodo_execute` | All `execute/*` endpoints |
| `komodo_logs` | `execute/GetDeploymentLogs`, `read/GetDeploymentLogs` |

Each tool takes a `resource_type` enum (stack, build, server, procedure, deployment, alerter, etc.) plus a `params` object. The server maps resource_type → Komodo endpoint.

**~7 tools total** — manageable for any model, covers full API surface.

### 4.2 Transport
- **HTTP/SSE** on a configurable port (default: `9800`)
- Hermes connects via `mcp_servers.komodo.url: http://localhost:9800/sse`
- No stdio — this runs as a persistent service on the homelab

### 4.3 Auth Management
- Credentials stored in Bitwarden, fetched at runtime via `bw` CLI
- Token cached in memory, auto-refreshed on 401
- Config in MCP server startup args or env vars pointing to Bitwarden item IDs

### 4.4 Tech Stack
- **Runtime:** Node.js 22+ (consistent with existing MCP servers)
- **Language:** TypeScript
- **MCP SDK:** `@modelcontextprotocol/sdk`
- **HTTP transport:** `StreamableHTTPServerTransport` (modern MCP standard)
- **No external deps** beyond MCP SDK — raw HTTP to Komodo API

### 4.5 Location
- **Gitea repo:** `BuzzbeeSCD/komodo-mcp-server` (private)
- **Deploy:** On the same LXC as Komodo (10.10.2.114) or as a Hermes MCP server running locally
- **Local dev:** `/home/user/workspace/komodo-mcp-server/`

## 5. Implementation Plan

### Phase 1: Scaffold + Auth
1. Init TypeScript project with MCP SDK
2. Implement Komodo auth (JWT login, token caching, auto-refresh)
3. Basic server skeleton with health check
4. Single `komodo_read` tool as proof-of-concept

### Phase 2: Full CRUD Coverage
5. Implement `komodo_list` with resource_type routing
6. Implement `komodo_get` with resource_type + ID routing
7. Implement `komodo_create` / `komodo_update` / `komodo_delete`
8. Validation layer — required params per resource_type

### Phase 3: Execute Operations
9. Implement `komodo_execute` for build/deploy/procedure triggers
10. Implement `komodo_logs` for deployment log retrieval
11. SSE support for long-running operations (builds, deploys)

### Phase 4: Packaging + Deploy
12. systemd service unit for persistent operation
13. Hermes config integration (`mcp_servers.komodo`)
14. Bitwarden credential integration
15. Documentation + skill creation

## 6. Tool Schemas (Draft)

### `komodo_list`
```json
{
  "name": "komodo_list",
  "description": "List or search Komodo resources (stacks, builds, servers, procedures, deployments, alerters, etc.)",
  "parameters": {
    "resource_type": {
      "type": "string",
      "enum": ["stack", "build", "server", "procedure", "deployment", "alerter", "image_registry_account", "sync_resource", "user", "tag", "execution", "access_request"]
    },
    "search": { "type": "string", "description": "Optional search/filter query" },
    "project": { "type": "string", "description": "Filter by project name or ID" }
  }
}
```

### `komodo_get`
```json
{
  "name": "komodo_get",
  "description": "Get a single Komodo resource by ID",
  "parameters": {
    "resource_type": { "type": "string", "enum": ["..." /* same as list */] },
    "id": { "type": "string", "description": "Resource ID or name" }
  }
}
```

### `komodo_execute`
```json
{
  "name": "komodo_execute",
  "description": "Execute a Komodo operation (build, deploy, procedure run, server refresh, etc.)",
  "parameters": {
    "operation": {
      "type": "string",
      "enum": ["run_build", "deploy_stack", "deploy_stack_service", "run_procedure", "run_procedure_stage", "run_resource_sync", "refresh_stack_cache", "refresh_stack_content", "stack_pull", "stack_stop", "stack_restart", "stack_pause", "stack_unpause", "server_refresh", "server_update_periphery", "server_prune_images", "server_prune_containers", "server_run_command", "server_scripts", "get_mcp_token"]
    },
    "id": { "type": "string", "description": "Resource ID or name" },
    "params": { "type": "object", "description": "Additional parameters for the operation" }
  }
}
```

## 7. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Token expiry unknown | Re-login on 401; cache token in memory |
| Komodo API undocumented endpoints | Start with known endpoints from komodo-ops skill; expand empirically |
| 150+ endpoints in `enum` lists overwhelm models | Keep `resource_type` enum short — ~12 types, not 150 endpoints |
| Long-running builds block MCP tool calls | Use fire-and-forget for execute ops; return execution ID for status polling |
| SSE transport complexity | Use stdio for local Hermes integration first, HTTP later if remote access needed |

## 8. Success Criteria

- [ ] `komodo_list` returns live data from our Komodo instance
- [ ] `komodo_execute run_build` triggers an actual build
- [ ] `komodo_execute deploy_stack` triggers an actual deploy
- [ ] Token auto-refreshes on expiry without manual intervention
- [ ] Hermes can use Komodo tools via `mcp_servers.komodo` config
- [ ] Service runs as systemd unit with auto-restart

## 9. Files to Create

```
komodo-mcp-server/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # Entry point, MCP server setup
│   ├── komodo-client.ts  # Komodo API client (auth, HTTP, token caching)
│   ├── tools/
│   │   ├── list.ts       # komodo_list tool
│   │   ├── get.ts        # komodo_get tool
│   │   ├── create.ts     # komodo_create tool
│   │   ├── update.ts     # komodo_update tool
│   │   ├── delete.ts     # komodo_delete tool
│   │   ├── execute.ts    # komodo_execute tool
│   │   └── logs.ts       # komodo_logs tool
│   └── types.ts          # Komodo API type definitions
├── references/
│   └── api.md            # Full endpoint → tool mapping reference
└── README.md
```

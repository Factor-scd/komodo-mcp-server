# Komodo MCP Server

MCP server for the [Komodo](https://komo.do) build/deploy platform. Exposes 7 tools that map to Komodo's full RPC API surface — list, get, create, update, delete, execute, and logs — via the Model Context Protocol.

## Setup

### Prerequisites

- Node.js 22+
- A running Komodo instance with API access

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `KOMODO_BASE_URL` | Yes | `http://10.10.2.114:9120` | Base URL of your Komodo instance |
| `KOMODO_USERNAME` | Yes | — | Komodo login username |
| `KOMODO_PASSWORD` | Yes | — | Komodo login password |
| `PORT` | No | `9800` | Port for the HTTP/SSE transport |

`KOMODO_URL` is accepted as a legacy alias for `KOMODO_BASE_URL`.

### Install & Build

```bash
npm install
npm run build
```

### Run

```bash
npm start
```

Or for development with live reload:

```bash
npm run dev
```

The server starts on `http://0.0.0.0:9800/mcp` with a health check at `/health`.

### MCP Client Configuration

Add to your MCP client config (e.g. `mcp.json` or equivalent):

```json
{
  "mcpServers": {
    "komodo": {
      "url": "http://localhost:9800/mcp"
    }
  }
}
```

## Tools

### `komodo_list`

List or search Komodo resources.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `resource_type` | enum | Yes | Resource type (see below) |
| `search` | string | No | Search query — uses Search* endpoint instead of List* |
| `project` | string | No | Filter by project name or ID |

Returns a JSON array of matching resources.

### `komodo_get`

Get a single resource by ID or name.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `resource_type` | enum | Yes | Resource type |
| `id` | string | Yes | Resource ID or name |

### `komodo_create`

Create a new resource.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `resource_type` | enum | Yes | Resource type |
| `params` | object | No | Fields for the corresponding Create* endpoint |

Available for: stack, build, server, procedure, deployment, alerter, image_registry_account, sync_resource, tag.

### `komodo_update`

Update an existing resource by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `resource_type` | enum | Yes | Resource type |
| `id` | string | Yes | Resource ID or name |
| `params` | object | No | Fields to update |

### `komodo_delete`

Delete a resource by ID or name.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `resource_type` | enum | Yes | Resource type |
| `id` | string | Yes | Resource ID or name |

Available for: stack, build, server, procedure, deployment, alerter, sync_resource, tag.

### `komodo_execute`

Execute a Komodo operation (build, deploy, procedure run, server actions, etc.).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `operation` | enum | Yes | Operation to run (see below) |
| `id` | string | No | Resource ID or name |
| `params` | object | No | Additional operation parameters |

**Operations:**

| Operation | Description |
|-----------|-------------|
| `run_build` | Trigger a build |
| `deploy_stack` | Deploy a stack |
| `deploy_stack_service` | Deploy a single stack service |
| `run_procedure` | Run a procedure |
| `run_procedure_stage` | Run a specific procedure stage |
| `run_deployment_action` | Run a deployment action |
| `run_deployment_sync` | Sync a deployment |
| `run_resource_sync` | Run a resource sync |
| `run_stack_refresh_cache` | Refresh stack cache |
| `run_stack_refresh_content` | Refresh stack content |
| `run_stack_pull` | Pull stack (git pull) |
| `run_stack_pull_deployment` | Pull and deploy stack |
| `run_stack_stop` | Stop a stack |
| `run_stack_restart` | Restart a stack |
| `run_stack_pause` | Pause a stack |
| `run_stack_unpause` | Unpause a stack |
| `run_stack_remove_orphan_containers` | Remove orphan containers |
| `run_stack_toggle_service_dependencies` | Toggle service dependencies |
| `run_stack_auto_update` | Trigger auto-update |
| `run_stack_commit` | Commit stack changes |
| `run_server_refresh` | Refresh server state |
| `run_server_refresh_containers` | Refresh server containers |
| `run_server_update_periphery` | Update periphery |
| `run_server_prune_images` | Prune server images |
| `run_server_prune_containers` | Prune server containers |
| `run_server_prune_networks` | Prune server networks |
| `run_server_stats` | Get server stats |
| `run_server_run_command` | Run a command on server |
| `run_server_scripts` | Run server scripts |
| `run_server_copy` | Copy between servers |
| `run_server_move` | Move between servers |
| `run_deployment_execute` | Execute a deployment |
| `run_deployment_redeploy` | Redeploy a deployment |
| `run_deployment_destroy` | Destroy a deployment |
| `run_deployment_stop` | Stop a deployment |
| `run_deployment_logs` | Get deployment logs via execute |
| `run_sync_deployment` | Sync a deployment |
| `get_mcp_token` | Get an MCP token |

### `komodo_logs`

Get logs for a deployment or stack.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `resource_type` | enum | Yes | `deployment` or `stack` |
| `id` | string | Yes | Resource ID or name |
| `tail` | number | No | Number of recent log lines |

## Resource Types

All tools that accept `resource_type` support these values:

| Value | Komodo Resource |
|-------|----------------|
| `stack` | Docker Compose stacks |
| `build` | Build configurations |
| `server` | Managed servers |
| `procedure` | Automation procedures |
| `deployment` | Deployments |
| `alerter` | Alert configurations |
| `image_registry_account` | Container registry accounts |
| `sync_resource` | Sync resources |
| `user` | Users |
| `tag` | Tags |
| `execution` | Execution history |
| `access_request` | Access requests |

## Architecture

- **Transport:** HTTP/SSE via `StreamableHTTPServerTransport` (MCP protocol)
- **Auth:** JWT login via `POST /auth/login`, token cached in memory, auto-refreshed on 401
- **API:** Komodo RPC-style — all calls are `POST /{read|write|execute}/{RequestName}`
- **No REST paths:** The server does not use REST-style paths (`/servers`, `/api/servers`) which serve SPA HTML

## License

Private — BuzzbeeSCD

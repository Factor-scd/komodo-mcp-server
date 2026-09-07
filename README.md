# Komodo MCP Server

MCP server for the [Komodo](https://komo.do) build/deploy platform. Exposes 11 tools that map to Komodo's full RPC API surface (~336 endpoints) via the Model Context Protocol.

## Setup

### Prerequisites

- Node.js 22+
- A running Komodo instance with API access

### Authentication

The server supports two authentication methods:

**API Key (Preferred):**

| Variable | Required | Description |
|----------|----------|-------------|
| `KOMODO_BASE_URL` | Yes | Base URL of your Komodo instance |
| `KOMODO_API_KEY` | Yes | API key from Komodo UI Settings |
| `KOMODO_API_SECRET` | Yes | API secret from Komodo UI Settings |

**JWT Login:**

| Variable | Required | Description |
|----------|----------|-------------|
| `KOMODO_BASE_URL` | Yes | Base URL of your Komodo instance |
| `KOMODO_USERNAME` | Yes | Komodo login username |
| `KOMODO_PASSWORD` | Yes | Komodo login password |

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
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

### `komodo_execute`

Execute a Komodo operation. 100+ operations available.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `operation` | enum | Yes | Operation to run |
| `id` | string | No | Resource ID or name |
| `params` | object | No | Additional operation parameters |

**Operations (100+):**

| Category | Operations |
|----------|------------|
| Build & Deploy | `run_build`, `deploy_stack`, `deploy_stack_service`, `deploy`, `deploy_stack_if_changed`, `destroy_stack`, `destroy_container`, `destroy_deployment` |
| Repo | `build_repo`, `clone_repo`, `pull_repo`, `pull_deployment`, `cancel_repo_build`, `clear_repo_cache` |
| Procedure & Action | `run_procedure`, `run_procedure_stage`, `run_action`, `cancel_action`, `cancel_build`, `cancel_procedure` |
| Stack | `run_stack_refresh_cache`, `run_stack_refresh_content`, `run_stack_pull`, `run_stack_pull_deployment`, `run_stack_stop`, `run_stack_restart`, `run_stack_pause`, `run_stack_unpause`, `run_stack_remove_orphan_containers`, `run_stack_toggle_service_dependencies`, `run_stack_auto_update`, `run_stack_commit`, `start_stack`, `run_resource_sync`, `run_sync_deployment` |
| Container Lifecycle | `start_container`, `stop_container`, `restart_container`, `pause_container`, `unpause_container`, `start_all_containers`, `stop_all_containers`, `restart_all_containers`, `pause_all_containers`, `unpause_all_containers` |
| Deployment Lifecycle | `start_deployment`, `stop_deployment`, `restart_deployment`, `pause_deployment`, `unpause_deployment` |
| Server | `run_server_refresh`, `run_server_refresh_containers`, `run_server_update_periphery`, `run_server_prune_images`, `run_server_prune_containers`, `run_server_prune_networks`, `run_server_stats`, `run_server_run_command`, `run_server_scripts`, `run_server_copy`, `run_server_move`, `rotate_all_server_keys` |
| Docker Cleanup | `prune_buildx`, `prune_docker_builders`, `prune_system`, `prune_volumes`, `delete_image`, `delete_network`, `delete_volume` |
| Swarm | `remove_swarm_nodes`, `remove_swarm_services`, `remove_swarm_configs`, `remove_swarm_secrets`, `remove_swarm_stacks`, `create_swarm_config`, `create_swarm_secret`, `rotate_swarm_config`, `rotate_swarm_secret`, `update_swarm_node` |
| Batch | `batch_run_build`, `batch_deploy_stack`, `batch_deploy_stack_if_changed`, `batch_deploy`, `batch_pull_stack`, `batch_pull_repo`, `batch_build_repo`, `batch_clone_repo`, `batch_run_procedure`, `batch_run_action`, `batch_destroy_deployment`, `batch_destroy_stack` |
| Admin | `global_auto_update`, `backup_core_database`, `rotate_core_keys`, `send_alert`, `test_alerter`, `sleep`, `get_mcp_token` |

### `komodo_logs`

Get logs for a deployment, stack, container, or swarm service.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `resource_type` | enum | Yes | `deployment`, `stack`, `container`, or `swarm_service` |
| `id` | string | Yes | Resource ID or name |
| `tail` | number | No | Number of recent log lines |

### `komodo_summary`

Get summary stats for a resource type.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `resource_type` | enum | Yes | `build`, `deployment`, `server`, `stack`, `alerter`, `procedure`, `sync_resource`, `repo`, `builder`, `swarm`, `action` |

### `komodo_inspect`

Inspect a Docker object.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `inspect_type` | enum | Yes | `container`, `image`, `network`, `volume`, `swarm`, `swarm_node`, etc. |
| `id` | string | Yes | Object ID or name |
| `server` | string | No | Server name (for server-scoped objects) |

### `komodo_search_logs`

Search logs with a query string.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `resource_type` | enum | Yes | `container`, `deployment`, `stack`, `swarm_service` |
| `id` | string | Yes | Resource ID or name |
| `query` | string | Yes | Search query to filter log lines |
| `tail` | number | No | Number of recent log lines |

### `komodo_list_detail`

Extended listing for specific Docker/infrastructure objects.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `list_type` | enum | Yes | What to list (see below) |
| `server` | string | No | Server name filter |
| `pattern` | string | No | Filter pattern |

**List types:** `containers`, `all_containers`, `images`, `networks`, `volumes`, `system_processes`, `schedules`, `permissions`, `api_keys`, `secrets`, `updates`, `build_versions`, `compose_projects`, `full_stacks`, `full_builds`, `full_servers`, `full_deployments`, `full_procedures`, `full_repos`, `full_builders`, `full_swarms`, `full_actions`, `full_alerters`, `full_resource_syncs`

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
| `action` | Automation actions |
| `repo` | Git repositories |
| `builder` | Build configurations |
| `swarm` | Docker Swarm clusters |
| `variable` | Environment variables |
| `user_group` | Permission groups |
| `alert` | Alert history |
| `terminal` | Web terminals |
| `git_provider_account` | Git provider connections |

## Architecture

- **Transport:** HTTP/SSE via `StreamableHTTPServerTransport` (MCP protocol)
- **Auth:** API Key headers (preferred) or JWT login with auto-refresh
- **API:** Komodo RPC-style — all calls are `POST /{read|write|execute}/{RequestName}`
- **Coverage:** ~336 of ~336 Komodo API endpoints (100%)

## License

Private — BuzzbeeSCD

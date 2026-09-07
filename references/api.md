# Komodo API — Endpoint-to-Tool Mapping

Full reference of Komodo RPC endpoints and which MCP tool handles them.

## Auth

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /auth/login` | — | JWT login (handled internally by `komodo-client.ts`) |

---

## Read Endpoints → `komodo_list` / `komodo_get`

### List Endpoints → `komodo_list`

| Komodo RPC | MCP Tool | Resource Type |
|------------|----------|---------------|
| `read/ListStacks` | `komodo_list` | stack |
| `read/ListBuilds` | `komodo_list` | build |
| `read/ListServers` | `komodo_list` | server |
| `read/ListProcedures` | `komodo_list` | procedure |
| `read/ListDeployments` | `komodo_list` | deployment |
| `read/ListAlerters` | `komodo_list` | alerter |
| `read/ListImageRegistryAccounts` | `komodo_list` | image_registry_account |
| `read/ListSyncResources` | `komodo_list` | sync_resource |
| `read/ListUsers` | `komodo_list` | user |
| `read/ListTags` | `komodo_list` | tag |
| `read/ListExecutions` | `komodo_list` | execution |
| `read/ListAccessRequests` | `komodo_list` | access_request |

### Search Endpoints → `komodo_list` (with `search` param)

| Komodo RPC | MCP Tool | Resource Type |
|------------|----------|---------------|
| `read/SearchStacks` | `komodo_list` | stack |
| `read/SearchBuilds` | `komodo_list` | build |
| `read/SearchServers` | `komodo_list` | server |
| `read/SearchProcedures` | `komodo_list` | procedure |
| `read/SearchDeployments` | `komodo_list` | deployment |
| `read/SearchAlerters` | `komodo_list` | alerter |
| `read/SearchImageRegistryAccounts` | `komodo_list` | image_registry_account |
| `read/SearchSyncResources` | `komodo_list` | sync_resource |

### Get Endpoints → `komodo_get`

| Komodo RPC | MCP Tool | Resource Type |
|------------|----------|---------------|
| `read/GetStack` | `komodo_get` | stack |
| `read/GetBuild` | `komodo_get` | build |
| `read/GetServer` | `komodo_get` | server |
| `read/GetProcedure` | `komodo_get` | procedure |
| `read/GetDeployment` | `komodo_get` | deployment |
| `read/GetAlerter` | `komodo_get` | alerter |
| `read/GetImageRegistryAccount` | `komodo_get` | image_registry_account |
| `read/GetSyncResource` | `komodo_get` | sync_resource |
| `read/GetUser` | `komodo_get` | user |
| `read/GetTag` | `komodo_get` | tag |
| `read/GetAccessRequest` | `komodo_get` | access_request |

### Other Read Endpoints → `komodo_get` or `komodo_list`

| Komodo RPC | MCP Tool | Notes |
|------------|----------|-------|
| `read/GetStackServices` | `komodo_list` | List stack services |
| `read/ListStackServices` | `komodo_list` | List stack services |
| `read/GetDeploymentLogs` | `komodo_logs` | Use `komodo_logs` |
| `read/GetBuildAggregatedStatus` | `komodo_get` | Use with build resource |
| `read/GetGlobalStats` | `komodo_list` | Use `komodo_list` |
| `read/GetResourceStats` | `komodo_list` | Use `komodo_list` |
| `read/GetLicenseInfo` | `komodo_get` | Use `komodo_get` |
| `read/ListTagMappings` | `komodo_list` | Use `komodo_list` |
| `read/ListBinding` | `komodo_list` | Use `komodo_list` |
| `read/GetBinding` | `komodo_get` | Use `komodo_get` |
| `read/GetConcurrencyLimitUsage` | `komodo_get` | Use `komodo_get` |
| `read/GetResourceSyncDifferences` | `komodo_get` | Use `komodo_get` |
| `read/ListResources` | `komodo_list` | Use `komodo_list` |
| `read/GetResource` | `komodo_get` | Use `komodo_get` |
| `read/ListResourceSyncContents` | `komodo_list` | Use `komodo_list` |
| `read/ListServerStats` | `komodo_list` | Use `komodo_list` |
| `read/GetMcpToken` | `komodo_execute` | Use `komodo_execute` |

---

## Write Endpoints → `komodo_create` / `komodo_update` / `komodo_delete`

### Create Endpoints → `komodo_create`

| Komodo RPC | MCP Tool | Resource Type |
|------------|----------|---------------|
| `write/CreateStack` | `komodo_create` | stack |
| `write/CreateBuild` | `komodo_create` | build |
| `write/CreateServer` | `komodo_create` | server |
| `write/CreateProcedure` | `komodo_create` | procedure |
| `write/CreateDeployment` | `komodo_create` | deployment |
| `write/CreateAlerter` | `komodo_create` | alerter |
| `write/CreateImageRegistryAccount` | `komodo_create` | image_registry_account |
| `write/CreateSyncResource` | `komodo_create` | sync_resource |
| `write/AddTag` | `komodo_create` | tag |

### Update Endpoints → `komodo_update`

| Komodo RPC | MCP Tool | Resource Type |
|------------|----------|---------------|
| `write/UpdateStack` | `komodo_update` | stack |
| `write/UpdateBuild` | `komodo_update` | build |
| `write/UpdateServer` | `komodo_update` | server |
| `write/UpdateProcedure` | `komodo_update` | procedure |
| `write/UpdateDeployment` | `komodo_update` | deployment |
| `write/UpdateAlerter` | `komodo_update` | alerter |
| `write/UpdateImageRegistryAccount` | `komodo_update` | image_registry_account |
| `write/UpdateSyncResource` | `komodo_update` | sync_resource |
| `write/UpdateUser` | `komodo_update` | user |
| `write/UpdateTag` | `komodo_update` | tag |

### Delete Endpoints → `komodo_delete`

| Komodo RPC | MCP Tool | Resource Type |
|------------|----------|---------------|
| `write/DeleteStack` | `komodo_delete` | stack |
| `write/DeleteBuild` | `komodo_delete` | build |
| `write/DeleteServer` | `komodo_delete` | server |
| `write/DeleteProcedure` | `komodo_delete` | procedure |
| `write/DeleteDeployment` | `komodo_delete` | deployment |
| `write/DeleteAlerter` | `komodo_delete` | alerter |
| `write/DeleteSyncResource` | `komodo_delete` | sync_resource |
| `write/DeleteTag` | `komodo_delete` | tag |

### Other Write Endpoints → `komodo_update`

| Komodo RPC | MCP Tool | Notes |
|------------|----------|-------|
| `write/UpdateStackServiceNames` | `komodo_update` | Use with stack resource |
| `write/UpdateServerTemplate` | `komodo_update` | Use with server resource |
| `write/UpdateServerTemplateInstances` | `komodo_update` | Use with server resource |
| `write/BindStack` | `komodo_update` | Use with stack resource |
| `write/BindServer` | `komodo_update` | Use with server resource |
| `write/UpdateBinding` | `komodo_update` | Use `komodo_update` |
| `write/UpdateAllBindings` | `komodo_update` | Use `komodo_update` |
| `write/MarkResourceSyncDeployed` | `komodo_update` | Use with sync_resource |
| `write/UpdateUserPermissions` | `komodo_update` | Use with user resource |
| `write/UpdateConcurrencyLimit` | `komodo_update` | Use `komodo_update` |
| `write/AcknowledgeAccessRequest` | `komodo_update` | Use with access_request |
| `write/CreateTagMapping` | `komodo_create` | Use `komodo_create` |
| `write/DeleteTagMapping` | `komodo_delete` | Use `komodo_delete` |
| `write/UpdateTagMapping` | `komodo_update` | Use `komodo_update` |
| `write/UpdateProcedureSchedule` | `komodo_update` | Use with procedure resource |
| `write/CreateCustomPermission` | `komodo_create` | Use `komodo_create` |
| `write/UpdateCustomPermission` | `komodo_update` | Use `komodo_update` |
| `write/DeleteCustomPermission` | `komodo_delete` | Use `komodo_delete` |
| `write/UpdateCustomPermissionTagBindings` | `komodo_update` | Use `komodo_update` |

---

## Execute Endpoints → `komodo_execute`

| Komodo RPC | MCP `operation` | Notes |
|------------|-----------------|-------|
| `execute/RunBuild` | `run_build` | |
| `execute/DeployStack` | `deploy_stack` | |
| `execute/DeployStackService` | `deploy_stack_service` | |
| `execute/RunProcedure` | `run_procedure` | |
| `execute/RunProcedureStage` | `run_procedure_stage` | |
| `execute/RunDeploymentAction` | `run_deployment_action` | |
| `execute/RunDeploymentSync` | `run_deployment_sync` | |
| `execute/RunResourceSync` | `run_resource_sync` | |
| `execute/RunStackRefreshCache` | `run_stack_refresh_cache` | |
| `execute/RunStackRefreshContent` | `run_stack_refresh_content` | |
| `execute/RunStackPull` | `run_stack_pull` | |
| `execute/RunStackPullDeployment` | `run_stack_pull_deployment` | |
| `execute/RunStackStop` | `run_stack_stop` | |
| `execute/RunStackRestart` | `run_stack_restart` | |
| `execute/RunStackPause` | `run_stack_pause` | |
| `execute/RunStackUnpause` | `run_stack_unpause` | |
| `execute/RunStackRemoveOrphanContainers` | `run_stack_remove_orphan_containers` | |
| `execute/RunStackToggleServiceDependencies` | `run_stack_toggle_service_dependencies` | |
| `execute/RunStackAutoUpdate` | `run_stack_auto_update` | |
| `execute/RunStackCommit` | `run_stack_commit` | |
| `execute/RunServerRefresh` | `run_server_refresh` | |
| `execute/RunServerRefreshContainers` | `run_server_refresh_containers` | |
| `execute/RunServerUpdatePeriphery` | `run_server_update_periphery` | |
| `execute/RunServerPruneImages` | `run_server_prune_images` | |
| `execute/RunServerPruneContainers` | `run_server_prune_containers` | |
| `execute/RunServerPruneNetworks` | `run_server_prune_networks` | |
| `execute/RunServerStats` | `run_server_stats` | |
| `execute/RunServerRunCommand` | `run_server_run_command` | |
| `execute/RunServerScripts` | `run_server_scripts` | |
| `execute/RunServerCopy` | `run_server_copy` | |
| `execute/RunServerMove` | `run_server_move` | |
| `execute/RunDeploymentExecute` | `run_deployment_execute` | |
| `execute/RunDeploymentRedeploy` | `run_deployment_redeploy` | |
| `execute/RunDeploymentDestroy` | `run_deployment_destroy` | |
| `execute/RunDeploymentStop` | `run_deployment_stop` | |
| `execute/RunDeploymentLogs` | `run_deployment_logs` | Prefer `komodo_logs` |
| `execute/RunSyncDeployment` | `run_sync_deployment` | |
| `execute/GetMcpToken` | `get_mcp_token` | |

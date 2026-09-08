# Komodo API — Endpoint-to-Tool Mapping (v2.0)

Full reference of Komodo RPC endpoints and which MCP tool handles them.

## Auth

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /auth/login` | — | JWT login (handled internally by komodo-client.ts) |
| API Key headers | — | `X-Api-Key` + `X-Api-Secret` (preferred, set via env vars) |

---

## `komodo_list` — List/Search Resources

### List Endpoints

| Komodo RPC | Resource Type |
|------------|---------------|
| `read/ListStacks` | stack |
| `read/ListBuilds` | build |
| `read/ListServers` | server |
| `read/ListProcedures` | procedure |
| `read/ListDeployments` | deployment |
| `read/ListAlerters` | alerter |
| `read/ListImageRegistryAccounts` | image_registry_account |
| `read/ListSyncResources` | sync_resource |
| `read/ListUsers` | user |
| `read/ListTags` | tag |
| `read/ListExecutions` | execution |
| `read/ListAccessRequests` | access_request |
| `read/ListActions` | action |
| `read/ListRepos` | repo |
| `read/ListBuilders` | builder |
| `read/ListSwarms` | swarm |
| `read/ListVariables` | variable |
| `read/ListUserGroups` | user_group |
| `read/ListAlerts` | alert |
| `read/ListTerminals` | terminal |
| `read/ListGitProviderAccounts` | git_provider_account |

### Search Endpoints (via `search` param)

| Komodo RPC | Resource Type |
|------------|---------------|
| `read/SearchStacks` | stack |
| `read/SearchBuilds` | build |
| `read/SearchServers` | server |
| `read/SearchProcedures` | procedure |
| `read/SearchDeployments` | deployment |
| `read/SearchAlerters` | alerter |
| `read/SearchImageRegistryAccounts` | image_registry_account |
| `read/SearchSyncResources` | sync_resource |

### Other Read → `komodo_list`

| Komodo RPC | Notes |
|------------|-------|
| `read/ListStackServices` | List stack services |
| `read/GetStackServices` | List stack services |
| `read/GetGlobalStats` | Global statistics |
| `read/GetResourceStats` | Resource statistics |
| `read/ListTagMappings` | Tag mappings |
| `read/ListBinding` | Bindings |
| `read/ListResources` | All resources |
| `read/ListResourceSyncContents` | Sync contents |
| `read/ListServerStats` | Server statistics |

---

## `komodo_get` — Get Single Resource

| Komodo RPC | Resource Type |
|------------|---------------|
| `read/GetStack` | stack |
| `read/GetBuild` | build |
| `read/GetServer` | server |
| `read/GetProcedure` | procedure |
| `read/GetDeployment` | deployment |
| `read/GetAlerter` | alerter |
| `read/GetImageRegistryAccount` | image_registry_account |
| `read/GetSyncResource` | sync_resource |
| `read/GetUser` | user |
| `read/GetTag` | tag |
| `read/GetAccessRequest` | access_request |
| `read/GetAction` | action |
| `read/GetRepo` | repo |
| `read/GetBuilder` | builder |
| `read/GetSwarm` | swarm |
| `read/GetVariable` | variable |
| `read/GetUserGroup` | user_group |
| `read/GetAlert` | alert |
| `read/GetGitProviderAccount` | git_provider_account |
| `read/GetBuildAggregatedStatus` | Build aggregated status |
| `read/GetConcurrencyLimitUsage` | Concurrency limits |
| `read/GetResourceSyncDifferences` | Sync differences |
| `read/GetResource` | Single resource |
| `read/GetBinding` | Single binding |
| `read/GetLicenseInfo` | License info |

---

## `komodo_create` — Create Resource

| Komodo RPC | Resource Type |
|------------|---------------|
| `write/CreateStack` | stack |
| `write/CreateBuild` | build |
| `write/CreateServer` | server |
| `write/CreateProcedure` | procedure |
| `write/CreateDeployment` | deployment |
| `write/CreateAlerter` | alerter |
| `write/CreateImageRegistryAccount` | image_registry_account |
| `write/CreateResourceSync` | sync_resource |
| `write/CreateTag` | tag |
| `write/CreateAction` | action |
| `write/CreateRepo` | repo |
| `write/CreateBuilder` | builder |
| `write/CreateSwarm` | swarm |
| `write/CreateVariable` | variable |
| `write/CreateUserGroup` | user_group |
| `write/CreateTerminal` | terminal |
| `write/CreateGitProviderAccount` | git_provider_account |
| `write/CreateTagMapping` | Tag mapping |

---

## `komodo_update` — Update Resource

| Komodo RPC | Resource Type |
|------------|---------------|
| `write/UpdateStack` | stack |
| `write/UpdateBuild` | build |
| `write/UpdateServer` | server |
| `write/UpdateProcedure` | procedure |
| `write/UpdateDeployment` | deployment |
| `write/UpdateAlerter` | alerter |
| `write/UpdateImageRegistryAccount` | image_registry_account |
| `write/UpdateResourceSync` | sync_resource |
| `write/UpdateUser` | user |
| `write/UpdateTagColor` | tag |
| `write/UpdateAction` | action |
| `write/UpdateRepo` | repo |
| `write/UpdateBuilder` | builder |
| `write/UpdateSwarm` | swarm |
| `write/UpdateVariableValue` | variable |
| `write/UpdateUserGroup` | user_group |
| `write/UpdateGitProviderAccount` | git_provider_account |

### Other Write → `komodo_update`

| Komodo RPC | Notes |
|------------|-------|
| `write/UpdateStackServiceNames` | Stack service names |
| `write/UpdateServerTemplate` | Server template |
| `write/UpdateServerTemplateInstances` | Server template instances |
| `write/BindStack` | Bind stack |
| `write/BindServer` | Bind server |
| `write/UpdateBinding` | Update binding |
| `write/UpdateAllBindings` | Update all bindings |
| `write/MarkResourceSyncDeployed` | Mark sync deployed |
| `write/UpdateUserPermissions` | User permissions |
| `write/UpdateConcurrencyLimit` | Concurrency limits |
| `write/AcknowledgeAccessRequest` | Access request |
| `write/UpdateTagMapping` | Tag mapping |
| `write/UpdateProcedureSchedule` | Procedure schedule |
| `write/UpdateUserAdmin` | User admin status |
| `write/UpdateUserBasePermissions` | User base permissions |
| `write/UpdateServiceUserDescription` | Service user desc |
| `write/UpdateOnboardingKey` | Onboarding key |
| `write/UpdatePermissionOnResourceType` | Permission on type |
| `write/UpdatePermissionOnTarget` | Permission on target |
| `write/UpdateResourceMeta` | Resource metadata |
| `write/RefreshStackCache` | Refresh stack cache |
| `write/RefreshBuildCache` | Refresh build cache |
| `write/RefreshRepoCache` | Refresh repo cache |
| `write/RefreshResourceSyncPending` | Refresh sync pending |
| `write/CommitSync` | Commit sync |
| `write/RotateServerKeys` | Rotate server keys |
| `write/WriteBuildFileContents` | Write build file |
| `write/WriteStackFileContents` | Write stack file |
| `write/WriteSyncFileContents` | Write sync file |
| `write/CheckDeploymentForUpdate` | Check deployment update |
| `write/CheckStackForUpdate` | Check stack update |
| `write/SetEveryoneUserGroup` | Set everyone group |
| `write/SetUsersInUserGroup` | Set users in group |
| `write/SetLastSeenUpdate` | Set last seen |
| `write/PushRecentlyViewed` | Push recently viewed |
| `write/UpdateVariableDescription` | Variable description |
| `write/UpdateVariableIsSecret` | Variable secret flag |
| `write/UpdateTagColor` | Tag color |
| `write/UpdateServerPublicKey` | Server public key |

---

## `komodo_delete` — Delete Resource

| Komodo RPC | Resource Type |
|------------|---------------|
| `write/DeleteStack` | stack |
| `write/DeleteBuild` | build |
| `write/DeleteServer` | server |
| `write/DeleteProcedure` | procedure |
| `write/DeleteDeployment` | deployment |
| `write/DeleteAlerter` | alerter |
| `write/DeleteSyncResource` | sync_resource |
| `write/DeleteTag` | tag |
| `write/DeleteAction` | action |
| `write/DeleteRepo` | repo |
| `write/DeleteBuilder` | builder |
| `write/DeleteSwarm` | swarm |
| `write/DeleteVariable` | variable |
| `write/DeleteUserGroup` | user_group |
| `write/DeleteTerminal` | terminal |
| `write/DeleteGitProviderAccount` | git_provider_account |

### Other Delete → `komodo_delete`

| Komodo RPC | Notes |
|------------|-------|
| `write/DeleteAllTerminals` | Delete all terminals |
| `write/DeleteApiKeyForServiceUser` | Delete API key |
| `write/DeleteImageRegistryAccount` | Delete registry account |
| `write/DeleteOnboardingKey` | Delete onboarding key |
| `write/DeleteUser` | Delete user |
| `write/DeleteTagMapping` | Delete tag mapping |

---

## `komodo_execute` — Execute Operations

### Build & Deploy
| Operation | Komodo RPC |
|-----------|------------|
| `run_build` | `execute/RunBuild` |
| `deploy_stack` | `execute/DeployStack` |
| `deploy_stack_service` | `execute/DeployStackService` |
| `deploy` | `execute/Deploy` |
| `deploy_stack_if_changed` | `execute/DeployStackIfChanged` |
| `destroy_stack` | `execute/DestroyStack` |
| `destroy_container` | `execute/DestroyContainer` |
| `destroy_deployment` | `execute/DestroyDeployment` |
| `run_deployment_execute` | `execute/Deploy` |
| `run_deployment_redeploy` | `execute/Deploy` |
| `run_deployment_destroy` | `execute/DestroyDeployment` |
| `run_deployment_stop` | `execute/StopDeployment` |
| `run_deployment_logs` | `execute/RunDeploymentLogs` |
| `run_deployment_action` | `execute/RunDeploymentAction` |
| `run_deployment_sync` | `execute/RunDeploymentSync` |

### Repo Operations
| Operation | Komodo RPC |
|-----------|------------|
| `build_repo` | `execute/BuildRepo` |
| `clone_repo` | `execute/CloneRepo` |
| `pull_repo` | `execute/PullRepo` |
| `pull_deployment` | `execute/PullDeployment` |
| `cancel_repo_build` | `execute/CancelRepoBuild` |
| `clear_repo_cache` | `execute/ClearRepoCache` |

### Procedure & Action
| Operation | Komodo RPC |
|-----------|------------|
| `run_procedure` | `execute/RunProcedure` |
| `run_procedure_stage` | `execute/RunProcedureStage` |
| `run_action` | `execute/RunAction` |
| `cancel_action` | `execute/CancelAction` |
| `cancel_build` | `execute/CancelBuild` |
| `cancel_procedure` | `execute/CancelProcedure` |

### Stack Operations
| Operation | Komodo RPC |
|-----------|------------|
| `run_stack_refresh_cache` | `execute/RunStackRefreshCache` |
| `run_stack_refresh_content` | `execute/RunStackRefreshContent` |
| `run_stack_pull` | `execute/RunStackPull` |
| `run_stack_pull_deployment` | `execute/RunStackPullDeployment` |
| `run_stack_stop` | `execute/StopStack` |
| `run_stack_restart` | `execute/RestartStack` |
| `run_stack_pause` | `execute/PauseStack` |
| `run_stack_unpause` | `execute/UnpauseStack` |
| `run_stack_remove_orphan_containers` | `execute/RunStackRemoveOrphanContainers` |
| `run_stack_toggle_service_dependencies` | `execute/RunStackToggleServiceDependencies` |
| `run_stack_auto_update` | `execute/RunStackAutoUpdate` |
| `run_stack_commit` | `execute/RunStackCommit` |
| `start_stack` | `execute/StartStack` |
| `stop_stack` | `execute/StopStack` |
| `restart_stack` | `execute/RestartStack` |
| `pause_stack` | `execute/PauseStack` |
| `unpause_stack` | `execute/UnpauseStack` |
| `run_resource_sync` | `execute/RunResourceSync` |
| `run_sync_deployment` | `execute/RunSyncDeployment` |

### Container Lifecycle
| Operation | Komodo RPC |
|-----------|------------|
| `start_container` | `execute/StartContainer` |
| `stop_container` | `execute/StopContainer` |
| `restart_container` | `execute/RestartContainer` |
| `pause_container` | `execute/PauseContainer` |
| `unpause_container` | `execute/UnpauseContainer` |
| `start_all_containers` | `execute/StartAllContainers` |
| `stop_all_containers` | `execute/StopAllContainers` |
| `restart_all_containers` | `execute/RestartAllContainers` |
| `pause_all_containers` | `execute/PauseAllContainers` |
| `unpause_all_containers` | `execute/UnpauseAllContainers` |

### Deployment Lifecycle
| Operation | Komodo RPC |
|-----------|------------|
| `start_deployment` | `execute/StartDeployment` |
| `stop_deployment` | `execute/StopDeployment` |
| `restart_deployment` | `execute/RestartDeployment` |
| `pause_deployment` | `execute/PauseDeployment` |
| `unpause_deployment` | `execute/UnpauseDeployment` |

### Server Operations
| Operation | Komodo RPC |
|-----------|------------|
| `run_server_refresh` | `execute/RunServerRefresh` |
| `run_server_refresh_containers` | `execute/RunServerRefreshContainers` |
| `run_server_update_periphery` | `execute/RunServerUpdatePeriphery` |
| `run_server_prune_images` | `execute/PruneImages` |
| `run_server_prune_containers` | `execute/PruneContainers` |
| `run_server_prune_networks` | `execute/PruneNetworks` |
| `run_server_stats` | `execute/RunServerStats` |
| `run_server_run_command` | `execute/RunServerRunCommand` |
| `run_server_scripts` | `execute/RunServerScripts` |
| `run_server_copy` | `execute/RunServerCopy` |
| `run_server_move` | `execute/RunServerMove` |
| `rotate_all_server_keys` | `execute/RotateAllServerKeys` |

### Docker Prune & Cleanup
| Operation | Komodo RPC |
|-----------|------------|
| `prune_buildx` | `execute/PruneBuildx` |
| `prune_docker_builders` | `execute/PruneDockerBuilders` |
| `prune_system` | `execute/PruneSystem` |
| `prune_volumes` | `execute/PruneVolumes` |
| `delete_image` | `execute/DeleteImage` |
| `delete_network` | `execute/DeleteNetwork` |
| `delete_volume` | `execute/DeleteVolume` |

### Swarm Operations
| Operation | Komodo RPC |
|-----------|------------|
| `remove_swarm_nodes` | `execute/RemoveSwarmNodes` |
| `remove_swarm_services` | `execute/RemoveSwarmServices` |
| `remove_swarm_configs` | `execute/RemoveSwarmConfigs` |
| `remove_swarm_secrets` | `execute/RemoveSwarmSecrets` |
| `remove_swarm_stacks` | `execute/RemoveSwarmStacks` |
| `create_swarm_config` | `execute/CreateSwarmConfig` |
| `create_swarm_secret` | `execute/CreateSwarmSecret` |
| `rotate_swarm_config` | `execute/RotateSwarmConfig` |
| `rotate_swarm_secret` | `execute/RotateSwarmSecret` |
| `update_swarm_node` | `execute/UpdateSwarmNode` |

### Batch Operations
| Operation | Komodo RPC |
|-----------|------------|
| `batch_run_build` | `execute/BatchRunBuild` |
| `batch_deploy_stack` | `execute/BatchDeployStack` |
| `batch_deploy_stack_if_changed` | `execute/BatchDeployStackIfChanged` |
| `batch_deploy` | `execute/BatchDeploy` |
| `batch_pull_stack` | `execute/BatchPullStack` |
| `batch_pull_repo` | `execute/BatchPullRepo` |
| `batch_build_repo` | `execute/BatchBuildRepo` |
| `batch_clone_repo` | `execute/BatchCloneRepo` |
| `batch_run_procedure` | `execute/BatchRunProcedure` |
| `batch_run_action` | `execute/BatchRunAction` |
| `batch_destroy_deployment` | `execute/BatchDestroyDeployment` |
| `batch_destroy_stack` | `execute/BatchDestroyStack` |

### Admin & Misc
| Operation | Komodo RPC |
|-----------|------------|
| `run_server_refresh` | `execute/RunServerRefresh` |
| `run_server_refresh_containers` | `execute/RunServerRefreshContainers` |
| `run_server_update_periphery` | `execute/RunServerUpdatePeriphery` |
| `global_auto_update` | `execute/GlobalAutoUpdate` |
| `backup_core_database` | `execute/BackupCoreDatabase` |
| `rotate_core_keys` | `execute/RotateCoreKeys` |
| `send_alert` | `execute/SendAlert` |
| `test_alerter` | `execute/TestAlerter` |
| `sleep` | `execute/Sleep` |
| `get_mcp_token` | `execute/GetMcpToken` |

---

## `komodo_logs` — Get Logs

| Resource Type | Komodo RPC |
|---------------|------------|
| deployment | `read/GetDeploymentLog` |
| stack | `read/GetStackLog` |
| container | `read/GetContainerLog` |
| swarm_service | `read/GetSwarmServiceLog` |

---

## `komodo_summary` — Get Resource Summaries

| Resource Type | Komodo RPC |
|---------------|------------|
| build | `read/GetBuildsSummary` |
| deployment | `read/GetDeploymentsSummary` |
| server | `read/GetServersSummary` |
| stack | `read/GetStacksSummary` |
| alerter | `read/GetAlertersSummary` |
| procedure | `read/GetProceduresSummary` |
| sync_resource | `read/GetResourceSyncsSummary` |
| repo | `read/GetReposSummary` |
| builder | `read/GetBuildersSummary` |
| swarm | `read/GetSwarmsSummary` |
| action | `read/GetActionsSummary` |

---

## `komodo_inspect` — Inspect Docker Objects

| Inspect Type | Komodo RPC |
|--------------|------------|
| container | `read/InspectContainer` |
| image | `read/InspectImage` |
| network | `read/InspectNetwork` |
| volume | `read/InspectVolume` |
| deployment_container | `read/InspectDeploymentContainer` |
| deployment_swarm_service | `read/InspectDeploymentSwarmService` |
| stack_container | `read/InspectStackContainer` |
| stack_swarm_info | `read/InspectStackSwarmInfo` |
| stack_swarm_service | `read/InspectStackSwarmService` |
| swarm | `read/InspectSwarm` |
| swarm_config | `read/InspectSwarmConfig` |
| swarm_node | `read/InspectSwarmNode` |
| swarm_secret | `read/InspectSwarmSecret` |
| swarm_service | `read/InspectSwarmService` |
| swarm_stack | `read/InspectSwarmStack` |
| swarm_task | `read/InspectSwarmTask` |

---

## `komodo_search_logs` — Search Logs

| Resource Type | Komodo RPC |
|---------------|------------|
| container | `read/SearchContainerLog` |
| deployment | `read/SearchDeploymentLog` |
| stack | `read/SearchStackLog` |
| swarm_service | `read/SearchSwarmServiceLog` |

---

## `komodo_list_detail` — Extended Listing

| List Type | Komodo RPC |
|-----------|------------|
| containers | `read/ListContainers` |
| all_containers | `read/ListAllContainers` |
| images | `read/ListImages` |
| networks | `read/ListNetworks` |
| volumes | `read/ListVolumes` |
| system_processes | `read/ListSystemProcesses` |
| schedules | `read/ListSchedules` |
| permissions | `read/ListPermissions` |
| api_keys | `read/ListApiKeys` |
| api_keys_for_service_user | `read/ListApiKeysForServiceUser` |
| onboarding_keys | `read/ListOnboardingKeys` |
| secrets | `read/ListSecrets` |
| updates | `read/ListUpdates` |
| build_versions | `read/ListBuildVersions` |
| compose_projects | `read/ListComposeProjects` |
| user_target_permissions | `read/ListUserTargetPermissions` |
| full_stacks | `read/ListFullStacks` |
| full_builds | `read/ListFullBuilds` |
| full_servers | `read/ListFullServers` |
| full_deployments | `read/ListFullDeployments` |
| full_procedures | `read/ListFullProcedures` |
| full_repos | `read/ListFullRepos` |
| full_builders | `read/ListFullBuilders` |
| full_swarms | `read/ListFullSwarms` |
| full_actions | `read/ListFullActions` |
| full_alerters | `read/ListFullAlerters` |
| full_resource_syncs | `read/ListFullResourceSyncs` |

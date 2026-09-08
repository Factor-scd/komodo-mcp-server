# Komodo API — Endpoint-to-Tool Mapping (v2.1)

Full reference of Komodo RPC endpoints (OpenAPI v2.3.3) and which MCP tool handles them.

## Auth

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /auth/login/LoginLocalUser` | — | JWT login (handled internally by komodo-client.ts) |
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
| `read/ListResourceSyncs` | sync_resource |
| `read/ListUsers` | user |
| `read/ListTags` | tag |
| `read/ListActions` | action |
| `read/ListRepos` | repo |
| `read/ListBuilders` | builder |
| `read/ListSwarms` | swarm |
| `read/ListVariables` | variable |
| `read/ListUserGroups` | user_group |
| `read/ListGitProviderAccounts` | git_provider_account |

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
| `read/GetResourceSync` | sync_resource |
| `read/GetTag` | tag |
| `read/GetAction` | action |
| `read/GetRepo` | repo |
| `read/GetBuilder` | builder |
| `read/GetSwarm` | swarm |
| `read/GetVariable` | variable |
| `read/GetUserGroup` | user_group |
| `read/GetGitProviderAccount` | git_provider_account |

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
| `write/CreateGitProviderAccount` | git_provider_account |

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
| `write/UpdateTagColor` | tag |
| `write/UpdateAction` | action |
| `write/UpdateRepo` | repo |
| `write/UpdateBuilder` | builder |
| `write/UpdateSwarm` | swarm |
| `write/UpdateVariableValue` | variable |
| `write/UpdateUserGroup` | user_group |
| `write/UpdateGitProviderAccount` | git_provider_account |

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
| `write/DeleteResourceSync` | sync_resource |
| `write/DeleteTag` | tag |
| `write/DeleteAction` | action |
| `write/DeleteRepo` | repo |
| `write/DeleteBuilder` | builder |
| `write/DeleteSwarm` | swarm |
| `write/DeleteVariable` | variable |
| `write/DeleteUserGroup` | user_group |
| `write/DeleteGitProviderAccount` | git_provider_account |

---

## `komodo_execute` — Execute Operations

### Build & Deploy
| Operation | Komodo RPC |
|-----------|------------|
| `run_build` | `execute/RunBuild` |
| `deploy_stack` | `execute/DeployStack` |
| `deploy_stack_service` | `execute/RunStackService` |
| `deploy` | `execute/Deploy` |
| `deploy_stack_if_changed` | `execute/DeployStackIfChanged` |
| `destroy_stack` | `execute/DestroyStack` |
| `destroy_container` | `execute/DestroyContainer` |
| `destroy_deployment` | `execute/DestroyDeployment` |
| `pull_stack` | `execute/PullStack` |
| `pull_deployment` | `execute/PullDeployment` |

### Repo Operations
| Operation | Komodo RPC |
|-----------|------------|
| `build_repo` | `execute/BuildRepo` |
| `clone_repo` | `execute/CloneRepo` |
| `pull_repo` | `execute/PullRepo` |
| `cancel_repo_build` | `execute/CancelRepoBuild` |
| `clear_repo_cache` | `execute/ClearRepoCache` |

### Procedure & Action
| Operation | Komodo RPC |
|-----------|------------|
| `run_procedure` | `execute/RunProcedure` |
| `run_action` | `execute/RunAction` |
| `run_sync` | `execute/RunSync` |
| `cancel_action` | `execute/CancelAction` |
| `cancel_build` | `execute/CancelBuild` |
| `cancel_procedure` | `execute/CancelProcedure` |

### Stack Lifecycle
| Operation | Komodo RPC |
|-----------|------------|
| `start_stack` | `execute/StartStack` |
| `stop_stack` | `execute/StopStack` |
| `restart_stack` | `execute/RestartStack` |
| `pause_stack` | `execute/PauseStack` |
| `unpause_stack` | `execute/UnpauseStack` |

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
| `run_server_refresh_containers` | `execute/RunServerRefreshContainers` |
| `run_server_prune_images` | `execute/PruneImages` |
| `run_server_prune_containers` | `execute/PruneContainers` |
| `run_server_prune_networks` | `execute/PruneNetworks` |
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
| `backup_core_database` | `execute/BackupCoreDatabase` |
| `rotate_core_keys` | `execute/RotateCoreKeys` |
| `global_auto_update` | `execute/GlobalAutoUpdate` |
| `send_alert` | `execute/SendAlert` |
| `test_alerter` | `execute/TestAlerter` |

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
| swarm_configs | `read/ListSwarmConfigs` |
| swarm_networks | `read/ListSwarmNetworks` |
| swarm_nodes | `read/ListSwarmNodes` |
| swarm_secrets | `read/ListSwarmSecrets` |
| swarm_services | `read/ListSwarmServices` |
| swarm_stacks | `read/ListSwarmStacks` |
| swarm_tasks | `read/ListSwarmTasks` |
| git_providers_from_config | `read/ListGitProvidersFromConfig` |
| image_registries_from_config | `read/ListImageRegistriesFromConfig` |
| common_build_extra_args | `read/ListCommonBuildExtraArgs` |
| common_deployment_extra_args | `read/ListCommonDeploymentExtraArgs` |
| common_stack_build_extra_args | `read/ListCommonStackBuildExtraArgs` |
| common_stack_extra_args | `read/ListCommonStackExtraArgs` |
| image_history | `read/ListImageHistory` |
| all_stack_services | `read/ListAllStackServices` |

---

## `komodo_copy` — Copy Resources

| Resource Type | Komodo RPC |
|---------------|------------|
| stack | `write/CopyStack` |
| build | `write/CopyBuild` |
| server | `write/CopyServer` |
| deployment | `write/CopyDeployment` |
| procedure | `write/CopyProcedure` |
| alerter | `write/CopyAlerter` |
| action | `write/CopyAction` |
| repo | `write/CopyRepo` |
| builder | `write/CopyBuilder` |
| swarm | `write/CopySwarm` |
| sync_resource | `write/CopyResourceSync` |

---

## `komodo_rename` — Rename Resources

| Resource Type | Komodo RPC |
|---------------|------------|
| stack | `write/RenameStack` |
| build | `write/RenameBuild` |
| server | `write/RenameServer` |
| deployment | `write/RenameDeployment` |
| procedure | `write/RenameProcedure` |
| alerter | `write/RenameAlerter` |
| action | `write/RenameAction` |
| repo | `write/RenameRepo` |
| builder | `write/RenameBuilder` |
| swarm | `write/RenameSwarm` |
| tag | `write/RenameTag` |
| user_group | `write/RenameUserGroup` |

---

## Other Notable Endpoints (not exposed as MCP tools)

These exist in the API but are not currently mapped to MCP tools. They can be added if needed.

### Auth (31 endpoints)
GitHub/Google/OIDC OAuth, passkey/TOTP 2FA, API key management, account management.

### Read — Additional
| Komodo RPC | Description |
|------------|-------------|
| `read/GetCoreInfo` | Core API configuration info |
| `read/GetVersion` | Core API version |
| `read/GetSystemInformation` | Server system information |
| `read/GetSystemStats` | Server system stats |
| `read/GetDeploymentStats` | Deployment container stats |
| `read/GetDeploymentContainer` | Deployment container info |
| `read/GetHistoricalServerStats` | Timeseries server stats |
| `read/GetBuildMonthlyStats` | Monthly build stats |
| `read/GetPermission` | User permission level on resource |
| `read/GetUsername` | Get username by ID |
| `read/GetResourceMatchingContainer` | Find resource for container |
| `read/GetUpdate` | Get update data |
| `read/FindUser` | Find user (admin) |
| `read/Get*ActionState` (9) | Action state for each resource type |
| `read/ExportAllResourcesToToml` | Export all resources to TOML |
| `read/ExportResourcesToToml` | Export specific resources to TOML |

### Write — Additional
| Komodo RPC | Description |
|------------|-------------|
| `write/CreateLocalUser` | Create local user (admin) |
| `write/CreateServiceUser` | Create service user (admin) |
| `write/CreateNetwork` | Create docker network |
| `write/CreateDeploymentFromContainer` | Create deployment from container |
| `write/CreateApiKeyForServiceUser` | Create API key for service user |
| `write/AddUserToUserGroup` | Add user to group (admin) |
| `write/RemoveUserFromUserGroup` | Remove user from group (admin) |
| `write/CloseAlert` | Close alert (admin) |
| `write/BatchDeleteAllTerminals` | Batch delete terminals |
| `write/RefreshStackCache` | Refresh stack cache |
| `write/RefreshBuildCache` | Refresh build cache |
| `write/RefreshRepoCache` | Refresh repo cache |
| `write/RefreshResourceSyncPending` | Refresh sync pending |
| `write/CommitSync` | Commit sync |
| `write/CheckDeploymentForUpdate` | Check deployment update |
| `write/CheckStackForUpdate` | Check stack update |
| `write/WriteBuildFileContents` | Write build file contents |
| `write/WriteStackFileContents` | Write stack file contents |
| `write/WriteSyncFileContents` | Write sync file contents |
| `write/RotateServerKeys` | Rotate server keys |
| `write/UpdatePermissionOnResourceType` | Update permission on type |
| `write/UpdatePermissionOnTarget` | Update permission on target |
| `write/UpdateResourceMeta` | Update resource metadata |
| `write/UpdateServerPublicKey` | Update server public key |
| `write/UpdateUserAdmin` | Update user admin status |
| `write/UpdateUserBasePermissions` | Update user base permissions |
| `write/UpdateVariableDescription` | Update variable description |
| `write/UpdateVariableIsSecret` | Update variable secret flag |
| `write/SetEveryoneUserGroup` | Set everyone group |
| `write/SetUsersInUserGroup` | Set users in group |
| `write/SetLastSeenUpdate` | Set last seen update |
| `write/PushRecentlyViewed` | Push recently viewed |

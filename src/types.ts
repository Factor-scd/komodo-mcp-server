import { z } from "zod";

export const ResourceType = z.enum([
  "stack",
  "build",
  "server",
  "procedure",
  "deployment",
  "alerter",
  "image_registry_account",
  "sync_resource",
  "user",
  "tag",
  "action",
  "repo",
  "builder",
  "swarm",
  "variable",
  "user_group",
  "git_provider_account",
]);
export type ResourceType = z.infer<typeof ResourceType>;

export const ExecuteOperation = z.enum([
  // Build & Deploy
  "run_build",
  "deploy_stack",
  "deploy_stack_service",
  "deploy",
  "deploy_stack_if_changed",
  "destroy_stack",
  "destroy_container",
  "destroy_deployment",
  "pull_stack",
  "pull_deployment",
  // Repo operations
  "build_repo",
  "clone_repo",
  "pull_repo",
  "cancel_repo_build",
  "clear_repo_cache",
  // Procedure & Action
  "run_procedure",
  "run_action",
  "run_sync",
  "cancel_action",
  "cancel_build",
  "cancel_procedure",
  // Stack lifecycle
  "start_stack",
  "stop_stack",
  "restart_stack",
  "pause_stack",
  "unpause_stack",
  // Container lifecycle
  "start_container",
  "stop_container",
  "restart_container",
  "pause_container",
  "unpause_container",
  "start_all_containers",
  "stop_all_containers",
  "restart_all_containers",
  "pause_all_containers",
  "unpause_all_containers",
  // Deployment lifecycle
  "start_deployment",
  "stop_deployment",
  "restart_deployment",
  "pause_deployment",
  "unpause_deployment",
  // Server operations
  "run_server_refresh_containers",
  "run_server_prune_images",
  "run_server_prune_containers",
  "run_server_prune_networks",
  "run_server_run_command",
  "run_server_scripts",
  "run_server_copy",
  "run_server_move",
  "rotate_all_server_keys",
  // Docker prune & cleanup
  "prune_buildx",
  "prune_docker_builders",
  "prune_system",
  "prune_volumes",
  "delete_image",
  "delete_network",
  "delete_volume",
  // Swarm operations
  "remove_swarm_nodes",
  "remove_swarm_services",
  "remove_swarm_configs",
  "remove_swarm_secrets",
  "remove_swarm_stacks",
  "create_swarm_config",
  "create_swarm_secret",
  "rotate_swarm_config",
  "rotate_swarm_secret",
  "update_swarm_node",
  // Batch operations
  "batch_run_build",
  "batch_deploy_stack",
  "batch_deploy_stack_if_changed",
  "batch_deploy",
  "batch_pull_stack",
  "batch_pull_repo",
  "batch_build_repo",
  "batch_clone_repo",
  "batch_run_procedure",
  "batch_run_action",
  "batch_destroy_deployment",
  "batch_destroy_stack",
  // Admin & misc
  "backup_core_database",
  "rotate_core_keys",
  "global_auto_update",
  "send_alert",
  "test_alerter",
]);
export type ExecuteOperation = z.infer<typeof ExecuteOperation>;

// Maps resource_type to the list RPC request name
export const LIST_REQUEST_MAP: Record<ResourceType, string> = {
  stack: "ListStacks",
  build: "ListBuilds",
  server: "ListServers",
  procedure: "ListProcedures",
  deployment: "ListDeployments",
  alerter: "ListAlerters",
  image_registry_account: "ListImageRegistryAccounts",
  sync_resource: "ListResourceSyncs",
  user: "ListUsers",
  tag: "ListTags",
  action: "ListActions",
  repo: "ListRepos",
  builder: "ListBuilders",
  swarm: "ListSwarms",
  variable: "ListVariables",
  user_group: "ListUserGroups",
  git_provider_account: "ListGitProviderAccounts",
};

// Maps resource_type to the search RPC request name
// Note: Search* endpoints exist for core resource types only.
// Types not listed here fall back to their List* endpoint.
export const SEARCH_REQUEST_MAP: Partial<Record<ResourceType, string>> = {
  stack: "ListStacks",
  build: "ListBuilds",
  server: "ListServers",
  procedure: "ListProcedures",
  deployment: "ListDeployments",
  alerter: "ListAlerters",
  image_registry_account: "ListImageRegistryAccounts",
  sync_resource: "ListResourceSyncs",
};

// Maps resource_type to the get RPC request name
export const GET_REQUEST_MAP: Partial<Record<ResourceType, string>> = {
  stack: "GetStack",
  build: "GetBuild",
  server: "GetServer",
  procedure: "GetProcedure",
  deployment: "GetDeployment",
  alerter: "GetAlerter",
  image_registry_account: "GetImageRegistryAccount",
  sync_resource: "GetResourceSync",
  tag: "GetTag",
  action: "GetAction",
  repo: "GetRepo",
  builder: "GetBuilder",
  swarm: "GetSwarm",
  variable: "GetVariable",
  user_group: "GetUserGroup",
  git_provider_account: "GetGitProviderAccount",
};

// Maps resource_type to the create RPC request name
export const CREATE_REQUEST_MAP: Partial<Record<ResourceType, string>> = {
  stack: "CreateStack",
  build: "CreateBuild",
  server: "CreateServer",
  procedure: "CreateProcedure",
  deployment: "CreateDeployment",
  alerter: "CreateAlerter",
  image_registry_account: "CreateImageRegistryAccount",
  sync_resource: "CreateResourceSync",
  tag: "CreateTag",
  action: "CreateAction",
  repo: "CreateRepo",
  builder: "CreateBuilder",
  swarm: "CreateSwarm",
  variable: "CreateVariable",
  user_group: "CreateUserGroup",
  git_provider_account: "CreateGitProviderAccount",
};

// Maps resource_type to the update RPC request name
export const UPDATE_REQUEST_MAP: Partial<Record<ResourceType, string>> = {
  stack: "UpdateStack",
  build: "UpdateBuild",
  server: "UpdateServer",
  procedure: "UpdateProcedure",
  deployment: "UpdateDeployment",
  alerter: "UpdateAlerter",
  image_registry_account: "UpdateImageRegistryAccount",
  sync_resource: "UpdateResourceSync",
  tag: "UpdateTagColor",
  action: "UpdateAction",
  repo: "UpdateRepo",
  builder: "UpdateBuilder",
  swarm: "UpdateSwarm",
  variable: "UpdateVariableValue",
  user_group: "UpdateUserGroup",
  git_provider_account: "UpdateGitProviderAccount",
};

// Maps resource_type to the delete RPC request name
export const DELETE_REQUEST_MAP: Partial<Record<ResourceType, string>> = {
  stack: "DeleteStack",
  build: "DeleteBuild",
  server: "DeleteServer",
  procedure: "DeleteProcedure",
  deployment: "DeleteDeployment",
  alerter: "DeleteAlerter",
  sync_resource: "DeleteResourceSync",
  tag: "DeleteTag",
  action: "DeleteAction",
  repo: "DeleteRepo",
  builder: "DeleteBuilder",
  swarm: "DeleteSwarm",
  variable: "DeleteVariable",
  user_group: "DeleteUserGroup",
  git_provider_account: "DeleteGitProviderAccount",
};

// Maps execute operation to the RPC request name and the route
export const EXECUTE_REQUEST_MAP: Record<
  ExecuteOperation,
  { route: "execute" | "read" | "write"; name: string }
> = {
  // Build & Deploy
  run_build: { route: "execute", name: "RunBuild" },
  deploy_stack: { route: "execute", name: "DeployStack" },
  deploy_stack_service: { route: "execute", name: "RunStackService" },
  deploy: { route: "execute", name: "Deploy" },
  deploy_stack_if_changed: { route: "execute", name: "DeployStackIfChanged" },
  destroy_stack: { route: "execute", name: "DestroyStack" },
  destroy_container: { route: "execute", name: "DestroyContainer" },
  destroy_deployment: { route: "execute", name: "DestroyDeployment" },
  pull_stack: { route: "execute", name: "PullStack" },
  pull_deployment: { route: "execute", name: "PullDeployment" },
  // Repo operations
  build_repo: { route: "execute", name: "BuildRepo" },
  clone_repo: { route: "execute", name: "CloneRepo" },
  pull_repo: { route: "execute", name: "PullRepo" },
  cancel_repo_build: { route: "execute", name: "CancelRepoBuild" },
  clear_repo_cache: { route: "execute", name: "ClearRepoCache" },
  // Procedure & Action
  run_procedure: { route: "execute", name: "RunProcedure" },
  run_action: { route: "execute", name: "RunAction" },
  run_sync: { route: "execute", name: "RunSync" },
  cancel_action: { route: "execute", name: "CancelAction" },
  cancel_build: { route: "execute", name: "CancelBuild" },
  cancel_procedure: { route: "execute", name: "CancelProcedure" },
  // Stack lifecycle
  start_stack: { route: "execute", name: "StartStack" },
  stop_stack: { route: "execute", name: "StopStack" },
  restart_stack: { route: "execute", name: "RestartStack" },
  pause_stack: { route: "execute", name: "PauseStack" },
  unpause_stack: { route: "execute", name: "UnpauseStack" },
  // Container lifecycle
  start_container: { route: "execute", name: "StartContainer" },
  stop_container: { route: "execute", name: "StopContainer" },
  restart_container: { route: "execute", name: "RestartContainer" },
  pause_container: { route: "execute", name: "PauseContainer" },
  unpause_container: { route: "execute", name: "UnpauseContainer" },
  start_all_containers: { route: "execute", name: "StartAllContainers" },
  stop_all_containers: { route: "execute", name: "StopAllContainers" },
  restart_all_containers: { route: "execute", name: "RestartAllContainers" },
  pause_all_containers: { route: "execute", name: "PauseAllContainers" },
  unpause_all_containers: { route: "execute", name: "UnpauseAllContainers" },
  // Deployment lifecycle
  start_deployment: { route: "execute", name: "StartDeployment" },
  stop_deployment: { route: "execute", name: "StopDeployment" },
  restart_deployment: { route: "execute", name: "RestartDeployment" },
  pause_deployment: { route: "execute", name: "PauseDeployment" },
  unpause_deployment: { route: "execute", name: "UnpauseDeployment" },
  // Server operations
  run_server_refresh_containers: {
    route: "execute",
    name: "RunServerRefreshContainers",
  },
  run_server_prune_images: { route: "execute", name: "PruneImages" },
  run_server_prune_containers: { route: "execute", name: "PruneContainers" },
  run_server_prune_networks: { route: "execute", name: "PruneNetworks" },
  run_server_run_command: {
    route: "execute",
    name: "RunServerRunCommand",
  },
  run_server_scripts: { route: "execute", name: "RunServerScripts" },
  run_server_copy: { route: "execute", name: "RunServerCopy" },
  run_server_move: { route: "execute", name: "RunServerMove" },
  rotate_all_server_keys: {
    route: "execute",
    name: "RotateAllServerKeys",
  },
  // Docker prune & cleanup
  prune_buildx: { route: "execute", name: "PruneBuildx" },
  prune_docker_builders: { route: "execute", name: "PruneDockerBuilders" },
  prune_system: { route: "execute", name: "PruneSystem" },
  prune_volumes: { route: "execute", name: "PruneVolumes" },
  delete_image: { route: "execute", name: "DeleteImage" },
  delete_network: { route: "execute", name: "DeleteNetwork" },
  delete_volume: { route: "execute", name: "DeleteVolume" },
  // Swarm operations
  remove_swarm_nodes: { route: "execute", name: "RemoveSwarmNodes" },
  remove_swarm_services: { route: "execute", name: "RemoveSwarmServices" },
  remove_swarm_configs: { route: "execute", name: "RemoveSwarmConfigs" },
  remove_swarm_secrets: { route: "execute", name: "RemoveSwarmSecrets" },
  remove_swarm_stacks: { route: "execute", name: "RemoveSwarmStacks" },
  create_swarm_config: { route: "execute", name: "CreateSwarmConfig" },
  create_swarm_secret: { route: "execute", name: "CreateSwarmSecret" },
  rotate_swarm_config: { route: "execute", name: "RotateSwarmConfig" },
  rotate_swarm_secret: { route: "execute", name: "RotateSwarmSecret" },
  update_swarm_node: { route: "execute", name: "UpdateSwarmNode" },
  // Batch operations
  batch_run_build: { route: "execute", name: "BatchRunBuild" },
  batch_deploy_stack: { route: "execute", name: "BatchDeployStack" },
  batch_deploy_stack_if_changed: {
    route: "execute",
    name: "BatchDeployStackIfChanged",
  },
  batch_deploy: { route: "execute", name: "BatchDeploy" },
  batch_pull_stack: { route: "execute", name: "BatchPullStack" },
  batch_pull_repo: { route: "execute", name: "BatchPullRepo" },
  batch_build_repo: { route: "execute", name: "BatchBuildRepo" },
  batch_clone_repo: { route: "execute", name: "BatchCloneRepo" },
  batch_run_procedure: { route: "execute", name: "BatchRunProcedure" },
  batch_run_action: { route: "execute", name: "BatchRunAction" },
  batch_destroy_deployment: {
    route: "execute",
    name: "BatchDestroyDeployment",
  },
  batch_destroy_stack: { route: "execute", name: "BatchDestroyStack" },
  // Admin & misc
  backup_core_database: { route: "execute", name: "BackupCoreDatabase" },
  rotate_core_keys: { route: "execute", name: "RotateCoreKeys" },
  global_auto_update: { route: "execute", name: "GlobalAutoUpdate" },
  send_alert: { route: "execute", name: "SendAlert" },
  test_alerter: { route: "execute", name: "TestAlerter" },
};

// Maps resource_type to the summary RPC request name
export const SUMMARY_REQUEST_MAP: Partial<Record<ResourceType, string>> = {
  build: "GetBuildsSummary",
  deployment: "GetDeploymentsSummary",
  server: "GetServersSummary",
  stack: "GetStacksSummary",
  alerter: "GetAlertersSummary",
  procedure: "GetProceduresSummary",
  sync_resource: "GetResourceSyncsSummary",
  repo: "GetReposSummary",
  builder: "GetBuildersSummary",
  swarm: "GetSwarmsSummary",
  action: "GetActionsSummary",
};

// Maps inspect type to the inspect RPC request name.
// Server-scoped Docker objects also need an object param key (see
// INSPECT_PARAM_KEY below): Core v2.3.3 shapes are {server, container},
// {server, image}, {server, network}, {server, volume} — sending
// {id, server} fails with "duplicate field `server`".
export const INSPECT_PARAM_KEY: Record<string, string> = {
  container: "container",
  image: "image",
  network: "network",
  volume: "volume",
};

export const INSPECT_REQUEST_MAP: Record<string, string> = {
  container: "InspectContainer",
  image: "InspectImage",
  network: "InspectNetwork",
  volume: "InspectVolume",
  deployment_container: "InspectDeploymentContainer",
  deployment_swarm_service: "InspectDeploymentSwarmService",
  stack_container: "InspectStackContainer",
  stack_swarm_info: "InspectStackSwarmInfo",
  stack_swarm_service: "InspectStackSwarmService",
  swarm: "InspectSwarm",
  swarm_config: "InspectSwarmConfig",
  swarm_node: "InspectSwarmNode",
  swarm_secret: "InspectSwarmSecret",
  swarm_service: "InspectSwarmService",
  swarm_stack: "InspectSwarmStack",
  swarm_task: "InspectSwarmTask",
};

// Maps search log type to the RPC request name
export const SEARCH_LOG_REQUEST_MAP: Record<string, string> = {
  container: "SearchContainerLog",
  deployment: "SearchDeploymentLog",
  stack: "SearchStackLog",
  swarm_service: "SearchSwarmServiceLog",
};

// Maps list detail type to the RPC request name
export const LIST_DETAIL_REQUEST_MAP: Record<string, string> = {
  containers: "ListContainers",
  all_containers: "ListAllContainers",
  images: "ListImages",
  networks: "ListNetworks",
  volumes: "ListVolumes",
  system_processes: "ListSystemProcesses",
  schedules: "ListSchedules",
  permissions: "ListPermissions",
  api_keys: "ListApiKeys",
  api_keys_for_service_user: "ListApiKeysForServiceUser",
  onboarding_keys: "ListOnboardingKeys",
  secrets: "ListSecrets",
  updates: "ListUpdates",
  build_versions: "ListBuildVersions",
  compose_projects: "ListComposeProjects",
  user_target_permissions: "ListUserTargetPermissions",
  full_stacks: "ListFullStacks",
  full_builds: "ListFullBuilds",
  full_servers: "ListFullServers",
  full_deployments: "ListFullDeployments",
  full_procedures: "ListFullProcedures",
  full_repos: "ListFullRepos",
  full_builders: "ListFullBuilders",
  full_swarms: "ListFullSwarms",
  full_actions: "ListFullActions",
  full_alerters: "ListFullAlerters",
  full_resource_syncs: "ListFullResourceSyncs",
  // Swarm detail lists
  swarm_configs: "ListSwarmConfigs",
  swarm_networks: "ListSwarmNetworks",
  swarm_nodes: "ListSwarmNodes",
  swarm_secrets: "ListSwarmSecrets",
  swarm_services: "ListSwarmServices",
  swarm_stacks: "ListSwarmStacks",
  swarm_tasks: "ListSwarmTasks",
  // Config lists
  git_providers_from_config: "ListGitProvidersFromConfig",
  image_registries_from_config: "ListImageRegistriesFromConfig",
  // Extra args
  common_build_extra_args: "ListCommonBuildExtraArgs",
  common_deployment_extra_args: "ListCommonDeploymentExtraArgs",
  common_stack_build_extra_args: "ListCommonStackBuildExtraArgs",
  common_stack_extra_args: "ListCommonStackExtraArgs",
  // Other
  image_history: "ListImageHistory",
  all_stack_services: "ListAllStackServices",
};

// Maps copy resource type to the Copy* RPC request name
export const COPY_REQUEST_MAP: Record<string, string> = {
  stack: "CopyStack",
  build: "CopyBuild",
  server: "CopyServer",
  deployment: "CopyDeployment",
  procedure: "CopyProcedure",
  alerter: "CopyAlerter",
  action: "CopyAction",
  repo: "CopyRepo",
  builder: "CopyBuilder",
  swarm: "CopySwarm",
  sync_resource: "CopyResourceSync",
};

// Maps rename resource type to the Rename* RPC request name
export const RENAME_REQUEST_MAP: Record<string, string> = {
  stack: "RenameStack",
  build: "RenameBuild",
  server: "RenameServer",
  deployment: "RenameDeployment",
  procedure: "RenameProcedure",
  alerter: "RenameAlerter",
  action: "RenameAction",
  repo: "RenameRepo",
  builder: "RenameBuilder",
  swarm: "RenameSwarm",
  tag: "RenameTag",
  user_group: "RenameUserGroup",
};

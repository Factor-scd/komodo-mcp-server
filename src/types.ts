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
  "execution",
  "access_request",
]);
export type ResourceType = z.infer<typeof ResourceType>;

export const ExecuteOperation = z.enum([
  "run_build",
  "deploy_stack",
  "deploy_stack_service",
  "run_procedure",
  "run_procedure_stage",
  "run_deployment_action",
  "run_deployment_sync",
  "run_resource_sync",
  "run_stack_refresh_cache",
  "run_stack_refresh_content",
  "run_stack_pull",
  "run_stack_pull_deployment",
  "run_stack_stop",
  "run_stack_restart",
  "run_stack_pause",
  "run_stack_unpause",
  "run_stack_remove_orphan_containers",
  "run_stack_toggle_service_dependencies",
  "run_stack_auto_update",
  "run_stack_commit",
  "run_server_refresh",
  "run_server_refresh_containers",
  "run_server_update_periphery",
  "run_server_prune_images",
  "run_server_prune_containers",
  "run_server_prune_networks",
  "run_server_stats",
  "run_server_run_command",
  "run_server_scripts",
  "run_server_copy",
  "run_server_move",
  "run_deployment_execute",
  "run_deployment_redeploy",
  "run_deployment_destroy",
  "run_deployment_stop",
  "run_deployment_logs",
  "run_sync_deployment",
  "get_mcp_token",
]);
export type ExecuteOperation = z.infer<typeof ExecuteOperation>;

// Maps resource_type to the list/search RPC request name
export const LIST_REQUEST_MAP: Record<ResourceType, string> = {
  stack: "ListStacks",
  build: "ListBuilds",
  server: "ListServers",
  procedure: "ListProcedures",
  deployment: "ListDeployments",
  alerter: "ListAlerters",
  image_registry_account: "ListImageRegistryAccounts",
  sync_resource: "ListSyncResources",
  user: "ListUsers",
  tag: "ListTags",
  execution: "ListExecutions",
  access_request: "ListAccessRequests",
};

// Maps resource_type to the search RPC request name
export const SEARCH_REQUEST_MAP: Record<ResourceType, string> = {
  stack: "SearchStacks",
  build: "SearchBuilds",
  server: "SearchServers",
  procedure: "SearchProcedures",
  deployment: "SearchDeployments",
  alerter: "SearchAlerters",
  image_registry_account: "SearchImageRegistryAccounts",
  sync_resource: "SearchSyncResources",
  user: "ListUsers",
  tag: "ListTags",
  execution: "ListExecutions",
  access_request: "ListAccessRequests",
};

// Maps resource_type to the get RPC request name
export const GET_REQUEST_MAP: Record<ResourceType, string> = {
  stack: "GetStack",
  build: "GetBuild",
  server: "GetServer",
  procedure: "GetProcedure",
  deployment: "GetDeployment",
  alerter: "GetAlerter",
  image_registry_account: "GetImageRegistryAccount",
  sync_resource: "GetSyncResource",
  user: "GetUser",
  tag: "GetTag",
  execution: "GetExecution",
  access_request: "GetAccessRequest",
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
  sync_resource: "CreateSyncResource",
  tag: "AddTag",
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
  sync_resource: "UpdateSyncResource",
  user: "UpdateUser",
  tag: "UpdateTag",
};

// Maps resource_type to the delete RPC request name
export const DELETE_REQUEST_MAP: Partial<Record<ResourceType, string>> = {
  stack: "DeleteStack",
  build: "DeleteBuild",
  server: "DeleteServer",
  procedure: "DeleteProcedure",
  deployment: "DeleteDeployment",
  alerter: "DeleteAlerter",
  sync_resource: "DeleteSyncResource",
  tag: "DeleteTag",
};

// Maps execute operation to the RPC request name and the route
export const EXECUTE_REQUEST_MAP: Record<
  ExecuteOperation,
  { route: "execute" | "read" | "write"; name: string }
> = {
  run_build: { route: "execute", name: "RunBuild" },
  deploy_stack: { route: "execute", name: "DeployStack" },
  deploy_stack_service: { route: "execute", name: "DeployStackService" },
  run_procedure: { route: "execute", name: "RunProcedure" },
  run_procedure_stage: { route: "execute", name: "RunProcedureStage" },
  run_deployment_action: { route: "execute", name: "RunDeploymentAction" },
  run_deployment_sync: { route: "execute", name: "RunDeploymentSync" },
  run_resource_sync: { route: "execute", name: "RunResourceSync" },
  run_stack_refresh_cache: {
    route: "execute",
    name: "RunStackRefreshCache",
  },
  run_stack_refresh_content: {
    route: "execute",
    name: "RunStackRefreshContent",
  },
  run_stack_pull: { route: "execute", name: "RunStackPull" },
  run_stack_pull_deployment: {
    route: "execute",
    name: "RunStackPullDeployment",
  },
  run_stack_stop: { route: "execute", name: "RunStackStop" },
  run_stack_restart: { route: "execute", name: "RunStackRestart" },
  run_stack_pause: { route: "execute", name: "RunStackPause" },
  run_stack_unpause: { route: "execute", name: "RunStackUnpause" },
  run_stack_remove_orphan_containers: {
    route: "execute",
    name: "RunStackRemoveOrphanContainers",
  },
  run_stack_toggle_service_dependencies: {
    route: "execute",
    name: "RunStackToggleServiceDependencies",
  },
  run_stack_auto_update: { route: "execute", name: "RunStackAutoUpdate" },
  run_stack_commit: { route: "execute", name: "RunStackCommit" },
  run_server_refresh: { route: "execute", name: "RunServerRefresh" },
  run_server_refresh_containers: {
    route: "execute",
    name: "RunServerRefreshContainers",
  },
  run_server_update_periphery: {
    route: "execute",
    name: "RunServerUpdatePeriphery",
  },
  run_server_prune_images: {
    route: "execute",
    name: "RunServerPruneImages",
  },
  run_server_prune_containers: {
    route: "execute",
    name: "RunServerPruneContainers",
  },
  run_server_prune_networks: {
    route: "execute",
    name: "RunServerPruneNetworks",
  },
  run_server_stats: { route: "execute", name: "RunServerStats" },
  run_server_run_command: {
    route: "execute",
    name: "RunServerRunCommand",
  },
  run_server_scripts: { route: "execute", name: "RunServerScripts" },
  run_server_copy: { route: "execute", name: "RunServerCopy" },
  run_server_move: { route: "execute", name: "RunServerMove" },
  run_deployment_execute: {
    route: "execute",
    name: "RunDeploymentExecute",
  },
  run_deployment_redeploy: {
    route: "execute",
    name: "RunDeploymentRedeploy",
  },
  run_deployment_destroy: {
    route: "execute",
    name: "RunDeploymentDestroy",
  },
  run_deployment_stop: { route: "execute", name: "RunDeploymentStop" },
  run_deployment_logs: { route: "execute", name: "RunDeploymentLogs" },
  run_sync_deployment: { route: "execute", name: "RunSyncDeployment" },
  get_mcp_token: { route: "execute", name: "GetMcpToken" },
};

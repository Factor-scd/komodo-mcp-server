#!/usr/bin/env tsx
/**
 * Auto-generates mapping tables in src/types.ts from komodo_client package types.
 *
 * Run: npm run generate-types
 *
 * Parses the package's .d.ts files to extract request name literals from the
 * ReadRequest, WriteRequest, ExecuteRequest discriminated unions, then derives
 * resource-type → request-name mappings using Komodo's naming conventions.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const PKG_TYPES = resolve(
  import.meta.dirname,
  "../node_modules/komodo_client/dist/types.d.ts",
);
const PKG_RESPONSES = resolve(
  import.meta.dirname,
  "../node_modules/komodo_client/dist/responses.d.ts",
);
const OUT = resolve(import.meta.dirname, "../src/types.ts");

// ── Parse type literals from a discriminated union ──────────────────────────

function extractTypeLiterals(fileContent: string, unionName: string): string[] {
  // Find the union: "export type ReadRequest = { type: "Foo"; ... } | { type: "Bar"; ... }"
  const regex = new RegExp(
    `export type ${unionName} =([\\s\\S]*?)(?=\\nexport |$)`,
  );
  const match = fileContent.match(regex);
  if (!match) throw new Error(`Could not find union ${unionName}`);

  const body = match[1];
  const literals: string[] = [];
  const typeRegex = /type:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = typeRegex.exec(body)) !== null) {
    literals.push(m[1]);
  }
  return literals;
}

// ── Parse response map keys ─────────────────────────────────────────────────

function extractResponseKeys(
  fileContent: string,
  mapName: string,
): string[] {
  const regex = new RegExp(
    `export type ${mapName} =([\\s\\S]*?)(?=\\nexport |$)`,
  );
  const match = fileContent.match(regex);
  if (!match) throw new Error(`Could not find response map ${mapName}`);

  const body = match[1];
  const keys: string[] = [];
  const keyRegex = /(\w+):\s*/g;
  let m: RegExpExecArray | null;
  while ((m = keyRegex.exec(body)) !== null) {
    keys.push(m[1]);
  }
  return keys;
}

// ── Resource type mapping rules ─────────────────────────────────────────────

// Maps Komodo PascalCase resource names to our snake_case resource types.
// Only resources that have List*/Get*/Create*/Update*/Delete* endpoints qualify.
const RESOURCE_NAME_TO_TYPE: Record<string, string> = {
  Stack: "stack",
  Build: "build",
  Server: "server",
  Procedure: "procedure",
  Deployment: "deployment",
  Alerter: "alerter",
  ImageRegistryAccount: "image_registry_account",
  ResourceSync: "sync_resource",
  User: "user",
  Tag: "tag",
  Action: "action",
  Repo: "repo",
  Builder: "builder",
  Swarm: "swarm",
  Variable: "variable",
  UserGroup: "user_group",
  GitProviderAccount: "git_provider_account",
};

function deriveResourceType(requestName: string): string | null {
  for (const [pascal, snake] of Object.entries(RESOURCE_NAME_TO_TYPE)) {
    if (requestName === `List${pascal}s`) return snake;
    if (requestName === `Get${pascal}`) return snake;
    if (requestName === `Create${pascal}`) return snake;
    if (requestName === `Update${pascal}`) return snake;
    if (requestName === `Delete${pascal}`) return snake;
    if (requestName === `Copy${pascal}`) return snake;
    if (requestName === `Rename${pascal}`) return snake;
    if (requestName === `Get${pascal}sSummary`) return snake;
  }
  return null;
}

// ── Main ────────────────────────────────────────────────────────────────────

function main() {
  const typesContent = readFileSync(PKG_TYPES, "utf-8");
  const responsesContent = readFileSync(PKG_RESPONSES, "utf-8");

  const readRequests = extractTypeLiterals(typesContent, "ReadRequest");
  const writeRequests = extractTypeLiterals(typesContent, "WriteRequest");
  const executeRequests = extractTypeLiterals(typesContent, "ExecuteRequest");

  // ── LIST_REQUEST_MAP ────────────────────────────────────────────────────
  const listEntries: [string, string][] = [];
  for (const name of readRequests) {
    const resourceType = deriveResourceType(name);
    if (resourceType && name.startsWith("List") && !name.startsWith("ListFull")) {
      listEntries.push([resourceType, name]);
    }
  }

  // ── GET_REQUEST_MAP ─────────────────────────────────────────────────────
  const getEntries: [string, string][] = [];
  for (const name of readRequests) {
    const resourceType = deriveResourceType(name);
    if (resourceType && name.startsWith("Get") && !name.endsWith("Summary") && !name.endsWith("ActionState")) {
      getEntries.push([resourceType, name]);
    }
  }

  // ── CREATE_REQUEST_MAP ──────────────────────────────────────────────────
  const createEntries: [string, string][] = [];
  for (const name of writeRequests) {
    const resourceType = deriveResourceType(name);
    if (resourceType && name.startsWith("Create")) {
      createEntries.push([resourceType, name]);
    }
  }

  // ── UPDATE_REQUEST_MAP ──────────────────────────────────────────────────
  // Special cases where the update name doesn't follow Update{Resource}
  const UPDATE_OVERRIDES: Record<string, string> = {
    tag: "UpdateTagColor",
    variable: "UpdateVariableValue",
  };
  const updateEntries: [string, string][] = [];
  for (const name of writeRequests) {
    if (name.startsWith("Update") && !name.startsWith("UpdateResourceMeta") &&
        !name.startsWith("UpdateServerPublicKey") && !name.startsWith("UpdateOnboardingKey") &&
        !name.startsWith("UpdateUser") && !name.startsWith("UpdatePermission") &&
        !name.startsWith("UpdateVariableDescription") && !name.startsWith("UpdateVariableIsSecret") &&
        !name.startsWith("UpdateGitProviderAccount") && !name.startsWith("UpdateImageRegistryAccount")) {
      const resourceType = deriveResourceType(name);
      if (resourceType) {
        updateEntries.push([resourceType, name]);
      }
    }
  }
  // Apply overrides
  for (const [rt, name] of Object.entries(UPDATE_OVERRIDES)) {
    const idx = updateEntries.findIndex(([r]) => r === rt);
    if (idx >= 0) updateEntries[idx][1] = name;
    else updateEntries.push([rt, name]);
  }

  // ── DELETE_REQUEST_MAP ──────────────────────────────────────────────────
  const deleteEntries: [string, string][] = [];
  for (const name of writeRequests) {
    const resourceType = deriveResourceType(name);
    if (resourceType && name.startsWith("Delete")) {
      deleteEntries.push([resourceType, name]);
    }
  }

  // ── EXECUTE_REQUEST_MAP ─────────────────────────────────────────────────
  const EXECUTE_OVERRIDES: Record<string, { route: string; name: string }> = {
    run_build: { route: "execute", name: "RunBuild" },
    deploy_stack_service: { route: "execute", name: "RunStackService" },
    run_server_prune_images: { route: "execute", name: "PruneImages" },
    run_server_prune_containers: { route: "execute", name: "PruneContainers" },
    run_server_prune_networks: { route: "execute", name: "PruneNetworks" },
  };

  const executeEntries: [string, { route: string; name: string }][] = [];
  for (const name of executeRequests) {
    // Convert PascalCase to snake_case for the operation name
    const snake = name
      .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
      .toLowerCase();

    // Check overrides first
    if (EXECUTE_OVERRIDES[snake]) {
      executeEntries.push([snake, EXECUTE_OVERRIDES[snake]]);
      continue;
    }

    // Default: route is "execute", name is the PascalCase name
    executeEntries.push([snake, { route: "execute", name }]);
  }

  // ── SUMMARY_REQUEST_MAP ─────────────────────────────────────────────────
  const summaryEntries: [string, string][] = [];
  for (const name of readRequests) {
    if (name.endsWith("Summary")) {
      const resourceType = deriveResourceType(name);
      if (resourceType) {
        summaryEntries.push([resourceType, name]);
      }
    }
  }

  // ── INSPECT maps ──────────────────────────────────────────────────────
  // INSPECT_PARAM_KEY: snake_case type → param key for server-scoped Docker objects
  // INSPECT_REQUEST_MAP: snake_case type → request name
  const INSPECT_PARAM_ENTRIES: [string, string][] = [
    ["container", "container"],
    ["image", "image"],
    ["network", "network"],
    ["volume", "volume"],
  ];
  const INSPECT_REQUEST_ENTRIES: [string, string][] = [
    ["container", "InspectContainer"],
    ["image", "InspectImage"],
    ["network", "InspectNetwork"],
    ["volume", "InspectVolume"],
    ["deployment_container", "InspectDeploymentContainer"],
    ["deployment_swarm_service", "InspectDeploymentSwarmService"],
    ["stack_container", "InspectStackContainer"],
    ["stack_swarm_info", "InspectStackSwarmInfo"],
    ["stack_swarm_service", "InspectStackSwarmService"],
    ["swarm", "InspectSwarm"],
    ["swarm_config", "InspectSwarmConfig"],
    ["swarm_node", "InspectSwarmNode"],
    ["swarm_secret", "InspectSwarmSecret"],
    ["swarm_service", "InspectSwarmService"],
    ["swarm_stack", "InspectSwarmStack"],
    ["swarm_task", "InspectSwarmTask"],
  ];

  // ── SEARCH_LOG_REQUEST_MAP ──────────────────────────────────────────────
  const SEARCH_LOG_MAP: Record<string, string> = {
    container: "SearchContainerLog",
    deployment: "SearchDeploymentLog",
    stack: "SearchStackLog",
    swarm_service: "SearchSwarmServiceLog",
  };
  const searchLogEntries = Object.entries(SEARCH_LOG_MAP);

  // ── LIST_DETAIL_REQUEST_MAP ─────────────────────────────────────────────
  // These are the "extra" list endpoints that don't map to a resource type
  const LIST_DETAIL_OVERRIDES: Record<string, string> = {
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
    swarm_configs: "ListSwarmConfigs",
    swarm_networks: "ListSwarmNetworks",
    swarm_nodes: "ListSwarmNodes",
    swarm_secrets: "ListSwarmSecrets",
    swarm_services: "ListSwarmServices",
    swarm_stacks: "ListSwarmStacks",
    swarm_tasks: "ListSwarmTasks",
    git_providers_from_config: "ListGitProvidersFromConfig",
    image_registries_from_config: "ListImageRegistriesFromConfig",
    common_build_extra_args: "ListCommonBuildExtraArgs",
    common_deployment_extra_args: "ListCommonDeploymentExtraArgs",
    common_stack_build_extra_args: "ListCommonStackBuildExtraArgs",
    common_stack_extra_args: "ListCommonStackExtraArgs",
    image_history: "ListImageHistory",
    all_stack_services: "ListAllStackServices",
  };
  const listDetailEntries = Object.entries(LIST_DETAIL_OVERRIDES);

  // ── COPY_REQUEST_MAP ────────────────────────────────────────────────────
  const copyEntries: [string, string][] = [];
  for (const name of writeRequests) {
    const resourceType = deriveResourceType(name);
    if (resourceType && name.startsWith("Copy")) {
      copyEntries.push([resourceType, name]);
    }
  }

  // ── RENAME_REQUEST_MAP ──────────────────────────────────────────────────
  const renameEntries: [string, string][] = [];
  for (const name of writeRequests) {
    if (name.startsWith("Rename")) {
      const resourceType = deriveResourceType(name);
      if (resourceType) {
        renameEntries.push([resourceType, name]);
      }
    }
  }

  // ── Generate output ─────────────────────────────────────────────────────
  const out = `import { z } from "zod";

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
  ${executeEntries.map(([k]) => `"${k}"`).join(",\n  ")}
]);
export type ExecuteOperation = z.infer<typeof ExecuteOperation>;

// ── Auto-generated from komodo_client package types ────────────────────────
// Run \`npm run generate-types\` to re-sync with upstream API.

export const LIST_REQUEST_MAP: Record<ResourceType, string> = {
  ${sortEntries(listEntries).map(([k, v]) => `${k}: "${v}"`).join(",\n  ")}
};

export const SEARCH_REQUEST_MAP: Partial<Record<ResourceType, string>> = {
  ${sortEntries(listEntries.filter(([k]) => ["stack", "build", "server", "procedure", "deployment", "alerter", "image_registry_account", "sync_resource"].includes(k))).map(([k, v]) => `${k}: "${v}"`).join(",\n  ")}
};

export const GET_REQUEST_MAP: Partial<Record<ResourceType, string>> = {
  ${sortEntries(getEntries).map(([k, v]) => `${k}: "${v}"`).join(",\n  ")}
};

export const CREATE_REQUEST_MAP: Partial<Record<ResourceType, string>> = {
  ${sortEntries(createEntries).map(([k, v]) => `${k}: "${v}"`).join(",\n  ")}
};

export const UPDATE_REQUEST_MAP: Partial<Record<ResourceType, string>> = {
  ${sortEntries(updateEntries).map(([k, v]) => `${k}: "${v}"`).join(",\n  ")}
};

export const DELETE_REQUEST_MAP: Partial<Record<ResourceType, string>> = {
  ${sortEntries(deleteEntries).map(([k, v]) => `${k}: "${v}"`).join(",\n  ")}
};

export const EXECUTE_REQUEST_MAP: Record<
  ExecuteOperation,
  { route: "execute" | "read" | "write"; name: string }
> = {
  ${sortEntries(executeEntries).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(",\n  ")}
};

export const SUMMARY_REQUEST_MAP: Partial<Record<ResourceType, string>> = {
  ${sortEntries(summaryEntries).map(([k, v]) => `${k}: "${v}"`).join(",\n  ")}
};

export const INSPECT_PARAM_KEY: Record<string, string> = {
  ${INSPECT_PARAM_ENTRIES.map(([k, v]) => `${k}: "${v}"`).join(",\n  ")}
};

export const INSPECT_REQUEST_MAP: Record<string, string> = {
  ${INSPECT_REQUEST_ENTRIES.map(([k, v]) => `${k}: "${v}"`).join(",\n  ")}
};

export const SEARCH_LOG_REQUEST_MAP: Record<string, string> = {
  ${searchLogEntries.map(([k, v]) => `${k}: "${v}"`).join(",\n  ")}
};

export const LIST_DETAIL_REQUEST_MAP: Record<string, string> = {
  ${listDetailEntries.map(([k, v]) => `${k}: "${v}"`).join(",\n  ")}
};

export const COPY_REQUEST_MAP: Record<string, string> = {
  ${sortEntries(copyEntries).map(([k, v]) => `${k}: "${v}"`).join(",\n  ")}
};

export const RENAME_REQUEST_MAP: Record<string, string> = {
  ${sortEntries(renameEntries).map(([k, v]) => `${k}: "${v}"`).join(",\n  ")}
};
`;

  writeFileSync(OUT, out, "utf-8");

  // Summary
  console.log(`Generated ${OUT}`);
  console.log(`  ReadRequest variants:    ${readRequests.length}`);
  console.log(`  WriteRequest variants:   ${writeRequests.length}`);
  console.log(`  ExecuteRequest variants: ${executeRequests.length}`);
  console.log(`  LIST_REQUEST_MAP:        ${listEntries.length} entries`);
  console.log(`  GET_REQUEST_MAP:         ${getEntries.length} entries`);
  console.log(`  CREATE_REQUEST_MAP:      ${createEntries.length} entries`);
  console.log(`  UPDATE_REQUEST_MAP:      ${updateEntries.length} entries`);
  console.log(`  DELETE_REQUEST_MAP:      ${deleteEntries.length} entries`);
  console.log(`  EXECUTE_REQUEST_MAP:     ${executeEntries.length} entries`);
  console.log(`  SUMMARY_REQUEST_MAP:     ${summaryEntries.length} entries`);
  console.log(`  INSPECT_REQUEST_MAP:     ${INSPECT_REQUEST_ENTRIES.length} entries`);
  console.log(`  COPY_REQUEST_MAP:        ${copyEntries.length} entries`);
  console.log(`  RENAME_REQUEST_MAP:      ${renameEntries.length} entries`);
}

function sortEntries(entries: [string, string][]): [string, string][] {
  return [...entries].sort(([a], [b]) => a.localeCompare(b));
}

main();

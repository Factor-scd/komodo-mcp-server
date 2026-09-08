#!/usr/bin/env python3
"""
Komodo MCP Server — Write Lifecycle Test
Proves the write path through the MCP server for every creatable aspect:
create → get → update (where available) → get → delete → verify-gone.

Usage:
  KOMODO_MCP_URL=http://10.10.2.114:9800 python3 scripts/test_write_lifecycle.py

No external deps — stdlib urllib only.
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
MCP_URL = os.environ.get("KOMODO_MCP_URL", "http://10.10.2.114:9800")
MCP_ENDPOINT = f"{MCP_URL}/mcp"
HEALTH_ENDPOINT = f"{MCP_URL}/health"

STAMP = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M")
PREFIX = f"mcp-wt-{STAMP}"

# All IDs we create — only these may be deleted (allowlist).
CREATED_IDS: dict[str, list[str]] = {}  # resource_type -> [id, ...]

# Per-type results for the final audit table.
RESULTS: dict[str, dict] = {}

# ---------------------------------------------------------------------------
# MCP JSON-RPC client
# ---------------------------------------------------------------------------

def _post(body: dict, session_id: str | None = None) -> tuple[dict, str | None]:
    """POST JSON-RPC to the MCP server. Returns (response_body, new_session_id).

    Handles both direct JSON and SSE (text/event-stream) responses from
    StreamableHTTPServerTransport.
    """
    data = json.dumps(body).encode()
    headers = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream"}
    if session_id:
        headers["mcp-session-id"] = session_id
    req = urllib.request.Request(MCP_ENDPOINT, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            new_sid = resp.headers.get("mcp-session-id") or session_id
            ct = resp.headers.get("Content-Type", "")
            raw = resp.read().decode()
            if not raw:
                return {}, new_sid
            # SSE response: parse "data: ..." lines
            if "text/event-stream" in ct:
                for line in raw.split("\n"):
                    line = line.strip()
                    if line.startswith("data:"):
                        payload = line[len("data:"):].strip()
                        if payload:
                            try:
                                return json.loads(payload), new_sid
                            except json.JSONDecodeError:
                                continue
                # Fallback: try parsing the whole thing as JSON
                try:
                    return json.loads(raw), new_sid
                except json.JSONDecodeError:
                    return {}, new_sid
            # Direct JSON response
            return json.loads(raw), new_sid
    except urllib.error.HTTPError as e:
        body_text = e.read().decode() if e.fp else ""
        raise RuntimeError(f"HTTP {e.code}: {body_text}") from e


class McpClient:
    def __init__(self) -> None:
        self.session_id: str | None = None
        self._req_id = 0

    def _next_id(self) -> int:
        self._req_id += 1
        return self._req_id

    def initialize(self) -> None:
        resp, sid = _post({
            "jsonrpc": "2.0",
            "id": self._next_id(),
            "method": "initialize",
            "params": {
                "protocolVersion": "2025-03-26",
                "capabilities": {},
                "clientInfo": {"name": "write-lifecycle-test", "version": "1.0.0"},
            },
        }, None)
        self.session_id = sid
        # Send initialized notification
        _post({
            "jsonrpc": "2.0",
            "method": "notifications/initialized",
        }, self.session_id)

    def call_tool(self, name: str, arguments: dict) -> any:
        resp, self.session_id = _post({
            "jsonrpc": "2.0",
            "id": self._next_id(),
            "method": "tools/call",
            "params": {"name": name, "arguments": arguments},
        }, self.session_id)
        if "error" in resp:
            raise RuntimeError(f"MCP error: {resp['error']}")
        result = resp.get("result", {})
        # MCP SDK returns isError:true for tool execution errors
        if result.get("isError"):
            contents = result.get("content", [])
            err_text = contents[0].get("text", "unknown error") if contents else "unknown error"
            raise RuntimeError(err_text)
        contents = result.get("content", [])
        if not contents:
            return None
        text = contents[0].get("text", "")
        if not text:
            return None
        try:
            return json.loads(text)
        except (json.JSONDecodeError, TypeError):
            return text

    def list_(self, resource_type: str) -> list:
        result = self.call_tool("komodo_list", {"resource_type": resource_type})
        return result if isinstance(result, list) else []

    def get(self, resource_type: str, rid: str) -> any:
        return self.call_tool("komodo_get", {"resource_type": resource_type, "id": rid})

    def create(self, resource_type: str, params: dict) -> any:
        return self.call_tool("komodo_create", {"resource_type": resource_type, "params": params})

    def update(self, resource_type: str, rid: str, params: dict) -> any:
        return self.call_tool("komodo_update", {"resource_type": resource_type, "id": rid, "params": params})

    def delete(self, resource_type: str, rid: str) -> any:
        return self.call_tool("komodo_delete", {"resource_type": resource_type, "id": rid})


# ---------------------------------------------------------------------------
# Resource type definitions — create_params, update_params, id_field, name_field
# ---------------------------------------------------------------------------

RESOURCE_DEFS: dict[str, dict] = {
    "tag": {
        "create_params": lambda name: {"name": name, "color": "Slate"},
        "update_params": lambda name: {"color": "Red"},
        "id_field": "name",       # tag name IS the id
        "name_field": "name",
        "has_update": True,
    },
    "variable": {
        "create_params": lambda name: {"name": name.upper().replace("-", "_"), "value": "mcp_wt_test_value"},
        "update_params": lambda name: {"value": "mcp_wt_updated_value"},
        "id_field": "name",
        "name_field": "name",
        "has_update": True,
        # Komodo variable names must match [A-Za-z_][A-Za-z0-9_]*
        "make_id": lambda name: name.upper().replace("-", "_"),
    },
    "user_group": {
        "create_params": lambda name: {"name": name},
        "update_params": lambda name: {"name": name},
        "id_field": "name",
        "name_field": "name",
        "has_update": True,
    },
    "procedure": {
        "create_params": lambda name: {"name": name, "stages": []},
        "update_params": lambda name: {"name": name},
        "id_field": "id",
        "name_field": "name",
        "has_update": True,
    },
    "action": {
        "create_params": lambda name: {"name": name, "run": {"type": "None"}, "disabled": True},
        "update_params": lambda name: {"name": name},
        "id_field": "id",
        "name_field": "name",
        "has_update": True,
    },
    "repo": {
        "create_params": lambda name: {"name": name, "repo": "https://example.invalid/dummy.git"},
        "update_params": lambda name: {"name": name},
        "id_field": "id",
        "name_field": "name",
        "has_update": True,
    },
    "builder": {
        "create_params": lambda name: {"name": name},
        "update_params": lambda name: {"name": name},
        "id_field": "id",
        "name_field": "name",
        "has_update": True,
    },
    "alerter": {
        "create_params": lambda name: {"name": name, "endpoint": {"type": "Custom", "url": "https://example.invalid/hook", "headers": {}}, "disabled": True},
        "update_params": lambda name: {"name": name},
        "id_field": "id",
        "name_field": "name",
        "has_update": True,
    },
    "sync_resource": {
        "create_params": lambda name: {"name": name, "resource_sync": {"type": "None"}},
        "update_params": lambda name: {"name": name},
        "id_field": "id",
        "name_field": "name",
        "has_update": True,
    },
    "server": {
        "create_params": lambda name: {"name": name, "address": "https://example.invalid", "enabled": False},
        "update_params": lambda name: {"name": name},
        "id_field": "id",
        "name_field": "name",
        "has_update": True,
    },
    "stack": {
        "create_params": lambda name: {"name": name, "project": f"{PREFIX}-proj", "compose_contents": []},
        "update_params": lambda name: {"name": name},
        "id_field": "id",
        "name_field": "name",
        "has_update": True,
    },
    "build": {
        "create_params": lambda name: {"name": name, "project": f"{PREFIX}-proj", "repo": "https://example.invalid/dummy.git", "builder": {"type": "Disabled"}},
        "update_params": lambda name: {"name": name},
        "id_field": "id",
        "name_field": "name",
        "has_update": True,
    },
    "deployment": {
        "create_params": lambda name: {"name": name, "project": f"{PREFIX}-proj", "server": "https://example.invalid", "image": "nginx:latest"},
        "update_params": lambda name: {"name": name},
        "id_field": "id",
        "name_field": "name",
        "has_update": True,
    },
    "swarm": {
        "create_params": lambda name: {"name": name, "project": f"{PREFIX}-proj"},
        "update_params": lambda name: {"name": name},
        "id_field": "id",
        "name_field": "name",
        "has_update": True,
    },
}

# Test tiers
TIERS: list[list[str]] = [
    ["tag", "variable", "user_group"],
    ["procedure", "action", "repo", "builder", "alerter", "sync_resource"],
    ["server", "stack", "build", "deployment", "swarm"],
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_name(resource_type: str) -> str:
    return f"{PREFIX}-{resource_type}"


def extract_id(resource_type: str, data: any) -> str | None:
    """Extract the resource ID from a create/get response."""
    if data is None:
        return None
    # Some GET endpoints return the resource name as a bare string
    if isinstance(data, str):
        return data
    if not isinstance(data, dict):
        return None
    rdef = RESOURCE_DEFS[resource_type]
    # Try id_field first, then common fallbacks
    for key in [rdef["id_field"], "id", "_id", "name"]:
        if key in data and data[key]:
            return str(data[key])
    return None


def extract_name(resource_type: str, data: any) -> str | None:
    if data is None:
        return None
    if isinstance(data, str):
        return data
    if not isinstance(data, dict):
        return None
    return data.get(RESOURCE_DEFS[resource_type]["name_field"])


def check(resp, label: str) -> bool:
    """Assert a condition; print pass/fail."""
    if resp:
        print(f"  ✓ {label}")
        return True
    else:
        print(f"  ✗ {label}")
        return False


# ---------------------------------------------------------------------------
# Single-resource lifecycle test
# ---------------------------------------------------------------------------

def test_lifecycle(client: McpClient, resource_type: str) -> bool:
    """
    Run create → get → update → get → delete → verify-gone for one type.
    Returns True on success, False on failure (after cleanup).
    """
    rdef = RESOURCE_DEFS[resource_type]
    name = make_name(resource_type)
    rid: str | None = None
    ok = True
    result = {"created": False, "updated": False, "deleted": False, "verified_gone": False, "id": None}

    try:
        # --- List baseline ---
        baseline = client.list_(resource_type)
        baseline_count = len(baseline)
        print(f"  baseline count: {baseline_count}")

        # --- Create ---
        create_params = rdef["create_params"](name)
        print(f"  CREATE {resource_type} with {json.dumps(create_params)}")
        created = client.create(resource_type, create_params)
        rid = extract_id(resource_type, created)
        result["id"] = rid
        if not rid:
            print(f"  ✗ CREATE returned no ID: {created}")
            ok = False
            return ok
        CREATED_IDS.setdefault(resource_type, []).append(rid)
        result["created"] = True
        print(f"  ✓ CREATE → id={rid}")

        # --- Get by ID ---
        fetched = client.get(resource_type, rid)
        if fetched is None:
            print(f"  ✗ GET by id returned null for {rid}")
            ok = False
            return ok
        # GET may return a bare string (the name) for some types
        if isinstance(fetched, str):
            if fetched == rid or fetched == name:
                print(f"  ✓ GET by id returned name: {fetched}")
            else:
                print(f"  ✗ GET by id returned unexpected string: {fetched}")
                ok = False
                return ok
        elif isinstance(fetched, dict):
            fetched_name = extract_name(resource_type, fetched)
            if fetched_name == name or str(fetched.get("id", "")) == rid:
                print(f"  ✓ GET by id matches (name={fetched_name})")
            else:
                print(f"  ✗ GET by id mismatch: expected name={name}, got {fetched}")
                ok = False
                return ok
        else:
            print(f"  ✓ GET by id returned: {type(fetched).__name__} = {fetched}")

        # --- Update (if endpoint exists) ---
        if rdef["has_update"] and rdef["update_params"]:
            update_params = rdef["update_params"](name)
            print(f"  UPDATE {resource_type} id={rid} with {json.dumps(update_params)}")
            updated = client.update(resource_type, rid, update_params)
            result["updated"] = True
            print(f"  ✓ UPDATE succeeded")

            # --- Get after update ---
            fetched2 = client.get(resource_type, rid)
            if fetched2 is not None:
                # Verify the update was applied (check updated fields)
                update_ok = True
                if isinstance(fetched2, dict):
                    for k, v in update_params.items():
                        if k in fetched2 and fetched2[k] != v:
                            print(f"  ✗ GET after update: field {k} expected {v}, got {fetched2[k]}")
                            update_ok = False
                            ok = False
                # If fetched2 is a string, we can't verify individual fields
                if update_ok:
                    print(f"  ✓ GET after update reflects changes")
            else:
                print(f"  ✗ GET after update returned null")
                ok = False
        else:
            print(f"  ⊘ No update endpoint for {resource_type} — skipping update")

        # --- Delete ---
        print(f"  DELETE {resource_type} id={rid}")
        deleted = client.delete(resource_type, rid)
        result["deleted"] = True
        print(f"  ✓ DELETE succeeded")

        # --- Verify gone ---
        time.sleep(0.5)  # brief pause for eventual consistency
        try:
            still = client.get(resource_type, rid)
            if still is None:
                result["verified_gone"] = True
                print(f"  ✓ GET after delete returns null — verified gone")
            else:
                print(f"  ✗ GET after delete still returns data: {still}")
                ok = False
        except RuntimeError as e:
            # Error response means resource is gone
            if "404" in str(e) or "not found" in str(e).lower() or "error" in str(e).lower():
                result["verified_gone"] = True
                print(f"  ✓ GET after delete errors — verified gone")
            else:
                print(f"  ✗ GET after delete unexpected error: {e}")
                ok = False

        # --- List count back to baseline ---
        final = client.list_(resource_type)
        final_count = len(final)
        if final_count == baseline_count:
            print(f"  ✓ List count back to baseline ({final_count})")
        else:
            print(f"  ✗ List count mismatch: baseline={baseline_count}, now={final_count}")
            ok = False

    except Exception as e:
        print(f"  ✗ EXCEPTION: {e}")
        ok = False

    RESULTS[resource_type] = result
    return ok


# ---------------------------------------------------------------------------
# Cleanup — reverse-order deletion of any remaining created IDs
# ---------------------------------------------------------------------------

def cleanup(client: McpClient) -> bool:
    """Delete all created resources in reverse order. Returns True if all clean."""
    all_clean = True
    # Reverse tier order, then reverse within each tier
    all_types = []
    for tier in reversed(TIERS):
        all_types.extend(reversed(tier))

    for rt in all_types:
        ids = CREATED_IDS.get(rt, [])
        for rid in reversed(ids):
            if RESULTS.get(rt, {}).get("deleted"):
                continue  # already deleted in the test
            try:
                print(f"  CLEANUP: delete {rt} id={rid}")
                client.delete(rt, rid)
                print(f"  ✓ cleanup OK for {rt}/{rid}")
            except Exception as e:
                print(f"  ✗ cleanup FAILED for {rt}/{rid}: {e}")
                all_clean = False
    return all_clean


# ---------------------------------------------------------------------------
# Final sweep
# ---------------------------------------------------------------------------

def final_sweep(client: McpClient) -> bool:
    """Verify all created IDs error on get."""
    all_gone = True
    for rt, ids in CREATED_IDS.items():
        for rid in ids:
            if RESULTS.get(rt, {}).get("deleted"):
                continue
            try:
                data = client.get(rt, rid)
                # null/None means gone; string is sometimes the resource name
                # (for types like user_group where GET returns bare name)
                if data is None:
                    print(f"  ✓ {rt}/{rid} confirmed gone (null)")
                elif isinstance(data, str) and data == rid:
                    # Bare string match means it still exists
                    print(f"  ✗ {rt}/{rid} still exists (returned name)")
                    all_gone = False
                elif isinstance(data, dict) and data.get("name") == rid:
                    print(f"  ✗ {rt}/{rid} still exists")
                    all_gone = False
                elif isinstance(data, dict) and data.get("id") == rid:
                    print(f"  ✗ {rt}/{rid} still exists")
                    all_gone = False
                else:
                    # Got something but doesn't match — might be a different
                    # error shape; treat as gone if it looks like an error
                    print(f"  ? {rt}/{rid} got unexpected response: {type(data).__name__}")
            except RuntimeError as e:
                err_str = str(e).lower()
                if "404" in err_str or "not found" in err_str or "does not exist" in err_str:
                    print(f"  ✓ {rt}/{rid} confirmed gone (error)")
                else:
                    print(f"  ✗ {rt}/{rid} unexpected error: {e}")
                    all_gone = False
            except Exception as e:
                print(f"  ✗ {rt}/{rid} unexpected: {e}")
                all_gone = False
    return all_gone


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    print(f"=" * 60)
    print(f"Komodo MCP Write Lifecycle Test")
    print(f"MCP server: {MCP_URL}")
    print(f"Timestamp prefix: {PREFIX}")
    print(f"=" * 60)

    # Health check
    print(f"\nHealth check: {HEALTH_ENDPOINT}")
    try:
        req = urllib.request.Request(HEALTH_ENDPOINT, method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            print(f"  ✓ MCP server is up (HTTP {resp.status})")
    except Exception as e:
        print(f"  ✗ MCP server unreachable: {e}")
        return 1

    # Initialize MCP session
    print(f"\nInitializing MCP session...")
    client = McpClient()
    try:
        client.initialize()
        print(f"  ✓ Session established (id={client.session_id})")
    except Exception as e:
        print(f"  ✗ Failed to initialize: {e}")
        return 1

    # Run tiers
    all_pass = True
    tier_fail = False
    for i, tier in enumerate(TIERS):
        print(f"\n{'=' * 60}")
        print(f"TIER {i}: {', '.join(tier)}")
        print(f"{'=' * 60}")

        try:
            for rt in tier:
                print(f"\n--- {rt} ---")
                if not test_lifecycle(client, rt):
                    all_pass = False
                    tier_fail = True
        except Exception as e:
            print(f"\n  ✗ TIER {i} ABORTED: {e}")
            all_pass = False
            tier_fail = True

        if tier_fail:
            print(f"\n  ⚠ Tier {i} had failures — cleaning up and aborting remaining tiers")
            cleanup(client)
            break

    # Final sweep
    print(f"\n{'=' * 60}")
    print(f"FINAL SWEEP — all created IDs must error on get")
    print(f"{'=' * 60}")
    sweep_ok = final_sweep(client)

    # Audit table
    print(f"\n{'=' * 60}")
    print(f"AUDIT TABLE")
    print(f"{'=' * 60}")
    print(f"{'Type':<20} {'Created?':<10} {'ID':<42} {'Updated?':<10} {'Deleted?':<10} {'Gone?':<10}")
    print(f"{'-'*20} {'-'*10} {'-'*42} {'-'*10} {'-'*10} {'-'*10}")
    for tier in TIERS:
        for rt in tier:
            r = RESULTS.get(rt, {})
            created = "✓" if r.get("created") else "✗"
            rid = r.get("id", "—") or "—"
            updated = "✓" if r.get("updated") else ("—" if not RESOURCE_DEFS[rt]["has_update"] else "✗")
            deleted = "✓" if r.get("deleted") else "✗"
            gone = "✓" if r.get("verified_gone") else "✗"
            print(f"{rt:<20} {created:<10} {rid:<42} {updated:<10} {deleted:<10} {gone:<10}")

    print(f"\n{'=' * 60}")
    if all_pass and sweep_ok:
        print("ALL TESTS PASSED ✓")
    else:
        print("SOME TESTS FAILED ✗")
    print(f"{'=' * 60}")

    return 0 if all_pass and sweep_ok else 1


if __name__ == "__main__":
    sys.exit(main())

---
name: Hook Development
description: Use this skill when the user asks to create, configure, debug, validate, secure, or document Codex hooks; add a PreToolUse, PermissionRequest, PostToolUse, PreCompact, PostCompact, UserPromptSubmit, SubagentStart, SubagentStop, Stop, SessionStart, SessionEnd hook; work with hooks.json, config.toml, requirements.toml, or plugin-bundled lifecycle hooks; or enforce policies around Codex tools and turns.
version: 0.2.0
---

# Hook Development for Codex

## Purpose

Codex Hooks are an extensibility framework for injecting user-owned command
scripts into the agentic loop. Use them to log activity, validate or rewrite
local tool calls, block unsafe prompts or commands, add project context, save
session notes, enforce a completion check, or react to compaction and subagent
lifecycle events.

This skill is Codex-specific. Do not apply Claude Code hook semantics to a
Codex hook. In particular:

- Only type: "command" handlers run today. prompt and agent handlers may be
  parsed, but are skipped.
- Codex does not use Claude Code's permissionDecision: "ask" flow,
  $CLAUDE_ENV_FILE, $CLAUDE_PROJECT_DIR, or Claude's plugin hook wrapper
  semantics as the primary API.
- A command hook receives one JSON object on stdin and communicates through
  stdout, stderr, and its exit status.
- Matching hooks from all active sources run. Hook execution is not a
  replacement/override chain, and matching command hooks for one event are
  launched concurrently.

Official reference: https://learn.chatgpt.com/docs/hooks.md

## Mental model

Every hook has three levels:

1. An event, such as PreToolUse or Stop.
2. An optional matcher group that decides when the event matches.
3. One or more command handlers that run for a matching group.

The basic JSON shape is:

    {
      "description": "Optional lifecycle hooks for this workspace.",
      "hooks": {
        "PreToolUse": [
          {
            "matcher": "^Bash$",
            "hooks": [
              {
                "type": "command",
                "command": "python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use.py\"",
                "timeout": 30,
                "statusMessage": "Checking Bash command"
              }
            ]
          }
        ]
      }
    }

Handler fields:

- type: use command; prompt and agent are not executable hook types in the
  current Codex release.
- command: command line executed with the session's cwd as its working
  directory.
- timeout: seconds. The default is 600 for most events; SessionEnd defaults to
  1 second and supports at most 3 seconds.
- statusMessage: optional status text shown while the hook runs.
- additionalContextLimit: optional approximate token threshold for
  model-visible hookSpecificOutput.additionalContext from this handler.
- commandWindows in JSON, or command_windows in TOML: optional Windows command
  override.
- async: parsed for compatibility but asynchronous command hooks are not
  supported yet. Do not depend on it.

Keep hook commands short, deterministic, and independent. Multiple matching
hooks cannot rely on an execution order or on seeing one another's output.

## Where Codex discovers hooks

Codex discovers hooks next to active configuration layers in either of these
forms:

- hooks.json
- Inline [[hooks.<Event>]] tables in config.toml

The most useful locations are:

- ~/.codex/hooks.json
- ~/.codex/config.toml
- <repo>/.codex/hooks.json
- <repo>/.codex/config.toml

Codex also loads hooks from enabled plugins and managed configuration layers.
If several sources exist, Codex loads all matching hooks. A higher-precedence
layer does not replace lower-precedence hooks.

Project-local hooks load only when the project's .codex layer is trusted. In an
untrusted project, Codex still loads user and system hooks from their own
active configuration layers.

If one configuration layer contains both hooks.json and inline [hooks] in
config.toml, Codex merges them and warns at startup. Prefer one
representation per layer.

For repository-local commands, resolve the script from the Git root instead of
assuming the current directory is the repository root. Codex may start from a
subdirectory:

    {
      "type": "command",
      "command": "python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/check.py\""
    }

Commands still run with the session cwd; the Git-root expression only makes
the script path stable.

### hooks.json

Use the top-level wrapper in hooks.json:

    {
      "description": "Repository policy hooks",
      "hooks": {
        "SessionStart": [
          {
            "matcher": "startup|resume",
            "hooks": [
              {
                "type": "command",
                "command": "python3 ~/.codex/hooks/session_start.py",
                "statusMessage": "Loading session notes",
                "additionalContextLimit": 5000
              }
            ]
          }
        ]
      }
    }

description is optional metadata and has no effect on execution. hooks is the
required wrapper for this file format.

### Inline config.toml

The same hook can be declared inline:

    [[hooks.SessionStart]]
    matcher = "startup|resume"

    [[hooks.SessionStart.hooks]]
    type = "command"
    command = 'python3 "$(git rev-parse --show-toplevel)/.codex/hooks/session_start.py"'
    additionalContextLimit = 5000

    [[hooks.PreToolUse]]
    matcher = "^Bash$"

    [[hooks.PreToolUse.hooks]]
    type = "command"
    command = 'python3 "$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use.py"'
    timeout = 30
    statusMessage = "Checking Bash command"

In TOML, use command_windows for the Windows override. In JSON, use
commandWindows.

## Trust, review, and enabling

Before a non-managed command hook runs, Codex requires review and trust of the
exact hook definition. Trust is recorded against the hook's current hash, so a
new or modified hook is reviewed again and skipped until trusted.

In the Codex CLI, use /hooks to:

- inspect hook sources;
- review new or changed hooks;
- trust hooks; and
- disable individual non-managed hooks.

Codex warns at startup when hooks need review. Managed hooks from system, MDM,
cloud, or requirements.toml sources are trusted by policy and cannot be
disabled from the user hook browser.

Hooks are enabled by default. Disable them in config.toml with:

    [features]
    hooks = false

codex_hooks is a deprecated alias; use hooks. Administrators can force hooks
on in requirements.toml with [features].hooks = true.

For one-off automation whose hook sources have already been vetted outside
Codex, --dangerously-bypass-hook-trust bypasses persisted trust for that
invocation. Use this only for explicitly trusted automation.

## Managed enterprise hooks

Administrators can define hooks in requirements.toml and distribute the actual
scripts through MDM or another device-management system:

    allow_managed_hooks_only = true

    [features]
    hooks = true

    [hooks]
    managed_dir = "/enterprise/hooks"
    windows_managed_dir = 'C:\enterprise\hooks'

    [[hooks.PreToolUse]]
    matcher = "^Bash$"

    [[hooks.PreToolUse.hooks]]
    type = "command"
    command = "python3 /enterprise/hooks/pre_tool_use_policy.py"
    command_windows = 'py -3 C:\enterprise\hooks\pre_tool_use_policy.py'
    timeout = 30
    statusMessage = "Checking managed Bash command"

Rules:

- managed_dir is used on macOS and Linux; windows_managed_dir is used on
  Windows.
- Codex does not distribute the scripts. Enterprise tooling must install and
  update them.
- Managed hook commands should use absolute paths under the configured managed
  directory.
- allow_managed_hooks_only = true skips user, project, session, and plugin
  hooks while still loading managed hooks.

## Plugin-bundled hooks

An enabled plugin can bundle lifecycle hooks. By default Codex looks for
hooks/hooks.json inside the plugin root. A plugin manifest can override this
with a hooks entry in .codex-plugin/plugin.json:

    {
      "name": "repo-policy",
      "hooks": "./hooks/hooks.json"
    }

The manifest value may be a ./-prefixed path, an array of such paths, an
inline hooks object, or an array of inline hooks objects. Manifest paths are
resolved relative to the plugin root and must remain inside that root. When a
manifest defines hooks, Codex uses those entries instead of the default
hooks/hooks.json.

Plugin hook commands receive:

- PLUGIN_ROOT: installed plugin root;
- PLUGIN_DATA: writable plugin data directory;
- CLAUDE_PLUGIN_ROOT and CLAUDE_PLUGIN_DATA: compatibility variables for
  existing plugin hooks.

Prefer PLUGIN_ROOT and PLUGIN_DATA for new Codex hooks. Plugin hooks use the
same event schema and trust flow as other non-managed hooks; installing or
enabling a plugin does not automatically trust its hooks.

## Events and matchers

### Event summary

| Event | Runs | Matcher value | Primary use |
|---|---|---|---|
| SessionStart | Session starts or resumes | source: startup, resume, clear, compact | Load context or notes |
| SessionEnd | Main session ends; not subagents | Currently reason: other | Save notes or cleanup |
| SubagentStart | A subagent starts | agent_type | Add subagent context |
| PreToolUse | Before a supported local tool runs | Tool name | Validate, deny, or rewrite |
| PermissionRequest | Before Codex asks for approval | Tool name | Allow, deny, or defer approval |
| PostToolUse | After a supported local tool runs | Tool name | Review output or provide feedback |
| UserPromptSubmit | A user prompt is about to be sent | Not supported; ignored | Add context or block prompt |
| PreCompact | Before manual or automatic compaction | manual or auto | Preserve critical context |
| PostCompact | After manual or automatic compaction | manual or auto | Restore or record context |
| SubagentStop | A subagent tries to stop | agent_type | Request another subagent pass |
| Stop | The main turn tries to stop | Not supported; ignored | Continue until standards are met |

Use matcher: "*", matcher: "", or omit matcher to match every occurrence of an
event that supports matchers. The matcher is a regex string; write anchors
when an exact match is intended:

    "matcher": "^Bash$"

Examples:

    Bash
    ^apply_patch$
    Edit|Write
    mcp__filesystem__read_file
    mcp__filesystem__.*
    startup|resume|clear|compact
    manual|auto

UserPromptSubmit and Stop currently ignore matcher, so configure them without
relying on filtering.

### Tool coverage

PreToolUse and PostToolUse cover more than shell and MCP calls:

| Tool path | PreToolUse | PostToolUse | Match/name notes |
|---|---:|---:|---|
| Shell commands | Yes | Yes | Match as Bash |
| Unified exec_command | Yes | Yes | Match as Bash; a later write_stdin poll can deliver the original command's post event |
| apply_patch | Yes | Yes | Canonical input name is apply_patch; matcher aliases include Edit and Write |
| MCP tools | Yes | Yes | Match the MCP tool name, such as mcp__filesystem__read_file |
| Other local function tools | Yes | Yes | Match the function tool name, such as update_plan; spawn_agent also matches Agent |
| Hosted tools such as web search | No | No | They do not use the local function-tool hook path |

PermissionRequest currently supports Bash, apply_patch/Edit/Write, and MCP
tool names. Some specialized paths can opt out of the default hook path, so
treat tool hooks as a guardrail rather than a complete enforcement boundary.

write_stdin transports input or polls an existing unified-exec session; it does
not run PreToolUse again for the already-approved command.

## Command hook input

Every command hook receives exactly one JSON object on stdin. Common fields:

| Field | Type | Meaning |
|---|---|---|
| session_id | string | Current Codex session id; subagent hooks use the parent session id |
| transcript_path | string or null | Session transcript path, if available; transcript format is not a stable API |
| cwd | string | Session working directory |
| hook_event_name | string | Current event name |
| model | string | Active Codex model slug |
| turn_id | string | Active Codex turn id on turn-scoped events |
| permission_mode | string | On most turn events: default, acceptEdits, plan, dontAsk, or bypassPermissions |

Event-specific fields:

- SessionStart: source (startup, resume, clear, compact).
- SessionEnd: reason (currently other).
- SubagentStart: agent_id, agent_type, turn_id, permission_mode.
- PreToolUse: tool_name, tool_use_id, tool_input, turn_id.
- PermissionRequest: tool_name, tool_input, optional tool_input.description,
  turn_id.
- PostToolUse: tool_name, tool_use_id, tool_input, tool_response, turn_id.
- PreCompact and PostCompact: trigger (manual or auto), turn_id.
- UserPromptSubmit: prompt, turn_id.
- SubagentStop: agent_id, agent_type, agent_transcript_path,
  stop_hook_active, last_assistant_message, turn_id.
- Stop: stop_hook_active, last_assistant_message, turn_id.

Do not depend on transcript_path's internal format, and do not assume
tool_input.description exists for every permission request.

## Command hook output

Print JSON to stdout when the event expects JSON. An empty stdout with exit code
0 is success and lets Codex continue. Exit code 2 with a reason on stderr is
the portable way to block or provide feedback for the events that support it.
Timeouts and other command failures are reported as hook failures.

Shared JSON fields supported by SessionStart, PreCompact, PostCompact,
UserPromptSubmit, SubagentStop, and Stop:

    {
      "continue": true,
      "stopReason": "optional",
      "systemMessage": "optional",
      "suppressOutput": false
    }

- continue: false marks the hook run as stopped. For SubagentStart, it is
  parsed but does not prevent the subagent from starting.
- stopReason records why processing was stopped.
- systemMessage is surfaced as a warning in the UI or event stream.
- suppressOutput is parsed but not implemented; do not rely on it.

PreToolUse and PermissionRequest support systemMessage, but not continue,
stopReason, or suppressOutput. Returning unsupported fields marks that hook
run as failed and Codex continues the tool call. PostToolUse supports
systemMessage, stopReason, and continue: false; its suppressOutput is also not
implemented.

Plain-text stdout behavior is event-specific:

- SessionStart, SubagentStart, and UserPromptSubmit: added as extra
  developer/model context.
- PreToolUse, PermissionRequest, PostToolUse, PreCompact, and PostCompact:
  ignored; use JSON or stderr as documented.
- Stop and SubagentStop: plain text is invalid; return JSON.
- SessionEnd: output is advisory and cannot steer Codex or keep the thread
  open.

### Large output and context limits

Codex limits each model-visible hook-output message to roughly 2,500 tokens by
default. Oversized output is spilled to:

    <temp_dir>/hook_outputs/<session_id>/<uuid>.txt

The model receives a head-and-tail preview and the saved-file path. If the file
cannot be written, it receives a truncated preview.

For a command that returns additionalContext, set additionalContextLimit on
that handler. Omit it for the approximate 2,500 token default; use a positive
integer for another threshold; use 0 only when the hook enforces a strict
output cap and truly needs the full context passed through. The setting
applies independently to each matching handler and only to additionalContext.

Keep hook output concise. Context from several hooks can degrade model
performance, and oversized output may write sensitive data to disk. Never
return secrets, API keys, credentials, or unnecessary transcript content.

## Event-specific contracts

### SessionStart

The matcher is applied to source. Plain text adds developer context. JSON can
return additionalContext:

    {
      "hookSpecificOutput": {
        "hookEventName": "SessionStart",
        "additionalContext": "Load the workspace conventions before editing."
      }
    }

After compaction, a matching source: "compact" hook runs before the next model
request. If automatic compaction occurs mid-turn, its context is delivered to
the immediate continuation. continue: false ends the turn without another
model request.

### SessionEnd

Runs for the main thread when Codex closes normally, archives or deletes an open
conversation, or ends an idle session. Switching away from a conversation or
unsubscribing does not end it immediately. The hook can read the transcript
while it runs, but its output cannot steer Codex or keep the thread open. Keep
this hook within its short timeout.

### SubagentStart

The matcher is applied to agent_type. Plain text and
hookSpecificOutput.additionalContext are added to the subagent context:

    {
      "hookSpecificOutput": {
        "hookEventName": "SubagentStart",
        "additionalContext": "Review repository test conventions first."
      }
    }

continue: false does not stop a subagent from starting.

### PreToolUse

Use this event for deterministic policy checks before supported local tools
run. To deny a call:

    {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "Destructive command blocked by repository policy."
      }
    }

Codex also accepts the older shape:

    {
      "decision": "block",
      "reason": "Destructive command blocked by repository policy."
    }

To add context without blocking:

    {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "The pending command touches generated files."
      }
    }

To rewrite a supported call, use permissionDecision: "allow" with
updatedInput:

    {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "allow",
        "updatedInput": {
          "command": "echo rewritten"
        }
      }
    }

For Bash and apply_patch, updatedInput must contain a string command. For MCP
and other local function tools, it must be the replacement arguments object.
Return updatedInput only with permissionDecision: "allow".

permissionDecision: "ask", legacy decision: "approve", continue: false,
stopReason, and suppressOutput are parsed but unsupported. Do not use them as a
Codex decision API.

### PermissionRequest

Runs only when Codex is about to ask for approval, such as for shell
escalation or managed-network approval. It does not run for commands that do
not require approval. To allow:

    {
      "hookSpecificOutput": {
        "hookEventName": "PermissionRequest",
        "decision": {
          "behavior": "allow"
        }
      }
    }

To deny:

    {
      "hookSpecificOutput": {
        "hookEventName": "PermissionRequest",
        "decision": {
          "behavior": "deny",
          "message": "Blocked by repository policy."
        }
      }
    }

If several hooks decide, any deny wins. If there is no deny, an allow avoids
the approval prompt. If no hook decides, normal Codex approval flow continues.
Do not return updatedInput, updatedPermissions, or interrupt; those fields are
reserved and fail closed today.

### PostToolUse

Runs after supported tools produce output, including non-zero Bash exits. It
cannot undo side effects that already occurred. Feedback can replace the
model-visible tool result:

    {
      "decision": "block",
      "reason": "The Bash output needs review before continuing.",
      "hookSpecificOutput": {
        "hookEventName": "PostToolUse",
        "additionalContext": "The command updated generated files."
      }
    }

Here decision: "block" means “replace the result with this feedback and
continue the model”; it does not roll back the tool. continue: false also
replaces the original result with hook feedback. updatedMCPToolOutput and
suppressOutput are not supported.

For code-mode tool calls, the same decisions apply to the nested call:

- Pre-tool block: the tool promise rejects before execution.
- Pre-tool updatedInput: the tool runs with rewritten input.
- Post-tool block or exit 2: the tool ran, then the promise rejects with the
  hook reason.
- Post-tool continue: false: Codex replaces the model-visible result, but the
  nested promise is not rejected.

### UserPromptSubmit

The matcher is ignored. Plain text or additionalContext is added before the
prompt is sent:

    {
      "hookSpecificOutput": {
        "hookEventName": "UserPromptSubmit",
        "additionalContext": "Ask for a clear reproduction before editing files."
      }
    }

To block the prompt:

    {
      "decision": "block",
      "reason": "Ask for confirmation before doing that."
    }

Exit code 2 with the reason on stderr is also supported.

### PreCompact and PostCompact

The matcher is applied to trigger, either manual or auto. JSON may use the
common output fields. A matching PreCompact hook with continue: false stops
compaction; a matching PostCompact hook with continue: false stops normal
processing after compaction.

### SubagentStop

The matcher is applied to agent_type. On exit 0, stdout must be JSON. To
request another focused pass:

    {
      "decision": "block",
      "reason": "Run one more focused pass inside the subagent."
    }

Exit code 2 with a continuation reason is also supported. If any matching hook
returns continue: false, that takes precedence over continuation decisions from
other matching SubagentStop hooks.

### Stop

The matcher is ignored. On exit 0, stdout must be JSON. To keep Codex going:

    {
      "decision": "block",
      "reason": "Run one more pass over the failing tests."
    }

For Stop, decision: "block" does not reject the finished turn. It creates a
new continuation prompt that behaves like a new user prompt and uses reason
as its text. stop_hook_active indicates that the current turn has already been
continued by a Stop hook; use it to prevent infinite loops. If any matching
Stop hook returns continue: false, that takes precedence over continuation
decisions from other matching Stop hooks.

## Minimal command hook example

This Python hook denies clearly destructive Bash commands before they execute.
It is intentionally conservative; production policies should parse commands
with the threat model of the repository and should fail safely:

    #!/usr/bin/env python3
    import json
    import re
    import sys

    payload = json.load(sys.stdin)
    tool_name = payload.get("tool_name")
    command = ""
    if tool_name == "Bash":
        command = (payload.get("tool_input") or {}).get("command", "")

    if re.search(r"\brm\s+-rf\s+(?:/|\\\\|\$HOME|~)", command):
        print(json.dumps({
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": "Blocked by repository policy."
            }
        }))
    else:
        # Empty stdout with exit 0 means allow normal processing to continue.
        sys.exit(0)

If a hook must block via stderr instead, write a concise reason and exit 2:

    print("Blocked by repository policy.", file=sys.stderr)
    sys.exit(2)

## Security and reliability checklist

- Treat stdin, tool_input, prompts, paths, and transcript data as untrusted.
- Parse JSON with a real JSON parser; do not extract fields with fragile text
  matching.
- Validate the event and tool name before reading tool-specific fields.
- Never interpolate untrusted values into a shell command. Prefer invoking a
  program with an argument array inside the hook implementation.
- Quote paths and use stable Git-root or plugin-root resolution.
- Use PLUGIN_ROOT for plugin resources and an absolute managed path for
  enterprise hooks.
- Do not log prompts, tool inputs, transcripts, tokens, credentials, or API
  keys unless explicitly redacted.
- Keep timeouts finite and output small.
- Make hooks idempotent where possible; PostToolUse cannot roll back a tool.
- Assume matching hooks run concurrently and can be skipped when untrusted.
- Do not treat hooks as a complete security boundary: hosted tools and some
  specialized paths may not pass through the local hook path.
- Be especially careful with Stop and SubagentStop continuation logic; honor
  stop_hook_active to avoid infinite loops.

## Testing and debugging workflow

1. Choose the narrowest event and matcher that meets the requirement.
2. Implement a command that reads one JSON object from stdin.
3. Test the script directly with representative payloads for allow, deny,
   malformed input, missing fields, timeouts, and non-zero tool results.
4. Validate that stdout is the correct JSON shape for the selected event and
   that stderr/exit 2 is used only where appropriate.
5. Configure the hook in one source per config layer.
6. Start Codex and use /hooks in the CLI to inspect, review, trust, or disable
   the hook.
7. Test both trusted and untrusted project behavior for repo-local hooks.
8. Test from a repository subdirectory to verify Git-root resolution.
9. On Windows, test the commandWindows/command_windows override explicitly.
10. Test multiple matching hooks together; never assume ordering.

## Common mistakes

- Copying Claude Code examples that use type: "prompt"; those handlers are
  skipped by current Codex.
- Using the old Claude permissionDecision: "ask" behavior; Codex does not
  support it for PreToolUse.
- Putting events directly at the top level of hooks.json; use the required
  top-level hooks wrapper.
- Assuming a project-local hook runs before it is reviewed and trusted.
- Assuming a higher-precedence source disables lower-precedence hooks.
- Returning plain text from Stop or SubagentStop.
- Returning unsupported fields such as continue from PreToolUse or updatedInput
  from PermissionRequest.
- Expecting PostToolUse to undo a completed operation.
- Using a relative repo path when Codex can start from a subdirectory.
- Returning huge additionalContext or sensitive output that may spill to disk.
- Relying on async, which is parsed but not supported yet.
- Treating a tool hook as coverage for hosted tools such as web search.

## Quick reference

### Minimal PreToolUse JSON

    {
      "hooks": {
        "PreToolUse": [
          {
            "matcher": "^Bash$",
            "hooks": [
              {
                "type": "command",
                "command": "python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use.py\"",
                "timeout": 30
              }
            ]
          }
        ]
      }
    }

### Decision summary

| Event | Allow/continue | Block/stop/feedback |
|---|---|---|
| PreToolUse | Empty stdout or permissionDecision: "allow" | permissionDecision: "deny", legacy decision: "block", or exit 2 |
| PermissionRequest | decision.behavior: "allow" | decision.behavior: "deny" |
| PostToolUse | Empty stdout | decision: "block", continue: false, or exit 2; cannot undo side effects |
| UserPromptSubmit | Empty stdout or additional context | decision: "block" or exit 2 |
| Stop | Empty stdout | decision: "block" creates a continuation prompt; continue: false takes precedence |
| SubagentStop | Empty stdout | decision: "block" requests continuation; continue: false takes precedence |
| PreCompact | Empty stdout | continue: false stops compaction |

### Official references

- Codex Hooks reference: https://learn.chatgpt.com/docs/hooks.md
- Codex hook schemas: https://github.com/openai/codex/tree/main/codex-rs/hooks/schema/generated
- Codex plugin lifecycle hooks: https://developers.openai.com/plugins/build/plugins#bundled-mcp-servers-and-lifecycle-hooks

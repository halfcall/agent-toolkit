---
name: smartcall
description: |
  Smart-Call AI outbound calling platform. Use when the user wants to push leads
  to an AI calling program, check call results, manage calling programs, update
  bot scripts/voice/extraction config, configure webhooks, or view calling lines
  and voices. Trigger on keywords:
  "call", "outbound", "leads", "smart-call", "onvocall", "halfcall", "uereport",
  "dialing", "bot script", "webhook", "campaign", "phone", "intention", "connect rate".
allowed-tools:
  - Bash
  - Read
  - mcp
---

# Smart-Call Agent Toolkit

You are an AI assistant with access to the Smart-Call AI outbound calling platform.
Smart-Call automates enterprise-grade outbound phone calls using AI bots that can
hold natural conversations with leads, handle objections, and classify intent.

## Core Concepts

Before using the tools, understand these key concepts:

- **Program**: A calling campaign. Contains bots, trunks (lines), leads, and dialing settings. Has a `runState` (RUNNING or PAUSED) and an `executionMode` (must be `Stream` for API-pushed leads — `Batch` programs reject `push_lead`).
- **Bot**: An AI agent within a program, identified by `botId` (the bot's public `identify`). Each bot has a conversation script (prompt + greeting), a voice, clue fields (input variables), and an extraction config (post-call data pulled out of the conversation). Programs can have multiple bots for different stages (e.g., stage 1 = initial call, stage 2 = follow-up).
- **Trunk**: A calling line. Required to create a program (`trunkIds`). `list_trunks` shows lines your workspace owns plus shared lines opened to you.
- **Lead (ThreadDetail)**: A phone number queued for calling. When pushed via API, gets a `threadDetailId` (returned as `threadId` in the push response) you can use to track it.
- **Clue fields vs. extraction fields — do not confuse these**: clue fields (`get_bot_script`'s `clueItems`, `get_lead_fields`) are INPUT variables available before the call starts (used in `push_lead`'s `variables` and in `{key}` prompt templates). Extraction fields (`get_bot_extract`) are OUTPUT data pulled FROM the conversation afterward.
- **Intention Levels**: `NONE` (not analyzed/n-a), `REACHED` (connected but not yet classified), `HIGH` (strong interest), `HESITATE` (uncertain), `LOW_DIFFICULTY` / `HIGH_DIFFICULTY` (communication-difficulty classification — exact business meaning still being finalized upstream), `UNKNOW` (unknown). Right after a call ends, `intention` may briefly read `UNKNOW` while post-call analysis runs — requery a few seconds later.
- **Reached Status** (12 values — this replaced an older, much shorter enum, so don't trust older third-party notes): `REACHED` (mid-call transient state), `AGENT_END`/`SEAT_END`/`USER_END` (connected, ended by AI/human agent/callee respectively — these three plus `REACHED` count as "connected"), `UNREACHED` (rang, no answer), `CALL_REJECTED` (declined), `EMPTY_PHONE`/`SHUTDOWN` (invalid number / phone off), `UN_CONNECT` (call never established), `INVALID` (uncategorized failure), `CALLER_ABNORMAL` (our line/caller side abnormal), `INIT`/`PREPARE`/`DIALED` (in-progress, no result yet). To check "was this call answered", test `reached in [REACHED, AGENT_END, SEAT_END, USER_END]` or fall back to `duration > 0`.

## Setup & Authentication

### Step 1: Verify MCP Server is Connected

The Smart-Call MCP server must be configured. Run `verify_auth` to check — it also returns the `scopes` your API key actually has, which matters (see below).

If it fails or the tools are not available, the user needs to configure it:

**For Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "smartcall": {
      "command": "npx",
      "args": ["-y", "smartcall-agent-toolkit"],
      "env": {
        "SMARTCALL_API_KEY": "sk-your-api-key",
        "SMARTCALL_BASE_URL": "https://api.halfcall.cn"
      }
    }
  }
}
```

**For Claude Code** (`.mcp.json` or `~/.claude/mcp.json`): same shape as above.

**API key**: Users get this from the dashboard → Settings → API Keys. `SMARTCALL_BASE_URL` defaults to `https://api.halfcall.cn` and can stay that way: halfcall.cn, uereport.com and onvocall.com accounts are one platform sharing the same API keys (`https://api.uereport.com` also works; `api.onvocall.com` does not serve the API).

### Step 2: Know the permission scopes before you start

API keys are scoped (`READ` / `LEADS` / `CONTROL` / `SCRIPT`). A key missing a scope gets a `403` from every tool in that bucket — this is the most common "why did this fail" surprise, so check it up front with `verify_auth`, don't just retry blindly:

| Scope | Covers | Tools |
|-------|--------|-------|
| `READ` | All query tools | `list_programs`, `list_bots`, `get_line_status`, `list_trunks`, `list_voices`, `get_program_stats`, `get_dialing_config`, `get_webhook`, `get_lead_fields`, `query_lead`, `batch_query_leads`, `get_bot_script`, `get_bot_extract`, `download_lead_template` (`verify_auth` needs no scope at all — any active key works) |
| `LEADS` | Lead lifecycle | `push_lead`, `upload_leads`, `cancel_lead` |
| `CONTROL` | Program-level control | `create_program`, `update_program_bots`, `control_program`, `update_dialing_config`, `update_webhook` |
| `SCRIPT` | Highest risk — changes what the bot says to customers | `update_bot_script`, `update_bot_voice`, `update_bot_extract` |

If a tool call 403s with "missing required scope", tell the user which scope to add — don't just retry.

### Step 3: Always Verify First

Before any operation, call `verify_auth` to confirm the key is valid, which workspace it belongs to, and which scopes it has. If auth fails, do NOT proceed — tell the user to check their API key.

## Built-in Tools (26)

### Authentication
| Tool | Parameters | Scope | Description |
|------|-----------|-------|-------------|
| `verify_auth` | (none) | any | Verify API key, returns `workspaceId`, `apiKeyId`, `scopes` |

### Basic Info (programs, bots, lines, voices)
| Tool | Parameters | Scope | Description |
|------|-----------|-------|-------------|
| `list_programs` | `runState?`, `page?`, `pageSize?` | READ | List programs in the workspace |
| `create_program` | `name`, `trunkIds` (required), `bots?`, plus many optional fields (see tool schema) | CONTROL | Create a program. Created `PAUSED` by default. Requires workspace `collabEnabled`. |
| `list_bots` | `programId` | READ | List bots in a program: `botId`, `name`, `stage`, `isEnabled`, `hotInitStatus` |
| `update_program_bots` | `programId`, `bots` (**full replace**) | CONTROL | Set a program's bot list. Not incremental — read `list_bots` first if you only want to add one. |
| `get_line_status` | `programId` | READ | Idle line count — check `idle > 0` before pushing a burst of leads |
| `list_trunks` | `status?`, `page?`, `pageSize?` | READ | List calling lines (own + shared); `trunkId` feeds `create_program` |
| `list_voices` | `status?`, `page?`, `pageSize?` | READ | List TTS voices (own + shared); `voiceModelId` feeds `update_bot_voice` |

### Lead Management
| Tool | Parameters | Scope | Description |
|------|-----------|-------|-------------|
| `get_lead_fields` | `programId`, `botId?` | READ | Get the exact `variables` keys a bot expects — call before `push_lead` to avoid 400s |
| `push_lead` | `programId`, `phone`, `botId?`, `variables?`, `contextId?` | LEADS | Push one phone number, queued for auto-dial. Returns `threadId`. Same phone + same day re-queues (use `contextId` to keep same-day pushes independent instead). |
| `upload_leads` | `programId`, `filePath`, `botId`, `name?` | LEADS | Bulk-import from a local Excel/CSV file |
| `download_lead_template` | `programId`, `botId?`, `savePath?` | READ | Header-row template for humans to fill in (binary — use `get_lead_fields` for programmatic field discovery instead) |
| `query_lead` | `threadId` OR (`programId` + `phone`) | READ | Full call history for one lead |
| `batch_query_leads` | `threadIds` OR `programId`, `date?`, `page?`, `pageSize?` | READ | Latest call per lead, for many leads at once |
| `cancel_lead` | `threadDetailId` OR `programId` | LEADS | Cancel queued-but-not-yet-dialed leads. Already-dialed/completed leads are untouched, no error. |

### Program Control
| Tool | Parameters | Scope | Description |
|------|-----------|-------|-------------|
| `control_program` | `programId`, `action` (start/pause) | CONTROL | Start/pause the auto-dialer |
| `get_program_stats` | `programId`, `date?` | READ | Daily stats: total calls, connect rate, intention breakdown, avg duration |
| `get_dialing_config` | `programId` | READ | maxConcurrency, priorityStrategy, workTimeConfig, block times |
| `update_dialing_config` | `programId`, fields optional | CONTROL | Update dialing settings |

### Bot Script / Voice / Extraction
| Tool | Parameters | Scope | Description |
|------|-----------|-------|-------------|
| `get_bot_script` | `botId` | READ | prompt, greeting, clueItems, transfer config |
| `update_bot_script` | `botId`, fields optional (at least one) | SCRIPT | Update prompt/greeting/clue fields/transfer config. Takes effect immediately. |
| `update_bot_voice` | `botId`, `voiceModelId?`, `speed?`, `volume?`, `pitch?`, `emotion?` | SCRIPT | Configure TTS voice + tuning. Takes effect immediately. |
| `get_bot_extract` | `botId` | READ | Post-call extraction fields + intention push config |
| `update_bot_extract` | `botId`, fields optional (at least one) | SCRIPT | Update extraction fields and push routing (Feishu/WeChat/DingTalk/API) |

### Webhook (simple call.settled notification)
| Tool | Parameters | Scope | Description |
|------|-----------|-------|-------------|
| `get_webhook` | `programId` | READ | Current webhook URL + whether a secret is set |
| `update_webhook` | `programId`, `webhookUrl?`, `webhookSecret?` | CONTROL | Set/clear the webhook. **This is the lightweight mechanism only** — see below. |

## Platform assistant tools (dynamic, 0.3.0+)

Besides the built-in tools above, the toolkit registers the platform's own assistant tools at startup (`GET /api/v1/external/mcp/tools`). Their descriptions and results are in **Chinese**; relay results to the user in their language.

- **Who is acting**: the API key's creator. Permissions are exactly the dashboard's for that person (department project scope; editing prompt/opener/voice/features needs the workspace's "协作权限", editing lines needs "协作线路"; role limits like 外勤 cannot export). The key's scopes can only narrow this further. When a call is refused, the result explains why — pass that on instead of retrying.
- **Workspace** is fixed to the key's workspace; there is no workspace switching.
- **Projects are addressed by name**, not id: pass `projectHint` (project name, digital-employee name or its 8-digit number).
- **Prefer these over built-ins for**: filtered lead export with recordings (`export_leads_excel` → returns `downloadUrl`), re-dialing by filters (`redial_leads`, two-step: preview then `confirm: "true"`), balance (`check_balance`), today's overview (`query_status`), voice picking by tags (`platform_list_voices` then `update_bot` with `field: "voice"` and the voice id), line switching (`modify_trunk`).
- **Multi-step flows** (`new_project` → `confirm_step` / `revise_step` / `cancel_step` / `provide_trial_phone`) keep state per toolkit process (`SMARTCALL_SESSION_ID`). Show each step's result to the user and wait for their confirmation before calling `confirm_step`.
- Built-in and platform tools with the same name: the platform one is prefixed `platform_`.

## Two different webhook mechanisms — don't conflate them

1. **`get_webhook`/`update_webhook` (this toolkit)**: fires `event: "call.settled"` with a small payload (`programId`, `taskDetailId`, `threadDetailId`, `phone`, `stage`, `reached`, `duration`, `intention`, `intentionRate`, `endTime`, `isReached`, `isIntention`) to `webhookUrl`, signed via `X-SmartCall-Signature: HMAC-SHA256(body, webhookSecret)` when a secret is set.
2. **话单回调 (full call-detail callback)**: a richer, separate mechanism — full `chatLogs`, `summary`, `intentionTag`, `recordUrl`, `contextId`, etc., signed with `X-App-Id`/`X-Timestamp`/`X-Nonce`/`X-Sign`/`X-Sign-Method` (md5/sha256). This is configured per-bot via `update_bot_extract` with `pushType: "api"` (`pushWebhook`/`pushAppKey`), **not** through `update_webhook`. If the user wants full conversation transcripts or the richer signing scheme, point them at `update_bot_extract`, not the webhook tools.

## Workflows

### 1. Push Leads and Monitor a Campaign

```
Step 1: Find the right program
→ list_programs (optionally filter by runState: "RUNNING")
→ Note the programId and confirm executionMode is "Stream"

Step 2: Ensure program is running
→ If paused: control_program(programId, "start")

Step 3: Know the field keys before pushing (avoids 400s)
→ get_lead_fields(programId) → note the "key" values (not the Chinese "name" labels)

Step 4: Push leads
→ push_lead(programId, phone, variables: { org_name: "Acme", contact_name: "John" })
→ Save the returned threadId

Step 5: Wait for calls to complete
→ Calls are made automatically by the auto-dialer (usually within seconds)

Step 6: Check results
→ query_lead(threadId)
→ Look at: reached, duration, intention, intentionRate, summary
```

**Important**: `executionMode` must be `Stream` to accept API-pushed leads. If it's `Batch`, `push_lead` fails with "Program executionMode must be Stream".

### 2. Bulk Import via File

```
Step 1: Get (or build) the file
→ download_lead_template(programId, botId) — column headers match the bot's clue field labels exactly; don't rename them
→ Fill in rows, save locally

Step 2: Upload
→ upload_leads(programId, filePath, botId, name?)
→ Returns { threadId, total, skipped } — skipped = duplicate phones within the program
```

### 3. Campaign Performance Review

```
Step 1: Get today's stats
→ get_program_stats(programId)
→ Key metrics: connectRate, totalCalls, reachedCount, highCount, hesitateCount

Step 2: Check recent results in detail
→ batch_query_leads(programId, date: "2026-08-20", pageSize: 50)

Step 3: If connect rate is low, check dialing config and lines
→ get_dialing_config(programId), get_line_status(programId)
→ Consider adjusting maxConcurrency, blockStartTime/blockEndTime, or trunk health (list_trunks)

Step 4: If intention rate is low, review bot script
→ list_bots(programId) → get_bot_script(botId)
→ Suggest improvements; apply with update_bot_script
```

### 4. Bot Script Optimization

```
Step 1: Get current script
→ list_bots(programId) to find the botId
→ get_bot_script(botId)

Step 2: Analyze the script
→ Check: greeting, value proposition, objection handling, closing
→ Identify weak points (too aggressive? too passive? missing objection handlers?)

Step 3: Update the script
→ update_bot_script(botId, { prompt: newPrompt })
→ Takes effect immediately — no separate "reinitialize" step needed

Step 4: Monitor impact
→ Wait for a batch of calls to complete
→ get_program_stats(programId) to compare before/after
```

**Script best practices**:
- Keep the greeting short and natural (under 15 seconds)
- Always include 3-5 objection handlers for common pushbacks
- Define clear intent classification criteria so the AI can tag correctly
- Include a graceful exit for when the lead says "not interested"
- Don't be too pushy, it tanks connect rates (people hang up faster)

### 5. Configure Post-Call Extraction + Intent Push

```
Step 1: See current config
→ get_bot_extract(botId)

Step 2: Define what to extract
→ update_bot_extract(botId, {
    prompt: "Extract the customer's budget and decision timeline",
    items: [{ key: "budget", name: "预算", description: "客户预算范围" }]
  })

Step 3: Route high-intent results
→ update_bot_extract(botId, {
    pushType: "wechat", pushOnlyIntent: true, pushTarget: "person", pushWebhook: "wxid_xxx"
  })
→ For Feishu/DingTalk, also set the matching *AppId/*Secret fields
```

### 6. Webhook Integration (simple call.settled)

```
Step 1: Set up webhook
→ update_webhook(programId, { webhookUrl: "https://your-app.com/api/smartcall-callback", webhookSecret: "your-secret-key" })

Step 2: Verify it's configured
→ get_webhook(programId)

Step 3: What your endpoint receives (POST):
{
  "event": "call.settled",
  "timestamp": "2026-01-15T10:30:00.000Z",
  "data": {
    "programId": "...", "taskDetailId": "...", "threadDetailId": "...",
    "phone": "13800138000", "stage": 1,
    "reached": "AGENT_END", "duration": 45,
    "intention": "HIGH", "intentionRate": 85,
    "endTime": "2026-01-15T10:30:00.000Z",
    "isReached": true, "isIntention": true
  }
}

Step 4: Verify signature (if webhookSecret is set)
→ Check X-SmartCall-Signature header
→ HMAC-SHA256(raw_request_body, webhookSecret) should match

Step 5: To disable webhook
→ update_webhook(programId, { webhookUrl: null })
```

Need the full conversation transcript instead of this summary payload? Use `update_bot_extract` with `pushType: "api"` (see Workflow 5) — that is the 话单回调 mechanism, a different code path from this webhook.

### 7. Dialing Configuration Tuning

```
maxConcurrency: How many calls run at the same time
→ Higher = faster throughput, but may hit carrier limits
→ Recommended: 10-50 for most campaigns

priorityStrategy:
→ "LIFO" (Last In, First Out): newest leads get called first. Good for time-sensitive leads.
→ "FIFO" (First In, First Out): oldest leads get called first. Good for fairness.

blockStartTime / blockEndTime: Absolute quiet hours (in minutes from midnight), takes priority over workTimeConfig
→ Example: blockStartTime=1260 (21:00), blockEndTime=480 (08:00) = no calls 9PM-8AM
→ Set to null to disable

workTimeConfig: JSON object defining allowed calling windows (callTimeSlots: [{ id, start, end, days }])
→ Can be read via get_dialing_config and written via update_dialing_config
```

## Response Format

All API responses follow this structure:
```json
{
  "code": 0,       // 0 = success, -1 = error
  "msg": "success", // Error message when code is -1
  "data": { ... }   // Response data
}
```

Common error codes:
- **401**: Invalid, revoked, or expired API key
- **403**: Program/bot doesn't belong to your workspace, OR the key is missing a required scope (see "Know the permission scopes" above) — check the `msg` field to tell which
- **400**: Missing required parameters, invalid values, or (for `push_lead`) `variables` containing unknown/missing fields per `get_lead_fields`
- **404**: Lead/program/bot not found
- **409**: `cancel_lead` target is no longer cancellable (already dialing or done)

## Tips & Gotchas

1. **Always verify auth first** if it's the first interaction in a session — it also tells you your scopes, so you know which tool categories will 403 up front.
2. **Use batch_query_leads** instead of looping query_lead. Max 100 threadIds per request, and it only returns the *latest* call per lead — use query_lead for full history.
3. **Program must be Stream mode** to accept pushed leads. Check `executionMode` in list_programs.
4. **Leads are deduplicated by phone + day**, not just phone + threadId. Pushing the same phone twice on the same day re-queues the existing lead unless you pass different `contextId` values.
5. **`update_program_bots` and clueItems/transferItems on `update_bot_script` are full replaces**, not incremental — read the current state first if you're only adding one item.
6. **Bot config changes are immediate.** `update_bot_script`/`update_bot_voice`/`update_bot_extract` take effect on the next call — no separate reinitialize step, unlike some older docs suggest.
7. **`reached` has 12 possible values**, not the 4-6 you might expect from older references — see Core Concepts. Test connectivity with `reached in [REACHED, AGENT_END, SEAT_END, USER_END]`.
8. **`intention` briefly reads `UNKNOW` right after hangup** while post-call analysis runs — requery a few seconds later for the final value.
9. **Connect rate** is calculated as `reachedCount / totalCalls * 100` (see get_program_stats). A healthy campaign is 30-60% depending on industry.
10. **Intention rate** = `(highCount + hesitateCount) / reachedCount * 100`. This measures how many answered calls showed interest.
11. **Webhook failures are silent and not retried** for the simple call.settled webhook. Use batch_query_leads as a backup to catch missed events.
12. **Work time windows are in Beijing time (UTC+8)**. The auto-dialer respects these and won't call outside configured hours.
13. **`SCRIPT`-scoped tools change what the bot says to real customers.** Don't call `update_bot_script`/`update_bot_voice`/`update_bot_extract` speculatively — confirm the change with the user first, since a bad prompt can tank connect/intent rates immediately.

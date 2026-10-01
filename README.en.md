<div align="center">
  <img src="./banner.svg" alt="Onvocall Agent Toolkit" width="100%">

  <br/>
  <br/>

  **Give your AI agent a team of digital employees that think, talk, and close.**

  [简体中文](README.md) | [English](README.en.md)

  <br/>

  [![npm version](https://img.shields.io/npm/v/halfcall-agent-toolkit.svg)](https://www.npmjs.com/package/halfcall-agent-toolkit)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

  <br/>

  [Website](https://onvocall.com) · [Dashboard](https://onvocall.com/dashboard) · [中文站](https://halfcall.cn)

</div>

<hr/>

<br/>

# Onvocall Agent Toolkit — AI Digital Employees for Your Agent

## What is Onvocall?

Onvocall is an **AI Digital Employee platform** built by [OnvoCall](https://onvocall.com) (事半科技). Each digital employee is powered by large language models, capable of real-time emotion sensing, active listening, millisecond-level response, and human-like conversation. They can be a sales manager, a customer service rep, a medical assistant, or a marketing specialist — working 24/7 without breaks.

Outbound calling is just one of their skills. These digital employees hold real phone conversations: greeting, pitching, handling objections, sensing tone shifts, adapting on the fly, and classifying intent. All at enterprise scale.

**Onvocall Agent Toolkit** connects your AI agent (Claude, GPT, or any MCP-compatible agent) to the Onvocall platform. Your agent can deploy digital employees, push leads, monitor call results, adjust conversation scripts in real-time, and receive instant callbacks. All through natural language.

No dashboard clicking. No CSV uploads. Tell your agent what you want. It happens.

## Why Onvocall?

Traditional outbound is manual, slow, and robotic. Onvocall digital employees are different:

- **They actually think** — Connected to mainstream LLMs with context memory, complex reasoning, emotion sensing, and active listening. Not robocalls. Real conversations that feel human.
- **Interrupt anytime** — Users can cut in mid-sentence. The digital employee adapts instantly, just like talking to a real person.
- **Enterprise scale** — Run hundreds of concurrent calls across multiple campaigns, with multiple digital employees working in parallel.
- **Real-time intent analysis** — Every call is analyzed: HIGH interest, HESITATE, or LOW. Results return in seconds.
- **Seamless human handoff** — When a conversation needs a real person, the digital employee transfers smoothly, no awkward transitions.
- **Agent-native** — Built for the AI agent era. Your agent controls the entire lifecycle.

## What Can a Digital Employee Do?

Your AI agent manages a team of specialized digital employees through Onvocall:

- **Sales Manager** — Push a prospect list, let the digital employee cold-call and pitch your product. It handles objections, gauges interest, and your agent gets back a ranked list of hot leads. Script not converting? Your agent rewrites it on the fly.

- **Customer Service Rep** — 7x24 availability. Answers product questions, walks through features, sends documentation links, and escalates to human agents when needed. Logs every interaction.

- **Renewal Specialist** — Reaches out before subscriptions expire. Offers incentives, collects feedback on why someone might churn, and flags at-risk accounts. Your agent monitors retention rates in real-time.

- **Lead Qualifier** — New signups, form submissions, inbound inquiries — all pushed to a digital employee that calls to qualify. Your agent reads back who's ready to buy and who needs nurturing.

- **Appointment Setter** — Patient lists, member lists, client lists. The digital employee calls to schedule, confirm, or reschedule. Your agent tracks confirmation rates.

- **Survey Researcher** — Phone surveys at scale. Define the questions in the conversation script, push a target list, and your agent aggregates structured results.

- **Payment Reminder** — Gentle, natural reminders for overdue invoices, subscription renewals, or membership fees. Your agent tracks who paid and queues second-round calls for the rest.

- **Event Host** — Invite hundreds of contacts to your event by phone. Higher response rates than email. Your agent knows exactly who confirmed.

- **Reactivation Specialist** — Win back dormant users. Push churned customer lists, let the digital employee re-engage them with personalized offers, and see who's ready to come back.

## Not Just Calls — A Full Action Pipeline

A digital employee doesn't just talk. It acts. During and after every call, it can trigger a chain of automated actions based on what happens in the conversation:

### During the Call

| Action | What happens |
|--------|-------------|
| **Transfer to human** | Detects the customer needs a real person, transfers the call to a human agent via SIP — seamless, no hang-up |
| **Send SMS** | Sends a text message during the call (verification code, product link, appointment confirmation) via Alibaba Cloud, Lianlu, ColorCube, or Shanhai |
| **Call API** | Hits your backend API mid-conversation — check inventory, look up an order, create a CRM record, anything you configure |
| **Call Webhook** | Fires a webhook to any URL with call context — trigger a Zapier flow, update a spreadsheet, notify a Slack channel |

### After the Call — Intent-Driven Actions

When the call ends, Onvocall analyzes the conversation, extracts structured data, classifies intent, and triggers actions based on the result:

```
Call ends → AI analyzes intent → Routes to action
                ├── HIGH intent  → Push to WeChat group + add as WeChat friend
                ├── HESITATE     → Push to Feishu with @mention for follow-up
                ├── Ticket created → Push work order to DingTalk
                └── Any result   → POST full call record to your server API
```

| Action | What happens |
|--------|-------------|
| **Push to WeChat** | Send intent cards to WeChat Work groups — shows intent level, call duration, extracted fields, recording link. Auto @mentions the assigned salesperson. |
| **Push to Feishu** | Rich cards in Feishu groups — uses Feishu App API for @mentions by phone number, includes all extracted customer data |
| **Push to DingTalk** | Markdown messages to DingTalk groups — HMAC-SHA256 signed, with @mention support |
| **Push to your server** | POST structured call results (phone, intent, duration, extracted fields, recording URL) to any API endpoint. Supports Bearer/Basic/API Key auth, HMAC signing, IP whitelist. Up to 3 automatic retries. |
| **Add WeChat friend** | Auto-send friend request via WeChat Work after a high-intent call |
| **Create work ticket** | Generate a follow-up ticket with customer info, push it to Feishu/WeChat/DingTalk groups |

All push actions include retry with exponential backoff (2s → 4s → 8s, up to 3 attempts). Failed pushes are tracked and retried by a background scheduler every minute.

### The Complete Flow

> **API Key** → **Agent push lead** → **Digital employee calls** → **Mid-call actions** → **AI intent analysis** → **Auto push**

```
                        ┌─────────── During Call ───────────┐
                        │                                    │
  Agent                 │  SMS · Transfer · API · Webhook   │
  pushes  ──── ☎️ ────>│                                    │──── AI ────> Push
  a lead                └────────────────────────────────────┘   intent     results
                                                                  │
                                                                  ├─> WeChat group
                                                                  ├─> Feishu group
                                                                  ├─> DingTalk group
                                                                  ├─> Your server API
                                                                  └─> Add WeChat friend
```

1. **Agent pushes a lead** — phone number + optional context (name, company, reason)
2. **Digital employee calls** — natural conversation with emotion sensing and active listening
3. **Mid-call actions fire** — SMS, transfer to human, API calls, webhooks
4. **Post-call pipeline** — AI extracts intent → pushes to WeChat / Feishu / DingTalk / your server, creates tickets, adds friends

That's it. Your agent has a team that doesn't just talk — they close.

## Quick Start

### Option A: MCP Server

Works with Claude Desktop, Claude Code, or any MCP-compatible AI client.

**Claude Desktop** — add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "halfcall": {
      "command": "npx",
      "args": ["-y", "halfcall-agent-toolkit"],
      "env": {
        "HALFCALL_API_KEY": "sk-your-api-key"
      }
    }
  }
}
```

**Claude Code** — add to `.mcp.json` or `~/.claude/mcp.json`:
```json
{
  "mcpServers": {
    "halfcall": {
      "command": "npx",
      "args": ["-y", "halfcall-agent-toolkit"],
      "env": {
        "HALFCALL_API_KEY": "sk-your-api-key"
      }
    }
  }
}
```

### Option B: Claude Code Skill (optional, on top of Option A)

The skill teaches Claude the platform's concepts and workflows; the tools themselves still come from the MCP server, so configure Option A first.

```bash
git clone git@github.com:halfcall/agent-toolkit.git ~/.claude/skills/halfcall
```

Then type `/halfcall` in Claude Code to activate.

### Get Your API Key

Sign up at [halfcall.cn](https://halfcall.cn) (China), go to **Settings > API Keys**, and create a new key. International site [onvocall.com](https://onvocall.com) coming soon.

## What Your Agent Can Do

### 26 built-in tools across 6 categories (plus the platform assistant tools below):

**Authentication**
| Tool | What it does |
|------|-------------|
| `verify_auth` | Check if the API key works, which workspace it belongs to, and which permission scopes it has |

**Basic Info**
| Tool | What it does |
|------|-------------|
| `list_programs` | See all campaigns and their digital employees |
| `create_program` | Spin up a new campaign (needs at least one line) |
| `list_bots` | See which digital employees are in a campaign |
| `update_program_bots` | Set a campaign's digital-employee lineup (full replace) |
| `get_line_status` | Idle line count — check before pushing a burst of leads |
| `list_trunks` | See calling lines available to your workspace |
| `list_voices` | See TTS voices available to your workspace |

**Lead Management**
| Tool | What it does |
|------|-------------|
| `get_lead_fields` | Get the exact variable keys a bot expects, before you push |
| `push_lead` | Push a phone number into a program. The digital employee calls it automatically. |
| `upload_leads` | Bulk-import leads from a local Excel/CSV file |
| `download_lead_template` | Get the header-row template for bulk lead upload |
| `query_lead` | Check what happened on a call: did they answer? how long? interested? |
| `batch_query_leads` | Check hundreds of leads at once. Filter by date, program, or ID. |
| `cancel_lead` | Pull back leads that are still queued (not yet dialed) |

**Campaign Management**
| Tool | What it does |
|------|-------------|
| `control_program` | Start or pause a campaign with one command |
| `get_program_stats` | Today's numbers: calls made, connect rate, intent breakdown |
| `get_dialing_config` | Current settings: how fast, what hours, what priority |
| `update_dialing_config` | Tune the dialer: more concurrent calls, different hours, etc. |

**Digital Employee Management**
| Tool | What it does |
|------|-------------|
| `get_bot_script` | Read the conversation script — how the digital employee thinks and talks |
| `update_bot_script` | Change the script/greeting/clue fields. New calls use the updated version immediately. |
| `update_bot_voice` | Change the digital employee's TTS voice and tuning (speed/volume/pitch/emotion) |
| `get_bot_extract` | See what data gets pulled from calls, and where high-intent leads get pushed |
| `update_bot_extract` | Change what gets extracted and where it's routed (Feishu/WeChat/DingTalk/API) |

**Webhook**
| Tool | What it does |
|------|-------------|
| `get_webhook` | Check if real-time callbacks are configured |
| `update_webhook` | Set a URL to receive POST notifications after every call |

**Platform assistant tools (loaded dynamically, new in 0.3.0)**

On startup the toolkit also pulls the same tools the platform's own WeChat assistant uses, straight from the backend — new capabilities appear without a toolkit release. Permissions follow **the API key's creator** (same rules as the dashboard: department project scope, "collaboration" switches for editing scripts/lines), narrowed further by the key's scopes. Only tools the key can use are registered. Descriptions and results are in Chinese.

| Tool | What it does |
|------|-------------|
| `query_status` | Today's calls / connects / high-intent per project |
| `check_balance` | Workspace balance and plan |
| `export_leads_excel` | Filter leads (date, tag, intent, connected, duration…) and export Excel with chosen columns incl. recordings — returns a download link |
| `redial_leads` | Re-queue leads on the original list by the same filters (preview first, then confirm) |
| `pause_resume`, `modify_work_time`, `modify_concurrency` | Run control and dialing strategy |
| `modify_trunk`, `modify_trunk_concurrency` | Switch lines / line concurrency (needs "collaboration lines") |
| `update_bot`, `modify_welcome`, `toggle_bot_feature`, `regen_bot` | Edit prompt, opener, voice, features (needs "collaboration") |
| `platform_list_voices` | Voices filtered by tags (gender / age / industry / style) |
| `new_project` → `confirm_step` / `revise_step` / `cancel_step` / `provide_trial_phone` | Create a project from one sentence, preview, trial call |
| `import_leads_batch`, `push_lead_to_dial`, `trigger_test_call`, `generate_recharge_qrcode`, `update_project` | Leads, trial calls, top-up QR code, project settings |

Tools whose names clash with built-in ones get a `platform_` prefix (`platform_list_programs`, `platform_list_voices`).

## Talk to Your Agent Naturally

> "Push these 50 phone numbers to the sales digital employee and let me know when we have results."

> "How's the renewal campaign doing today? What's our connect rate?"

> "The digital employee's opening is too aggressive. Pull up the script and make it more conversational."

> "Set up a webhook so every call result gets pushed to our Slack channel."

> "Pause the reminder campaign, it's after business hours."

> "Show me all the high-intent leads from yesterday's run."

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HALFCALL_API_KEY` | Yes | — | Your API key from the dashboard |
| `HALFCALL_BASE_URL` | No | `https://api.halfcall.cn` | API endpoint. Keep the default — halfcall.cn, uereport.com and onvocall.com accounts all use the same platform and the same API keys |
| `HALFCALL_TIMEOUT` | No | `30000` | Request timeout in milliseconds |
| `HALFCALL_SESSION_ID` | No | random per process | Conversation id for multi-step platform flows (e.g. project creation); set it to share state across restarts |

> Migrating from `smartcall-agent-toolkit`: since 0.4.0 the package is `halfcall-agent-toolkit` and env vars are `HALFCALL_*`. The old `SMARTCALL_*` names are still accepted — just switch the package name in your `npx` args.

## Development

```bash
git clone git@github.com:halfcall/agent-toolkit.git
cd agent-toolkit
npm install
npm run build

# Run locally
HALFCALL_API_KEY=sk-xxx npm start
```

## About

Onvocall Agent Toolkit is open source and maintained by [OnvoCall](https://onvocall.com) (事半科技).

Onvocall builds digital employees that think, listen, and talk like real people. Every enterprise deserves its own team of digital employees.

- International: [onvocall.com](https://onvocall.com)
- China: [halfcall.cn](https://halfcall.cn)

## License

[MIT](LICENSE)

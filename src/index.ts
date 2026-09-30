#!/usr/bin/env node

/**
 * Smart-Call Agent Toolkit
 *
 * Gives any AI agent (Claude, GPT, etc.) the power of enterprise-grade
 * AI outbound calling via MCP + Claude Code Skill.
 *
 * Usage:
 *   SMARTCALL_API_KEY=sk-xxx npx smartcall-agent-toolkit
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { SmartCallClient } from './client.js'
import { registerAuthTools } from './tools/auth.js'
import { registerLeadTools } from './tools/leads.js'
import { registerProgramTools } from './tools/programs.js'
import { registerBotTools } from './tools/bots.js'
import { registerPlatformTools } from './tools/platform.js'

const API_KEY = process.env.SMARTCALL_API_KEY
const BASE_URL = process.env.SMARTCALL_BASE_URL ?? 'https://api.halfcall.cn'
const TIMEOUT = Number(process.env.SMARTCALL_TIMEOUT) || 30_000

if (!API_KEY) {
  console.error('Error: SMARTCALL_API_KEY environment variable is required.')
  console.error('Get your API key from the Smart-Call dashboard → Settings → API Keys.')
  process.exit(1)
}

const client = new SmartCallClient({
  apiKey: API_KEY,
  baseUrl: BASE_URL,
  timeout: TIMEOUT,
})

const server = new McpServer({
  name: 'smartcall',
  version: '0.3.1',
  description: 'Smart-Call AI Outbound Calling Platform. Push leads, manage programs, control bots, and query call results.',
})

// Register all tool groups
registerAuthTools(server, client)
registerLeadTools(server, client)
registerProgramTools(server, client)
registerBotTools(server, client)

// Platform tools (same as the platform's WeChat assistant): fetched from the backend at startup
const localNames = new Set<string>(Object.keys((server as any)._registeredTools ?? {}))
const platformCount = await registerPlatformTools(server, client, localNames)
if (platformCount > 0) console.error(`[smartcall] ${platformCount} platform tools registered`)

// Start stdio transport
const transport = new StdioServerTransport()
await server.connect(transport)

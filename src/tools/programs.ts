import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import type { SmartCallClient } from '../client.js'

export function registerProgramTools(server: McpServer, client: SmartCallClient) {
  server.registerTool(
    'list_programs',
    {
      description: 'List all AI outbound calling programs in your workspace. Programs contain bots, leads, and dialing configurations. Filter by run state to see only active or paused programs.',
      inputSchema: {
        runState: z.enum(['RUNNING', 'PAUSED']).optional().describe('Filter by program state'),
        page: z.number().optional().describe('Page number (default 1)'),
        pageSize: z.number().optional().describe('Page size (default 20, max 100)'),
      },
    },
    async ({ runState, page, pageSize }) => {
      try {
        const result = await client.listPrograms({ runState, page, pageSize })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to list programs: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'create_program',
    {
      description: 'Create a new outbound calling program. Requires at least one trunkId (see list_trunks). Created PAUSED by default — call control_program to start it once leads and bots are set up. Note: your workspace must have collaboration (collabEnabled) turned on by the platform for this to succeed.',
      inputSchema: {
        name: z.string().describe('Program name'),
        trunkIds: z.array(z.string()).describe('Line/trunk IDs to dial through, at least one (see list_trunks for trunkId values)'),
        bots: z.array(z.object({ botId: z.string(), stage: z.number().optional() })).optional().describe('Bots to attach at creation time (botId is the bot\'s identify); omit to create an empty program and attach later with update_program_bots'),
        description: z.string().optional(),
        callType: z.enum(['Need', 'Long']).optional().describe('"Need" = on-demand (default), "Long" = long-running'),
        operationType: z.enum(['Intention', 'StockConversion', 'ServiceCare', 'SelfService']).optional(),
        wechatType: z.enum(['None', 'Personal', 'Business']).optional(),
        judgeMode: z.enum(['ScoreMode', 'IntentionMode']).optional(),
        runState: z.enum(['RUNNING', 'PAUSED']).optional().describe('Defaults to PAUSED to avoid dialing immediately'),
        maxConcurrency: z.number().optional().describe('1-500, default 50'),
        ringingTimeout: z.number().optional().describe('Seconds, 5-120, default 30'),
        maxCallDuration: z.number().optional().describe('Seconds, 0 = unlimited (default) or at least 15'),
        dailyCapMetric: z.enum(['DIALED', 'REACHED']).optional(),
        maxDailyCap: z.number().optional().describe('0 = unlimited (default)'),
        dialIntervalSec: z.number().optional(),
        webhookUrl: z.string().optional().describe('call.settled webhook URL (can also be set later with update_webhook)'),
        webhookSecret: z.string().optional(),
        workTimeConfig: z.any().optional().describe('Defaults to weekdays 9-12 + 14-18 if omitted'),
        smsFee: z.number().optional(),
        effectPrice: z.number().optional(),
      },
    },
    async (params) => {
      try {
        const result = await client.createProgram(params)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to create program: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'update_program_bots',
    {
      description: 'Set the bots attached to a program. WARNING: this is a FULL REPLACE, not incremental — the entire bot list is cleared and rebuilt from what you pass. To add one bot without dropping the others, call list_bots first and include its existing bots in this call.',
      inputSchema: {
        programId: z.string().describe('The program ID'),
        bots: z.array(z.object({ botId: z.string(), stage: z.number().optional() })).describe('Complete replacement bot list, at least one entry (botId is the bot\'s identify; stage defaults to 1)'),
      },
    },
    async ({ programId, bots }) => {
      try {
        const result = await client.updateProgramBots(programId, bots)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to update program bots: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'control_program',
    {
      description: 'Start or pause an AI outbound calling program. When started, the program will automatically dial queued leads. When paused, no new calls will be made (in-progress calls continue).',
      inputSchema: {
        programId: z.string().describe('The program ID to control'),
        action: z.enum(['start', 'pause']).describe('Action: "start" to begin dialing, "pause" to stop'),
      },
    },
    async ({ programId, action }) => {
      try {
        const result = await client.controlProgram(programId, action)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to ${action} program: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'get_line_status',
    {
      description: 'Check a program\'s current line usage — max concurrency, current concurrency, and idle line count. Check idle > 0 before pushing a burst of leads.',
      inputSchema: {
        programId: z.string().describe('The program ID'),
      },
    },
    async ({ programId }) => {
      try {
        const result = await client.getLineStatus(programId)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to get line status: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'list_trunks',
    {
      description: 'List the calling lines (trunks) visible to your workspace — your own lines plus any shared lines opened to you. trunkId values from here are required to create_program.',
      inputSchema: {
        status: z.enum(['Normal', 'Band']).optional().describe('Filter by status: Normal = usable, Band = banned'),
        page: z.number().optional(),
        pageSize: z.number().optional().describe('Default 20, max 100'),
      },
    },
    async ({ status, page, pageSize }) => {
      try {
        const result = await client.listTrunks({ status, page, pageSize })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to list trunks: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'list_voices',
    {
      description: 'List TTS voices visible to your workspace — global shared voices plus your own cloned voices. voiceModelId values from here are used with update_bot_voice.',
      inputSchema: {
        status: z.enum(['active', 'disabled']).optional(),
        page: z.number().optional(),
        pageSize: z.number().optional().describe('Default 20, max 100'),
      },
    },
    async ({ status, page, pageSize }) => {
      try {
        const result = await client.listVoices({ status, page, pageSize })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to list voices: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'get_program_stats',
    {
      description: 'Get calling statistics for a program: total calls, connected calls, average duration, intent breakdown (high/hesitate), and detailed reached-status counts. Optionally filter by date.',
      inputSchema: {
        programId: z.string().describe('The program ID'),
        date: z.string().optional().describe('Date filter (YYYY-MM-DD), defaults to today'),
      },
    },
    async ({ programId, date }) => {
      try {
        const result = await client.getProgramStats(programId, { date })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to get program stats: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'get_dialing_config',
    {
      description: 'Get the dialing configuration for a program: max concurrency, priority strategy (LIFO/FIFO), work time windows, and block time settings.',
      inputSchema: {
        programId: z.string().describe('The program ID'),
      },
    },
    async ({ programId }) => {
      try {
        const result = await client.getDialingConfig(programId)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to get dialing config: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'update_dialing_config',
    {
      description: 'Update dialing configuration for a program. Control concurrency, call priority, and work time windows. All fields optional — only what you pass gets changed.',
      inputSchema: {
        programId: z.string().describe('The program ID'),
        maxConcurrency: z.number().optional().describe('Max concurrent calls, 1-500'),
        priorityStrategy: z.enum(['LIFO', 'FIFO']).optional().describe('Call priority: LIFO (newest first) or FIFO (oldest first)'),
        workTimeConfig: z.any().optional().describe('Allowed calling time windows (callTimeSlots: [{ id, start, end, days }], start/end in minutes from midnight, days 1=Mon..7=Sun)'),
        blockStartTime: z.number().nullable().optional().describe('Absolute block-out start, minutes from midnight (e.g. 1260 = 21:00). Takes priority over workTimeConfig. Set null to disable.'),
        blockEndTime: z.number().nullable().optional().describe('Absolute block-out end, minutes from midnight (e.g. 480 = 08:00). Set null to disable.'),
      },
    },
    async ({ programId, maxConcurrency, priorityStrategy, workTimeConfig, blockStartTime, blockEndTime }) => {
      try {
        const config: Record<string, any> = {}
        if (maxConcurrency !== undefined) config.maxConcurrency = maxConcurrency
        if (priorityStrategy !== undefined) config.priorityStrategy = priorityStrategy
        if (workTimeConfig !== undefined) config.workTimeConfig = workTimeConfig
        if (blockStartTime !== undefined) config.blockStartTime = blockStartTime
        if (blockEndTime !== undefined) config.blockEndTime = blockEndTime
        const result = await client.updateDialingConfig(programId, config)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to update dialing config: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'get_webhook',
    {
      description: 'Get the simple call.settled webhook configuration for a program (URL + whether a signing secret is set). Note: this is a lightweight notification (phone/duration/intention only) — it is NOT the richer 话单回调 with full chat logs, which is configured per-bot via update_bot_extract with pushType "api" instead.',
      inputSchema: {
        programId: z.string().describe('The program ID'),
      },
    },
    async ({ programId }) => {
      try {
        const result = await client.getWebhook(programId)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to get webhook config: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'update_webhook',
    {
      description: 'Set or update the simple call.settled webhook URL for a program. After each call is settled, a POST with {event:"call.settled", data:{...}} is sent to this URL, signed via X-SmartCall-Signature (HMAC-SHA256 of the raw JSON body) when webhookSecret is set. Set webhookUrl to null to disable.',
      inputSchema: {
        programId: z.string().describe('The program ID'),
        webhookUrl: z.string().nullable().optional().describe('Webhook URL to receive call results (set null to disable)'),
        webhookSecret: z.string().nullable().optional().describe('Secret key for HMAC-SHA256 signature verification'),
      },
    },
    async ({ programId, webhookUrl, webhookSecret }) => {
      try {
        const config: Record<string, any> = {}
        if (webhookUrl !== undefined) config.webhookUrl = webhookUrl
        if (webhookSecret !== undefined) config.webhookSecret = webhookSecret
        const result = await client.updateWebhook(programId, config)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to update webhook: ${err.message}` }],
          isError: true,
        }
      }
    }
  )
}

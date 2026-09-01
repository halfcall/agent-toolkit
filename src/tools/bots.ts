import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import type { SmartCallClient } from '../client.js'

const clueItemSchema = z.object({
  key: z.string(),
  name: z.string(),
  description: z.string(),
  required: z.boolean().optional(),
})

export function registerBotTools(server: McpServer, client: SmartCallClient) {
  server.registerTool(
    'list_bots',
    {
      description: 'List all AI bots in a program, with stage (call sequence order), enabled status, and script hot-init status.',
      inputSchema: {
        programId: z.string().describe('The program ID'),
      },
    },
    async ({ programId }) => {
      try {
        const result = await client.listBots(programId)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to list bots: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'get_bot_script',
    {
      description: 'Get a bot\'s conversation script: prompt, greeting (opening line), the clue/variable fields the prompt can reference, and transfer-to-human field config. Do not confuse clueItems (input variables available before the call starts) with extraction fields (data pulled OUT of the conversation afterward — see get_bot_extract).',
      inputSchema: {
        botId: z.string().describe('The bot ID'),
      },
    },
    async ({ botId }) => {
      try {
        const result = await client.getBotScript(botId)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to get bot script: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'update_bot_script',
    {
      description: 'Update a bot\'s conversation script. All fields optional, but at least one is required. Takes effect immediately (no manual "reinitialize" needed). clueItems/transferItems are a FULL REPLACE of the custom fields — built-in system fields (user_phone/phone4/current_time) are preserved automatically and can\'t be edited here.',
      inputSchema: {
        botId: z.string().describe('The bot ID'),
        prompt: z.string().optional().describe('The conversation script/prompt'),
        greeting: z.string().optional().describe('Opening line spoken before the AI-generated conversation starts. Only overrides the FIRST greeting line — scripts with multiple greeting lines can\'t be edited via API.'),
        clueItems: z.array(clueItemSchema).optional().describe('Custom {key} template variables the prompt/greeting can reference (full replace of custom fields; built-in fields are kept automatically)'),
        transferEnabled: z.boolean().optional().describe('Whether transfer-to-human lead collection is enabled'),
        transferItems: z.array(clueItemSchema).optional().describe('Fields to collect for the human transfer target (full replace)'),
      },
    },
    async ({ botId, prompt, greeting, clueItems, transferEnabled, transferItems }) => {
      try {
        const result = await client.updateBotScript(botId, { prompt, greeting, clueItems, transferEnabled, transferItems })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to update bot script: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'update_bot_voice',
    {
      description: 'Configure a bot\'s TTS voice and tuning parameters. All fields optional, but at least one required. voiceModelId comes from list_voices and must be visible to your workspace (global shared or your own). Takes effect immediately.',
      inputSchema: {
        botId: z.string().describe('The bot ID'),
        voiceModelId: z.string().optional().describe('From list_voices'),
        speed: z.number().optional(),
        volume: z.number().optional(),
        pitch: z.number().optional(),
        emotion: z.string().optional().describe('Supported values depend on the chosen voice\'s provider'),
      },
    },
    async ({ botId, voiceModelId, speed, volume, pitch, emotion }) => {
      try {
        const result = await client.updateBotVoice(botId, { voiceModelId, speed, volume, pitch, emotion })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to update bot voice: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'get_bot_extract',
    {
      description: 'Get a bot\'s post-call extraction config: what structured data the AI pulls out of the conversation (items), and where high-intent results get pushed (Feishu/WeChat/DingTalk/API webhook).',
      inputSchema: {
        botId: z.string().describe('The bot ID'),
      },
    },
    async ({ botId }) => {
      try {
        const result = await client.getBotExtract(botId)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to get bot extract config: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'update_bot_extract',
    {
      description: 'Update a bot\'s post-call extraction fields and intention-push config. All fields optional, but at least one required. Only covers extraction items + push routing — retry policy, push time windows, and the full 话单回调 chat-log callback are dashboard-only. Takes effect immediately.',
      inputSchema: {
        botId: z.string().describe('The bot ID'),
        prompt: z.string().optional().describe('Extraction prompt guiding what the AI pulls from the conversation'),
        items: z.array(z.object({ key: z.string(), name: z.string(), description: z.string() })).optional().describe('Fields to extract (full replace)'),
        pushType: z.enum(['none', 'feishu', 'wechat', 'dingtalk', 'api']).optional(),
        pushOnlyIntent: z.boolean().optional().describe('Only push high-intent results'),
        pushTitle: z.string().optional(),
        pushWebhook: z.string().optional().describe('Webhook URL (feishu/dingtalk/api), or WeChat group/friend ID for pushType "wechat"'),
        pushTarget: z.enum(['group', 'person']).nullable().optional().describe('WeChat only: push to a group or a person'),
        pushAppKey: z.string().optional(),
        feishuAppId: z.string().optional(),
        feishuAppSecret: z.string().optional(),
        feishuSignSecret: z.string().optional(),
        dingtalkSecret: z.string().optional(),
      },
    },
    async (params) => {
      const { botId, ...rest } = params
      try {
        const result = await client.updateBotExtract(botId, rest)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to update bot extract config: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'download_lead_template',
    {
      description: 'Download the Excel header-row template for bulk lead upload (column names = the bot\'s field labels). Since this tool can only return text, prefer get_lead_fields for reading the field list programmatically; use this one when you need to hand a human a ready-made .xlsx to fill in.',
      inputSchema: {
        programId: z.string().describe('The program ID'),
        botId: z.string().optional().describe('Optional bot ID for a bot-specific template; defaults to the program\'s first enabled bot'),
        savePath: z.string().optional().describe('If given, saves the .xlsx bytes to this local absolute path instead of just reporting metadata'),
      },
    },
    async ({ programId, botId, savePath }) => {
      try {
        const { contentType, bytes, suggestedFilename } = await client.downloadLeadTemplate(programId, botId)
        let saved: string | null = null
        if (savePath) {
          const { writeFile } = await import('node:fs/promises')
          await writeFile(savePath, bytes)
          saved = savePath
        }
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ contentType, suggestedFilename, sizeBytes: bytes.byteLength, savedTo: saved }, null, 2),
          }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to download template: ${err.message}` }],
          isError: true,
        }
      }
    }
  )
}

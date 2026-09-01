import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import type { SmartCallClient } from '../client.js'

export function registerLeadTools(server: McpServer, client: SmartCallClient) {
  server.registerTool(
    'get_lead_fields',
    {
      description: 'Get the exact variable keys a bot expects for push_lead (e.g. "org_name", not the Chinese label "单位名称"). Call this before push_lead to avoid 400 errors from unknown/missing fields.',
      inputSchema: {
        programId: z.string().describe('The program ID'),
        botId: z.string().optional().describe('Bot ID (defaults to the lowest-stage enabled bot in the program)'),
      },
    },
    async ({ programId, botId }) => {
      try {
        const result = await client.getLeadFields(programId, botId)
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to get lead fields: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'push_lead',
    {
      description: 'Push a phone number to an AI outbound calling program. The lead is queued and called automatically once the program is RUNNING. Returns a threadId you can use to query the call result later. Pushing the same phone again the same day re-queues it (use contextId to keep same-day pushes independent instead of overwriting).',
      inputSchema: {
        programId: z.string().describe('The program ID to push the lead to'),
        phone: z.string().describe('Phone number to call (e.g. 13800138000)'),
        botId: z.string().optional().describe('Bot ID to validate variables against (defaults to the lowest-stage enabled bot)'),
        variables: z.record(z.string(), z.any()).optional().describe('Custom variables for the call script, keyed by the field keys from get_lead_fields (e.g. { org_name: "Acme" })'),
        contextId: z.string().optional().describe('Your own business identifier. Same phone + same contextId re-queues (old behavior); same phone + different contextId creates an independent, separately-queued record — use this when the same person needs multiple same-day notifications delivered. Echoed back in the call.settled webhook payload as contextId.'),
      },
    },
    async ({ programId, phone, botId, variables, contextId }) => {
      try {
        const result = await client.pushLead({ programId, phone, botId, variables, contextId })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to push lead: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'upload_leads',
    {
      description: 'Bulk-import leads from a local Excel/CSV file (columns must match the bot\'s field labels — see get_lead_fields, or download_lead_template for a ready-made header row). Good for large batches; for a single real-time lead use push_lead instead.',
      inputSchema: {
        programId: z.string().describe('The program ID'),
        filePath: z.string().describe('Absolute path to a local .xls/.xlsx/.csv file (max 100MB)'),
        botId: z.string().describe('Bot ID the file\'s columns were built for (must match download_lead_template\'s botId)'),
        name: z.string().optional().describe('Name for this lead batch (defaults to the file name)'),
      },
    },
    async ({ programId, filePath, botId, name }) => {
      try {
        const result = await client.uploadLeads({ programId, filePath, botId, name })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to upload leads: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'query_lead',
    {
      description: 'Query the status and call results of a lead. Returns call records with AI intent analysis, duration, recording URL, and conversation summary. Use threadId (returned by push_lead) or programId + phone to look up.',
      inputSchema: {
        threadId: z.string().optional().describe('The threadId returned by push_lead'),
        programId: z.string().optional().describe('Program ID (use with phone)'),
        phone: z.string().optional().describe('Phone number (use with programId)'),
      },
    },
    async ({ threadId, programId, phone }) => {
      try {
        const result = await client.queryLead({ threadId, programId, phone })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to query lead: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'batch_query_leads',
    {
      description: 'Query status and call results for multiple leads at once. Filter by threadIds, programId, or date. More efficient than calling query_lead repeatedly. Note: only the latest call per lead is included here — for a lead\'s full call history use query_lead.',
      inputSchema: {
        threadIds: z.array(z.string()).optional().describe('List of threadIds to query (max 100)'),
        programId: z.string().optional().describe('Filter by program ID'),
        date: z.string().optional().describe('Filter by date (YYYY-MM-DD)'),
        page: z.number().optional().describe('Page number (default 1)'),
        pageSize: z.number().optional().describe('Page size (default 20, max 100)'),
      },
    },
    async ({ threadIds, programId, date, page, pageSize }) => {
      try {
        const result = await client.batchQueryLeads({ threadIds, programId, date, page, pageSize })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to batch query leads: ${err.message}` }],
          isError: true,
        }
      }
    }
  )

  server.registerTool(
    'cancel_lead',
    {
      description: 'Cancel a lead that is still queued (not yet dialed). Pass threadDetailId to cancel one lead, or programId to cancel every currently-queued lead in that program (e.g. a meeting got called off). Leads already dialed or completed are unaffected and won\'t error.',
      inputSchema: {
        threadDetailId: z.string().optional().describe('Cancel this one lead (mutually exclusive with programId)'),
        programId: z.string().optional().describe('Cancel all currently-queued leads in this program (mutually exclusive with threadDetailId)'),
      },
    },
    async ({ threadDetailId, programId }) => {
      try {
        const result = await client.cancelLead({ threadDetailId, programId })
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Failed to cancel lead: ${err.message}` }],
          isError: true,
        }
      }
    }
  )
}

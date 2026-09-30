import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SmartCallClient } from '../client.js'

/**
 * Platform tools — the same MCP tools the platform's own WeChat assistant ("花花") uses,
 * served dynamically by the backend (GET /api/v1/external/mcp/tools). New capabilities
 * added on the platform show up here without a toolkit release.
 *
 * Permissions follow the API key's creator (same rules as the dashboard), further
 * narrowed by the key's scopes. Tool descriptions and results are in Chinese.
 */

interface PlatformToolDef {
  name: string
  description: string
  inputSchema: { type: 'object'; properties?: Record<string, any>; required?: string[] }
  scope: string
  available: boolean
}

function toZodShape(schema: PlatformToolDef['inputSchema']): Record<string, z.ZodTypeAny> {
  const required = new Set(schema.required ?? [])
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const [key, def] of Object.entries<any>(schema.properties ?? {})) {
    let t: z.ZodTypeAny
    switch (def?.type) {
      case 'string':
        t = z.string()
        break
      case 'number':
      case 'integer':
        t = z.number()
        break
      case 'boolean':
        t = z.boolean()
        break
      case 'array':
        t = z.array(z.any())
        break
      case 'object':
        t = z.record(z.string(), z.any())
        break
      default:
        t = z.any()
    }
    if (def?.description) t = t.describe(def.description)
    shape[key] = required.has(key) ? t : t.optional()
  }
  return shape
}

function formatResult(data: any): string {
  if (data == null) return 'No result'
  if (typeof data !== 'object') return String(data)
  const { message, success, error, ...rest } = data
  const extra = Object.keys(rest).length ? `\n\n${JSON.stringify(rest, null, 2)}` : ''
  return `${message ?? error ?? (success === false ? 'Failed' : 'OK')}${extra}`
}

/**
 * Registers platform tools that the API key can use. Names already taken by local tools
 * get a `platform_` prefix (e.g. platform_list_voices) so both stay available.
 * Returns how many tools were registered; 0 when the backend doesn't support it yet.
 */
export async function registerPlatformTools(
  server: McpServer,
  client: SmartCallClient,
  takenNames: Set<string>,
): Promise<number> {
  let tools: PlatformToolDef[]
  try {
    const res = await client.listPlatformTools()
    tools = res?.data ?? []
  } catch (err: any) {
    console.error(`[smartcall] platform tools unavailable, continuing with built-in tools only: ${err.message}`)
    return 0
  }

  // One conversation per toolkit process: multi-step flows (new_project → confirm_step …) keep their state.
  const sessionId = process.env.SMARTCALL_SESSION_ID || randomUUID()
  let count = 0
  for (const tool of tools) {
    if (!tool.available) continue
    const name = takenNames.has(tool.name) ? `platform_${tool.name}` : tool.name
    if (takenNames.has(name)) continue
    takenNames.add(name)
    server.registerTool(
      name,
      {
        description: `[Platform assistant tool · scope ${tool.scope}] ${tool.description}`,
        inputSchema: toZodShape(tool.inputSchema),
      },
      async (args: Record<string, any>) => {
        try {
          const res = await client.callPlatformTool(tool.name, args ?? {}, sessionId)
          const data = res?.data
          return {
            content: [{ type: 'text' as const, text: formatResult(data) }],
            ...(data?.success === false ? { isError: true } : {}),
          }
        } catch (err: any) {
          return { content: [{ type: 'text' as const, text: `${tool.name} failed: ${err.message}` }], isError: true }
        }
      },
    )
    count++
  }
  return count
}

/**
 * Smart-Call API Client
 *
 * Thin HTTP wrapper over the Smart-Call External API.
 * All methods return parsed JSON; errors throw with status + message.
 */

import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'

export interface SmartCallClientConfig {
  apiKey: string
  baseUrl: string
  /** Request timeout in ms, default 30000 */
  timeout?: number
}

export interface ClueItem {
  key: string
  name: string
  description: string
  required?: boolean
}

export class SmartCallClient {
  private apiKey: string
  private baseUrl: string
  private timeout: number

  constructor(config: SmartCallClientConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl.replace(/\/+$/, '')
    this.timeout = config.timeout ?? 30_000
  }

  // ── Auth ──────────────────────────────────────────────

  async verifyAuth(): Promise<any> {
    return this.get('/api/v1/external/auth/verify')
  }

  // ── Leads ─────────────────────────────────────────────

  async getLeadFields(programId: string, botId?: string): Promise<any> {
    const qs = botId ? `?botId=${encodeURIComponent(botId)}` : ''
    return this.get(`/api/v1/external/programs/${programId}/leads/fields${qs}`)
  }

  async pushLead(params: {
    programId: string
    phone: string
    botId?: string
    variables?: Record<string, any>
    contextId?: string
  }): Promise<any> {
    return this.post('/api/v1/external/leads', params)
  }

  async queryLead(params: {
    threadId?: string
    programId?: string
    phone?: string
  }): Promise<any> {
    const qs = new URLSearchParams()
    if (params.threadId) qs.set('threadId', params.threadId)
    if (params.programId) qs.set('programId', params.programId)
    if (params.phone) qs.set('phone', params.phone)
    return this.get(`/api/v1/external/leads?${qs.toString()}`)
  }

  async batchQueryLeads(params: {
    threadIds?: string[]
    programId?: string
    date?: string
    page?: number
    pageSize?: number
  }): Promise<any> {
    const qs = new URLSearchParams()
    if (params.threadIds?.length) qs.set('threadIds', params.threadIds.join(','))
    if (params.programId) qs.set('programId', params.programId)
    if (params.date) qs.set('date', params.date)
    if (params.page) qs.set('page', String(params.page))
    if (params.pageSize) qs.set('pageSize', String(params.pageSize))
    return this.get(`/api/v1/external/leads/batch?${qs.toString()}`)
  }

  async cancelLead(params: { threadDetailId?: string; programId?: string }): Promise<any> {
    return this.post('/api/v1/external/leads/cancel', params)
  }

  /** Downloads the bulk-upload Excel template for a bot's lead fields (writes bytes, returns metadata). */
  async downloadLeadTemplate(programId: string, botId?: string): Promise<{ contentType: string | null; bytes: Uint8Array; suggestedFilename: string | null }> {
    const qs = botId ? `?botId=${encodeURIComponent(botId)}` : ''
    return this.getBinary(`/api/v1/external/programs/${programId}/leads/template${qs}`)
  }

  /** Uploads a filled-in lead Excel/CSV file (from a local path) for bulk import. */
  async uploadLeads(params: { programId: string; filePath: string; botId: string; name?: string }): Promise<any> {
    const { programId, filePath, botId, name } = params
    const fileBuffer = await readFile(filePath)
    const form = new FormData()
    form.append('file', new Blob([fileBuffer]), basename(filePath))
    form.append('botId', botId)
    if (name) form.append('name', name)
    return this.postForm(`/api/v1/external/programs/${programId}/leads/upload`, form)
  }

  // ── Programs ──────────────────────────────────────────

  async listPrograms(params?: {
    runState?: 'RUNNING' | 'PAUSED'
    page?: number
    pageSize?: number
  }): Promise<any> {
    const qs = new URLSearchParams()
    if (params?.runState) qs.set('runState', params.runState)
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    const query = qs.toString()
    return this.get(`/api/v1/external/programs${query ? `?${query}` : ''}`)
  }

  /**
   * Creates a new program. Requires at least one trunkId (see listTrunks).
   * Created PAUSED by default so it won't start dialing immediately.
   */
  async createProgram(params: {
    name: string
    trunkIds: string[]
    bots?: { botId: string; stage?: number }[]
    description?: string
    callType?: 'Need' | 'Long'
    operationType?: 'Intention' | 'StockConversion' | 'ServiceCare' | 'SelfService'
    wechatType?: 'None' | 'Personal' | 'Business'
    judgeMode?: 'ScoreMode' | 'IntentionMode'
    runState?: 'RUNNING' | 'PAUSED'
    maxConcurrency?: number
    ringingTimeout?: number
    maxCallDuration?: number
    dailyCapMetric?: 'DIALED' | 'REACHED'
    maxDailyCap?: number
    dialIntervalSec?: number
    webhookUrl?: string
    webhookSecret?: string
    workTimeConfig?: any
    smsFee?: number
    effectPrice?: number
  }): Promise<any> {
    return this.post('/api/v1/external/programs', params)
  }

  /** Full replace of a program's bots — NOT incremental. Read listProgramBots first if you need to append. */
  async updateProgramBots(programId: string, bots: { botId: string; stage?: number }[]): Promise<any> {
    return this.put(`/api/v1/external/programs/${programId}/bots`, { bots })
  }

  async controlProgram(programId: string, action: 'start' | 'pause'): Promise<any> {
    return this.post(`/api/v1/external/programs/${programId}/run-state`, { action })
  }

  async getProgramStats(programId: string, params?: { date?: string }): Promise<any> {
    const qs = new URLSearchParams()
    if (params?.date) qs.set('date', params.date)
    const query = qs.toString()
    return this.get(`/api/v1/external/programs/${programId}/stats${query ? `?${query}` : ''}`)
  }

  /** Idle line count for the program — check before pushing a burst of leads. */
  async getLineStatus(programId: string): Promise<any> {
    return this.get(`/api/v1/external/programs/${programId}/line-status`)
  }

  async getDialingConfig(programId: string): Promise<any> {
    return this.get(`/api/v1/external/programs/${programId}/dialing-config`)
  }

  async updateDialingConfig(programId: string, config: {
    maxConcurrency?: number
    priorityStrategy?: 'LIFO' | 'FIFO'
    workTimeConfig?: any
    blockStartTime?: number | null
    blockEndTime?: number | null
  }): Promise<any> {
    return this.put(`/api/v1/external/programs/${programId}/dialing-config`, config)
  }

  // ── Bots ──────────────────────────────────────────────

  async listBots(programId: string): Promise<any> {
    return this.get(`/api/v1/external/programs/${programId}/bots`)
  }

  async getBotScript(botId: string): Promise<any> {
    return this.get(`/api/v1/external/bots/${botId}/script`)
  }

  /**
   * Updates a bot's script. At least one field required. clueItems/transferItems are a FULL
   * REPLACE of the custom (non-system) fields — system fields (user_phone/phone4/current_time)
   * are preserved automatically.
   */
  async updateBotScript(botId: string, params: {
    prompt?: string
    greeting?: string
    clueItems?: ClueItem[]
    transferEnabled?: boolean
    transferItems?: ClueItem[]
  }): Promise<any> {
    return this.put(`/api/v1/external/bots/${botId}/script`, params)
  }

  /** Configures TTS voice + tuning params. At least one field required. */
  async updateBotVoice(botId: string, params: {
    voiceModelId?: string
    speed?: number
    volume?: number
    pitch?: number
    emotion?: string
  }): Promise<any> {
    return this.put(`/api/v1/external/bots/${botId}/voice`, params)
  }

  async getBotExtract(botId: string): Promise<any> {
    return this.get(`/api/v1/external/bots/${botId}/extract`)
  }

  /**
   * Updates post-call extraction fields + intention push config. At least one field required.
   * Only touches extraction/push settings — retry policy, push time windows, and the richer
   * 话单回调 (callback) payload/signature scheme are configured on the dashboard, not here.
   */
  async updateBotExtract(botId: string, params: {
    prompt?: string
    items?: { key: string; name: string; description: string }[]
    pushType?: 'none' | 'feishu' | 'wechat' | 'dingtalk' | 'api'
    pushOnlyIntent?: boolean
    pushTitle?: string
    pushWebhook?: string
    pushTarget?: 'group' | 'person' | null
    pushAppKey?: string
    feishuAppId?: string
    feishuAppSecret?: string
    feishuSignSecret?: string
    dingtalkSecret?: string
  }): Promise<any> {
    return this.put(`/api/v1/external/bots/${botId}/extract`, params)
  }

  // ── Trunks & Voices ────────────────────────────────────

  async listTrunks(params?: { status?: 'Normal' | 'Band'; page?: number; pageSize?: number }): Promise<any> {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    const query = qs.toString()
    return this.get(`/api/v1/external/trunks${query ? `?${query}` : ''}`)
  }

  async listVoices(params?: { status?: 'active' | 'disabled'; page?: number; pageSize?: number }): Promise<any> {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    const query = qs.toString()
    return this.get(`/api/v1/external/voices${query ? `?${query}` : ''}`)
  }

  // ── Webhook (simple call.settled notification) ─────────
  //
  // This is the lightweight per-program webhook (HMAC-SHA256 over a small JSON payload).
  // It is NOT the richer 话单回调 (full chat logs, intention tags, X-App-Id/X-Sign-Method
  // signing) described in the platform docs — that one is configured via updateBotExtract
  // with pushType: 'api', not through this endpoint.

  async getWebhook(programId: string): Promise<any> {
    return this.get(`/api/v1/external/programs/${programId}/webhook`)
  }

  async updateWebhook(programId: string, config: {
    webhookUrl?: string | null
    webhookSecret?: string | null
  }): Promise<any> {
    return this.put(`/api/v1/external/programs/${programId}/webhook`, config)
  }

  // ── HTTP helpers ──────────────────────────────────────

  // ── Platform tools (同花花的 MCP 工具，由后端动态下发) ─────

  async listPlatformTools(): Promise<any> {
    return this.request('GET', '/api/v1/external/mcp/tools')
  }

  async callPlatformTool(name: string, args: Record<string, any>, sessionId: string): Promise<any> {
    return this.request('POST', '/api/v1/external/mcp/call', { name, arguments: args, sessionId })
  }

  private async request(method: string, path: string, body?: any): Promise<any> {
    const url = `${this.baseUrl}${path}`
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'User-Agent': 'smartcall-agent-toolkit/0.3.0',
    }

    const init: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.timeout),
    }

    if (body) {
      headers['Content-Type'] = 'application/json'
      init.body = JSON.stringify(body)
    }

    const res = await fetch(url, init)
    const data: any = await res.json()

    if (!res.ok) {
      const msg = data?.msg || data?.message || res.statusText
      throw new Error(`Smart-Call API error ${res.status}: ${msg}`)
    }

    return data
  }

  private async requestForm(path: string, form: FormData): Promise<any> {
    const url = `${this.baseUrl}${path}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
      body: form,
      signal: AbortSignal.timeout(this.timeout),
    })
    const data: any = await res.json()
    if (!res.ok) {
      const msg = data?.msg || data?.message || res.statusText
      throw new Error(`Smart-Call API error ${res.status}: ${msg}`)
    }
    return data
  }

  private async requestBinary(path: string): Promise<{ contentType: string | null; bytes: Uint8Array; suggestedFilename: string | null }> {
    const url = `${this.baseUrl}${path}`
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
      signal: AbortSignal.timeout(this.timeout),
    })
    if (!res.ok) {
      // Error responses are JSON, unlike the successful binary payload.
      const data: any = await res.json().catch(() => ({}))
      throw new Error(`Smart-Call API error ${res.status}: ${data?.msg || data?.message || res.statusText}`)
    }
    const buf = new Uint8Array(await res.arrayBuffer())
    const disposition = res.headers.get('content-disposition')
    const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^;"]+)"?/i)
    return {
      contentType: res.headers.get('content-type'),
      bytes: buf,
      suggestedFilename: match ? decodeURIComponent(match[1]) : null,
    }
  }

  private get(path: string) {
    return this.request('GET', path)
  }

  private post(path: string, body: any) {
    return this.request('POST', path, body)
  }

  private put(path: string, body: any) {
    return this.request('PUT', path, body)
  }

  private postForm(path: string, form: FormData) {
    return this.requestForm(path, form)
  }

  private getBinary(path: string) {
    return this.requestBinary(path)
  }
}

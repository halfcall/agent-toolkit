---
name: halfcall
description: |
  事半AI 数字员工平台（halfcall.cn）的 Agent 工具包：让 Claude 等 AI Agent 直接调度
  AI 电话数字员工——推送线索自动外呼、查通话结果和意向、启停项目、调并发和拨打时段、
  改话术/开场白/音色、配置通话后意向推送（企微/飞书/钉钉/API）和 Webhook、按条件导出线索
  或重拨、查余额、一句话新建项目。
  当用户提到以下内容时使用：事半AI、事半、halfcall、onvocall、数字员工、AI 外呼、电话机器人、
  外呼项目、推线索、拨打、接通率、意向客户、高意向、话术、开场白、音色、话单回调、Webhook、
  导出线索、重拨、call、outbound、leads、campaign、dialing、bot script、connect rate。
allowed-tools:
  - Bash
  - Read
  - mcp
---

# 事半AI Agent Toolkit — 给你的 Agent 一支数字员工团队

[事半AI](https://halfcall.cn) 是事半科技打造的 **AI 数字员工平台**。数字员工由大模型驱动，能打真实的电话：开场白、产品介绍、异议处理、随时被打断、感知情绪、判断意向、需要时无感转人工，支持企业级并发、7x24 小时工作。

这个 Skill 配合 MCP Server **`halfcall-agent-toolkit`**（npm 包）使用，把整套平台能力交给你的 AI Agent：不用登后台、不用手动传 Excel，跟 Agent 说一句话，数字员工就开始打电话。

典型用法：

> "把这 50 个手机号推给销售数字员工，有结果了告诉我。"
> "今天续费项目跑得怎么样？接通率多少？"
> "开场白太生硬了，改得自然点。"
> "配个回调，每通电话结果推到我们的飞书群。"
> "暂停催收项目，已经下班了。"
> "把昨天的高意向客户导出来，带录音。"

适用场景：拓客 Cold Call、线索筛选、续费挽留、预约/改期确认、电话调研、催缴提醒、活动邀约、沉睡客户唤醒、患者随访等。

---

## 安装配置（使用前必须先完成）

本 Skill 只负责教 Agent 理解平台概念和操作流程，**真正的工具由 MCP Server 提供**，所以必须先配好 MCP。

### 1. 获取 API Key

在 [halfcall.cn](https://halfcall.cn) 注册登录 → **设置 › API 密钥** → 创建新密钥（形如 `sk-xxx`）。创建时可勾选权限范围（见下文「权限范围」）。

### 2. 配置 MCP Server

**Claude Desktop**（`claude_desktop_config.json`）、**Claude Code**（`.mcp.json` 或 `~/.claude/mcp.json`），以及其它支持 MCP 的客户端，配置格式相同：

```json
{
  "mcpServers": {
    "halfcall": {
      "command": "npx",
      "args": ["-y", "halfcall-agent-toolkit"],
      "env": {
        "HALFCALL_API_KEY": "sk-你的密钥"
      }
    }
  }
}
```

可选环境变量：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `HALFCALL_API_KEY` | —（必填） | 控制台创建的 API 密钥 |
| `HALFCALL_BASE_URL` | `https://api.halfcall.cn` | 保持默认即可。halfcall.cn、onvocall.com 等站点的账号是同一个平台、同一套 API Key |
| `HALFCALL_TIMEOUT` | `30000` | 请求超时（毫秒） |
| `HALFCALL_SESSION_ID` | 每个进程随机 | 多步流程（如一句话建项目）的会话 id；想在重启后继续之前的流程就固定一个值 |

> 从旧包 `smartcall-agent-toolkit` 迁移：0.4.0 起包名改为 `halfcall-agent-toolkit`，环境变量改为 `HALFCALL_*`；旧的 `SMARTCALL_*` 仍然兼容。

### 3. 验证

在 Agent 里调用 `verify_auth`：返回 `workspaceId`、`apiKeyId` 和 `scopes` 即表示配置成功。如果工具不存在或报 401，回到第 2 步检查配置和密钥。

---

## 核心概念

- **项目（Program）**：一个外呼任务。包含数字员工、线路、线索和拨打设置。`runState` 为 `RUNNING` / `PAUSED`；`executionMode` 必须是 `Stream` 才能接收 API 推送的线索（`Batch` 模式会拒绝 `push_lead`）。
- **数字员工（Bot）**：项目里负责打电话的 AI，用 `botId`（即数字员工的 8 位编号 `identify`）标识。每个数字员工有自己的话术（提示词 + 开场白）、音色、线索字段（输入变量）和提取配置（通话后从对话里提取的数据）。一个项目可以有多个数字员工分阶段工作（如 stage 1 首呼、stage 2 跟进）。
- **线路（Trunk）**：外呼线路，建项目时必须指定（`trunkIds`）。`list_trunks` 返回本企业自有线路 + 共享给你的线路。
- **线索（ThreadDetail）**：排队等待拨打的手机号。API 推送后返回 `threadId`（即 `threadDetailId`），用来追踪结果。
- **线索字段 ≠ 提取字段，不要混淆**：线索字段（`get_bot_script` 的 `clueItems`、`get_lead_fields`）是通话**前**就有的输入变量，用于 `push_lead` 的 `variables` 和话术里的 `{key}` 模板；提取字段（`get_bot_extract`）是通话**后**从对话里提取出来的输出数据。
- **意向等级（intention）**：`HIGH`（高意向）、`HESITATE`（犹豫）、`LOW_DIFFICULTY` / `HIGH_DIFFICULTY`（沟通难度分类）、`REACHED`（已接通未分类）、`UNKNOW`（未知）、`NONE`（未分析/不适用）。挂断后几秒内可能是 `UNKNOW`，因为 AI 分析还在跑，稍后再查即可。
- **接通状态（reached，共 12 个值）**：`REACHED`（通话中的瞬时态）、`AGENT_END` / `SEAT_END` / `USER_END`（已接通，分别由 AI / 人工坐席 / 客户挂断）、`UNREACHED`（响铃未接）、`CALL_REJECTED`（拒接）、`EMPTY_PHONE` / `SHUTDOWN`（空号 / 关机）、`UN_CONNECT`（未建立呼叫）、`INVALID`（其它失败）、`CALLER_ABNORMAL`（主叫线路异常）、`INIT` / `PREPARE` / `DIALED`（进行中，尚无结果）。判断"是否接通"用 `reached in [REACHED, AGENT_END, SEAT_END, USER_END]`，或退而用 `duration > 0`。

## 权限范围（Scope）

API Key 按 scope 授权。缺少某个 scope 时，该组所有工具都会返回 `403`——这是最常见的"为什么失败"，**先用 `verify_auth` 看清楚有哪些 scope，不要盲目重试**：

| Scope | 范围 | 工具 |
|-------|------|------|
| `READ` | 所有查询 | `list_programs`、`list_bots`、`get_line_status`、`list_trunks`、`list_voices`、`get_program_stats`、`get_dialing_config`、`get_webhook`、`get_lead_fields`、`query_lead`、`batch_query_leads`、`get_bot_script`、`get_bot_extract`、`download_lead_template`（`verify_auth` 不需要任何 scope） |
| `LEADS` | 线索生命周期 | `push_lead`、`upload_leads`、`cancel_lead` |
| `CONTROL` | 项目级控制 | `create_program`、`update_program_bots`、`control_program`、`update_dialing_config`、`update_webhook` |
| `SCRIPT` | 风险最高——会改变数字员工对真实客户说的话 | `update_bot_script`、`update_bot_voice`、`update_bot_extract` |

遇到 "missing required scope" 的 403，直接告诉用户去控制台给 Key 加上对应 scope。

---

## 内置工具（6 类 26 个）

### 认证
| 工具 | 参数 | Scope | 说明 |
|------|------|-------|------|
| `verify_auth` | 无 | 任意 | 校验 Key，返回 `workspaceId`、`apiKeyId`、`scopes` |

### 基础信息（项目、数字员工、线路、音色）
| 工具 | 参数 | Scope | 说明 |
|------|------|-------|------|
| `list_programs` | `runState?`、`page?`、`pageSize?` | READ | 列出企业下的项目 |
| `create_program` | `name`、`trunkIds`（必填）、`bots?` 及其它可选字段 | CONTROL | 新建项目，默认 `PAUSED`。企业需开通协作权限（`collabEnabled`） |
| `list_bots` | `programId` | READ | 项目内数字员工：`botId`、`name`、`stage`、`isEnabled`、`hotInitStatus` |
| `update_program_bots` | `programId`、`bots`（**整份替换**） | CONTROL | 设置项目的数字员工列表。只想加一个时先 `list_bots` 读出现有的 |
| `get_line_status` | `programId` | READ | 空闲线路数——批量推线索前确认 `idle > 0` |
| `list_trunks` | `status?`、`page?`、`pageSize?` | READ | 可用线路（自有 + 共享），`trunkId` 用于 `create_program` |
| `list_voices` | `status?`、`page?`、`pageSize?` | READ | 可用音色（自有 + 共享），`voiceModelId` 用于 `update_bot_voice` |

### 线索管理
| 工具 | 参数 | Scope | 说明 |
|------|------|-------|------|
| `get_lead_fields` | `programId`、`botId?` | READ | 数字员工要的准确 `variables` 字段名——`push_lead` 前先调，避免 400 |
| `push_lead` | `programId`、`phone`、`botId?`、`variables?`、`contextId?` | LEADS | 推一个手机号进拨打队列，返回 `threadId`。同号码同一天会复用原线索重新排队；想同日独立推送就传不同的 `contextId` |
| `upload_leads` | `programId`、`filePath`、`botId`、`name?` | LEADS | 从本地 Excel/CSV 批量导入 |
| `download_lead_template` | `programId`、`botId?`、`savePath?` | READ | 下载导入模板（给人填的二进制文件；程序化获取字段用 `get_lead_fields`） |
| `query_lead` | `threadId`，或 `programId` + `phone` | READ | 单条线索的完整通话历史 |
| `batch_query_leads` | `threadIds`，或 `programId`、`date?`、`page?`、`pageSize?` | READ | 批量查询，每条线索只返回最近一次通话 |
| `cancel_lead` | `threadDetailId` 或 `programId` | LEADS | 撤回还在排队、尚未拨打的线索；已拨打/已完成的不受影响，也不报错 |

### 项目控制
| 工具 | 参数 | Scope | 说明 |
|------|------|-------|------|
| `control_program` | `programId`、`action`（start/pause） | CONTROL | 启动/暂停自动拨打 |
| `get_program_stats` | `programId`、`date?` | READ | 当日数据：拨打量、接通率、意向分布、平均时长 |
| `get_dialing_config` | `programId` | READ | 并发 `maxConcurrency`、优先级 `priorityStrategy`、拨打时段 `workTimeConfig`、屏蔽时段 |
| `update_dialing_config` | `programId`，其余字段可选 | CONTROL | 修改拨打设置 |

### 数字员工话术 / 音色 / 提取
| 工具 | 参数 | Scope | 说明 |
|------|------|-------|------|
| `get_bot_script` | `botId` | READ | 提示词、开场白、线索字段、转人工配置 |
| `update_bot_script` | `botId`，其余字段可选（至少一个） | SCRIPT | 改提示词/开场白/线索字段/转人工，立即生效 |
| `update_bot_voice` | `botId`、`voiceModelId?`、`speed?`、`volume?`、`pitch?`、`emotion?` | SCRIPT | 换音色和调音参数，立即生效 |
| `get_bot_extract` | `botId` | READ | 通话后提取字段 + 意向推送配置 |
| `update_bot_extract` | `botId`，其余字段可选（至少一个） | SCRIPT | 改提取字段和推送目标（飞书/企微/钉钉/API） |

### Webhook（轻量 call.settled 通知）
| 工具 | 参数 | Scope | 说明 |
|------|------|-------|------|
| `get_webhook` | `programId` | READ | 当前回调地址、是否设置了密钥 |
| `update_webhook` | `programId`、`webhookUrl?`、`webhookSecret?` | CONTROL | 设置/清除回调。**这只是轻量通知**，完整话单见下文 |

## 平台助手工具（启动时动态加载，0.3.0+）

除上面的内置工具外，toolkit 启动时会从平台拉取事半AI 自己的数字员工助手在用的同一套工具（`GET /api/v1/external/mcp/tools`），平台上线新能力不用等 toolkit 发版。这些工具的描述和返回都是**中文**，转述给用户时用用户的语言。

- **操作人 = API Key 的创建人**：权限与该账号在网页端完全一致（部门项目范围；改提示词/开场白/音色/功能开关需企业开通「协作权限」，改线路需开通「协作线路」；外勤等角色不能导出）。Key 的 scope 只会进一步收窄。被拒绝时返回结果里会说明原因，直接转告用户，不要重试。
- **企业固定为 Key 所属企业**，不能切换。
- **项目按名称定位**，不是 id：传 `projectHint`（项目名、数字员工名称或 8 位编号）。
- **以下场景优先用平台工具**：

| 工具 | 用途 |
|------|------|
| `query_status` | 各项目今日拨打 / 接通 / 高意向概览 |
| `check_balance` | 企业余额和套餐 |
| `export_leads_excel` | 按时间、线索标签、意向、接通情况、通话时长等筛选导出 Excel，可选列（含录音、外部评分），返回 `downloadUrl` |
| `redial_leads` | 同一套筛选条件把原线索重新排队拨打；两步走：先预览，用户确认后再传 `confirm: "true"` |
| `pause_resume`、`modify_work_time`、`modify_concurrency` | 启停、拨打时段、并发 |
| `modify_trunk`、`modify_trunk_concurrency` | 换线路 / 改线路并发（需协作线路） |
| `update_bot`、`modify_welcome`、`toggle_bot_feature`、`regen_bot` | 改提示词、开场白、音色、功能开关（需协作权限） |
| `platform_list_voices` | 按标签（性别 / 年龄 / 行业 / 风格）挑音色，再用 `update_bot`（`field: "voice"`）设置 |
| `new_project` → `confirm_step` / `revise_step` / `cancel_step` / `provide_trial_phone` | 一句话建项目、预览、试拨 |
| `import_leads_batch`、`push_lead_to_dial`、`trigger_test_call`、`generate_recharge_qrcode`、`update_project` | 导线索、试拨、充值二维码、项目设置 |

- **多步流程**（`new_project` 等）的状态按 toolkit 进程保存（`HALFCALL_SESSION_ID`）。每一步的结果都要展示给用户，**等用户确认后**再调 `confirm_step`。
- 与内置工具重名的平台工具会加 `platform_` 前缀（如 `platform_list_programs`、`platform_list_voices`）。

## 两种回调机制——不要混淆

1. **`get_webhook` / `update_webhook`（轻量通知）**：每通电话结算后向 `webhookUrl` POST `event: "call.settled"`，字段精简（`programId`、`taskDetailId`、`threadDetailId`、`phone`、`stage`、`reached`、`duration`、`intention`、`intentionRate`、`endTime`、`isReached`、`isIntention`）。设置了密钥时带签名头 `X-SmartCall-Signature: HMAC-SHA256(原始请求体, webhookSecret)`。失败**不重试**。
2. **话单回调（完整话单）**：独立的、更丰富的机制——包含完整对话 `chatLogs`、`summary`、`intentionTag`、录音 `recordUrl`、`contextId` 等，签名用 `X-App-Id` / `X-Timestamp` / `X-Nonce` / `X-Sign` / `X-Sign-Method`（md5/sha256），失败会自动重试。按数字员工配置：`update_bot_extract` 设 `pushType: "api"`（`pushWebhook` / `pushAppKey`），**不是**通过 `update_webhook`。用户要完整对话记录或更强的签名，就引导到 `update_bot_extract`。

---

## 常用流程

### 1. 推送线索并跟踪结果

```
1. 找项目：list_programs（可筛 runState: "RUNNING"），记下 programId，确认 executionMode 是 "Stream"
2. 确保在运行：暂停状态就 control_program(programId, "start")
3. 查字段名：get_lead_fields(programId) → 用返回的 "key"（不是中文 "name"）
4. 推线索：push_lead(programId, phone, variables: { org_name: "某某公司", contact_name: "张三" })，保存 threadId
5. 等待：自动拨打器通常几秒内就会拨出
6. 查结果：query_lead(threadId) → 看 reached、duration、intention、intentionRate、summary
```

`executionMode` 是 `Batch` 时 `push_lead` 会报 "Program executionMode must be Stream"。

### 2. 文件批量导入

```
1. download_lead_template(programId, botId) —— 表头与数字员工的线索字段一致，不要改列名
2. 填好后 upload_leads(programId, filePath, botId, name?)
   → 返回 { threadId, total, skipped }，skipped = 项目内重复号码
```

### 3. 项目效果复盘

```
1. get_program_stats(programId) → connectRate、totalCalls、reachedCount、highCount、hesitateCount
2. batch_query_leads(programId, date: "YYYY-MM-DD", pageSize: 50) 看明细
3. 接通率低：get_dialing_config / get_line_status / list_trunks 检查并发、时段、线路
4. 意向率低：get_bot_script 读话术，和用户商量后再改
```

### 4. 优化话术

```
1. get_bot_script(botId) 读当前提示词和开场白
2. 结合通话结果（query_lead 的 summary）分析问题，把修改方案给用户看
3. 用户确认后 update_bot_script(botId, { prompt?, greeting? ... })，下一通电话立即生效
4. 换音色：list_voices 或 platform_list_voices 挑选 → update_bot_voice(botId, { voiceModelId })
```

### 5. 通话后意向推送（企微 / 飞书 / 钉钉 / API）

```
1. get_bot_extract(botId) 看当前提取字段和推送配置
2. update_bot_extract(botId, { pushType: "wechat", pushOnlyIntent: true, pushTarget: "person", pushWebhook: "wxid_xxx" })
   → 飞书/钉钉还要填对应的 *AppId / *Secret 字段
   → pushType: "api" 即「话单回调」，推送完整话单到你的服务器
```

推送卡片包含意向等级、通话时长、提取字段、录音链接，可 @负责人。

### 6. 配置轻量 Webhook

```
1. update_webhook(programId, { webhookUrl: "https://your-app.com/api/callback", webhookSecret: "your-secret" })
2. get_webhook(programId) 确认
3. 你的接口收到（POST）：
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
4. 校验签名：HMAC-SHA256(原始请求体, webhookSecret) 应等于 X-SmartCall-Signature
5. 关闭：update_webhook(programId, { webhookUrl: null })
```

### 7. 拨打参数调优

- `maxConcurrency`：同时在打的通话数。越高越快，但受线路容量限制，一般 10–50。
- `priorityStrategy`：`LIFO` 新线索优先（适合时效性强的线索）；`FIFO` 先进先出。
- `blockStartTime` / `blockEndTime`：绝对禁拨时段（距零点的分钟数），优先级高于 `workTimeConfig`。例：1260 / 480 = 21:00–次日 08:00 不拨。设为 `null` 关闭。
- `workTimeConfig`：允许拨打的时间窗（`callTimeSlots: [{ id, start, end, days }]`），可读可写。
- 所有时间均为**北京时间（UTC+8）**。

### 8. 导出 / 重拨 / 新建项目（平台工具）

```
导出：export_leads_excel(projectHint: "续费项目", 意向/日期等筛选) → 把 downloadUrl 给用户
重拨：redial_leads(同样的筛选) → 把预览数量给用户看 → 用户确认后再带 confirm: "true" 调一次
建项目：new_project("帮我建一个给老客户做续费提醒的项目") → 每一步展示预览 → 用户确认 → confirm_step
       → 需要试拨时 provide_trial_phone
```

---

## 返回格式与错误码

内置工具的 API 响应统一为：

```json
{ "code": 0, "msg": "success", "data": { } }
```

`code` 0 为成功，-1 为失败（看 `msg`）。常见 HTTP 错误：

- **401**：Key 无效、已吊销或已过期
- **403**：项目/数字员工不属于本企业，**或** Key 缺少所需 scope——看 `msg` 区分
- **400**：缺参数、参数不合法，或 `push_lead` 的 `variables` 里有 `get_lead_fields` 之外的字段 / 缺必填字段
- **404**：线索/项目/数字员工不存在
- **409**：`cancel_lead` 的目标已在拨打或已完成，无法撤回

## 注意事项

1. **会话开始先 `verify_auth`**，顺便知道有哪些 scope，提前避开 403。
2. **批量查用 `batch_query_leads`**，不要循环 `query_lead`。单次最多 100 个 threadId，且只返回每条线索最近一次通话；要完整历史用 `query_lead`。
3. **项目必须是 Stream 模式**才能接 API 推送的线索。
4. **线索按「手机号 + 当天」去重**：同号同日重复推送会把原线索重新排队，除非传不同的 `contextId`。
5. **`update_program_bots` 以及 `update_bot_script` 里的 clueItems / transferItems 都是整份替换**，只加一项时先读出现有值。
6. **数字员工配置改动立即生效**（下一通电话），无需额外重新初始化。
7. **判断接通用 `reached in [REACHED, AGENT_END, SEAT_END, USER_END]`**，`reached` 共有 12 个值。
8. **挂断后 `intention` 短暂为 `UNKNOW`**，AI 分析完成后再查。
9. **接通率** = `reachedCount / totalCalls × 100`，一般行业 30%–60%。**意向率** = `(highCount + hesitateCount) / reachedCount × 100`。
10. **轻量 Webhook 失败不重试**，可用 `batch_query_leads` 兜底补漏；需要可靠推送用话单回调。
11. **改话术、音色、提取配置之前必须先征得用户确认**——这些改动会直接影响数字员工对真实客户说的话，一个糟糕的提示词能让接通率和意向率立刻下滑。启停项目、重拨、批量推线索同样会真实拨打电话，执行前确认范围。
12. **平台工具被拒绝时**（权限不足、余额不足等），原样转告原因，不要换个工具绕过。

## 关于

由[事半科技](https://halfcall.cn)开源维护，MIT 协议。

- 国内站：[halfcall.cn](https://halfcall.cn) · 控制台：[halfcall.cn/dashboard](https://halfcall.cn/dashboard)
- 海外站：[onvocall.com](https://onvocall.com)
- npm：[halfcall-agent-toolkit](https://www.npmjs.com/package/halfcall-agent-toolkit)
- 源码：[github.com/halfcall/agent-toolkit](https://github.com/halfcall/agent-toolkit)

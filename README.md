<div align="center">
  <img src="./banner.svg" alt="事半AI Agent Toolkit" width="100%">

  <br/>
  <br/>

  **让你的 AI Agent 拥有一支会思考、会说话、能成交的数字员工团队**

  [简体中文](README.md) | [English](README.en.md)

  <br/>

  [![npm version](https://img.shields.io/npm/v/halfcall-agent-toolkit.svg)](https://www.npmjs.com/package/halfcall-agent-toolkit)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

  <br/>

  [官网](https://halfcall.cn) · [控制台](https://halfcall.cn/dashboard) · [International](https://onvocall.com)

</div>

<hr/>

<br/>

# 事半AI Agent Toolkit — 给你的 Agent 一支数字员工团队

## 这是什么？

事半AI 是[事半科技](https://halfcall.cn)打造的 **AI 数字员工平台**。每一个数字员工都由大模型驱动，具备上下文记忆、随意打断、复杂推理、情绪感知、主动倾听、无感转人工的能力。它可以是你的销售经理、企业客服、医患助手、市场营销专员 — 7x24 小时不间断工作。

打电话只是数字员工的其中一项技能。它们能进行真实的电话对话：开场白、产品介绍、异议处理、感知语气变化、实时调整策略、判断意向。全程无需人工介入，企业级并发。

**事半AI Agent Toolkit** 把这些能力交给你的 AI Agent。不管你用 Claude、GPT 还是任何支持 MCP 的 Agent，都能直接部署数字员工、推送线索、实时调整话术、接收通话结果。

不用登后台。不用手动上传 Excel。告诉你的 Agent 一句话，数字员工就开始工作了。

## 为什么选事半AI？

传统外呼靠人工，慢、贵、机械。事半AI 的数字员工完全不同：

- **真的在思考** — 接入主流大模型，支持上下文记忆和复杂推理。不是录音播放，是完整的对话和决策。
- **随意打断** — 用户可以随时插话，数字员工瞬间调整，像跟真人聊天一样自然。
- **情绪感知** — 实时感知语气情绪，动态调整对话策略和语速节奏。生气了放慢，感兴趣了推进。
- **企业级并发** — 同时跑几百通电话，多个数字员工并行工作，不排队。
- **无感转人工** — 需要真人介入时，平滑交接，不会有尴尬的断裂感。
- **Agent 原生** — 为 AI Agent 时代设计。你的 Agent 控制整个生命周期。

## 数字员工能做什么？

你的 AI Agent 通过事半AI 管理一支专业的数字员工团队：

- **拓客 AI 专员** — 把潜客名单推进去，数字员工帮你打 Cold Call 介绍产品。遇到异议它处理，判断意向它标注，打完你的 Agent 拿到一份按意向排好序的客户列表。话术效果不好？Agent 实时帮你改。

- **7x24 智能助理** — 全天候在线。接听客户咨询，解答常见问题（价格、功能、文档链接），记录无法解决的问题，需要时无感转接真人。每一次对话都有记录。

- **续费挽留专员** — 订阅到期前主动联系客户。提供续费优惠，收集流失原因，标记高风险账户。你的 Agent 实时监控续费率。

- **线索筛选专员** — 新注册用户、表单提交、入站咨询，全部推给数字员工。它打电话确认意向，你的 Agent 告诉你哪些该跟进、哪些再培育。

- **预约专员** — 患者名单、会员名单、客户名单推过去，数字员工打电话预约、确认、改期。你的 Agent 追踪确认率。

- **调研专员** — 大规模电话调研。在话术里定义问题，推送目标名单，Agent 帮你汇总结构化结果。

- **催缴专员** — 逾期账单、订阅续费、会费到期，AI 温和提醒。Agent 监控谁付了谁没付，没付的安排第二轮。

- **活动邀约专员** — 电话邀请比邮件转化率高得多。推送几百个联系人，数字员工挨个打电话邀请，Agent 汇总谁确认参加。

- **沉睡唤醒专员** — 流失客户召回。Agent 推送长期未活跃用户，数字员工用个性化方案重新触达，看谁愿意回来。

## 不只是打电话 — 完整的动作链

数字员工不只会说话，还会办事。每通电话的过程中和结束后，都能根据对话内容自动触发一连串动作：

### 通话中 — 实时动作

| 动作 | 怎么工作的 |
|------|-----------|
| **转接真人** | 检测到客户需要真人介入，通过 SIP 无感转接给人工坐席，不挂断不断线 |
| **发短信** | 通话过程中发送短信（验证码、产品链接、预约确认），支持阿里云、联路、闪海等多个通道 |
| **调用 API** | 通话中直接请求你的后端接口 — 查库存、查订单、创建 CRM 记录，你配什么它调什么 |
| **触发 Webhook** | 通话中向任意 URL 发送请求 — 触发自动化流程、更新表格、通知频道 |

### 通话后 — 意向驱动的自动化

通话结束后，AI 自动分析对话内容，提取结构化数据，判定意向等级，然后按规则推送：

```
通话结束 → AI 分析意向 → 按意向分发
                ├── 高意向  → 推企微群 + 自动加微信好友
                ├── 犹豫    → 推飞书群 @负责人跟进
                ├── 创建工单 → 推钉钉群分配处理
                └── 所有结果 → POST 话单到你的服务器 API
```

| 动作 | 怎么工作的 |
|------|-----------|
| **推企业微信** | 意向卡片推到企微群 — 显示意向等级、通话时长、提取字段、录音链接，自动 @负责销售 |
| **推飞书** | 富文本卡片推到飞书群 — 通过飞书应用 API 按手机号 @对应负责人，包含全部客户数据 |
| **推钉钉** | Markdown 消息推到钉钉群 — HMAC-SHA256 签名，支持 @指定人 |
| **推你的服务器** | 结构化话单（手机号、意向、时长、提取字段、录音 URL）POST 到任意 API。支持 Bearer/Basic/API Key 认证、HMAC 签名、IP 白名单，自动重试 3 次 |
| **自动加微信** | 高意向通话结束后，通过企业微信自动发送好友申请 |
| **创建工单** | 生成跟进工单，包含客户信息，推送到飞书/微信/钉钉群分配处理 |

所有推送都有指数退避重试（2 秒 → 4 秒 → 8 秒，最多 3 次）。失败的推送由后台调度器每分钟扫描重试。

### 完整流程

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

1. **Agent push lead** — phone + optional variables (name, company, reason)
2. **Digital employee calls** — natural conversation with emotion sensing
3. **Mid-call actions fire** — SMS, transfer, API calls, webhooks
4. **Post-call pipeline** — AI extracts intent → pushes to WeChat / Feishu / DingTalk / your API, creates tickets, adds friends

Your Agent now has a team that doesn't just talk — they close.

## 快速开始

### 方式 A：MCP Server

适用于 Claude Desktop、Claude Code 或任何 MCP 兼容客户端。

**Claude Desktop** — 添加到 `claude_desktop_config.json`：
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

**Claude Code** — 添加到 `.mcp.json` 或 `~/.claude/mcp.json`：
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

### 方式 B：Claude Code Skill（可选，需先配好方式 A）

Skill 教 Claude 理解平台概念和常用流程；工具本身仍由 MCP Server 提供，所以要先按方式 A 配好。

```bash
git clone git@github.com:halfcall/agent-toolkit.git ~/.claude/skills/halfcall
```

在 Claude Code 里输入 `/halfcall` 即可激活。

### 获取 API Key

在 [halfcall.cn](https://halfcall.cn)（国内）注册，进入 **设置 > API 密钥**，创建新密钥。海外站 [onvocall.com](https://onvocall.com) 即将上线。

## 你的 Agent 能做什么

### 6 大类 26 个内置工具（另有下面的平台助手工具）：

**认证**
| 工具 | 干什么的 |
|------|---------|
| `verify_auth` | 检查 API Key 是否有效、属于哪个企业、有哪些权限范围 |

**基础信息**
| 工具 | 干什么的 |
|------|---------|
| `list_programs` | 看所有项目和它们的数字员工 |
| `create_program` | 创建新项目（至少需要一条线路） |
| `list_bots` | 看项目里有哪些数字员工 |
| `update_program_bots` | 设置项目的数字员工列表（整份替换） |
| `get_line_status` | 查空闲线路数——批量推线索前先看看有没有空线 |
| `list_trunks` | 看企业可用的线路 |
| `list_voices` | 看企业可用的音色 |

**线索管理**
| 工具 | 干什么的 |
|------|---------|
| `get_lead_fields` | 推线索前先查这个数字员工要的准确字段名 |
| `push_lead` | 把手机号推给数字员工，自动拨打 |
| `upload_leads` | 从本地 Excel/CSV 文件批量导入线索 |
| `download_lead_template` | 下载批量导入线索的表头模板 |
| `query_lead` | 查一通电话的结果：接了没？聊了多久？意向如何？ |
| `batch_query_leads` | 批量查几百条线索，按日期、项目、ID 筛选 |
| `cancel_lead` | 撤回还在排队、尚未拨打的线索 |

**项目管理**
| 工具 | 干什么的 |
|------|---------|
| `control_program` | 一条命令启动或暂停项目 |
| `get_program_stats` | 今天的数据：打了多少、接通率、意向分布 |
| `get_dialing_config` | 当前配置：并发多少、什么时间段、什么优先级 |
| `update_dialing_config` | 调参数：加并发、改时段、换策略 |

**数字员工管理**
| 工具 | 干什么的 |
|------|---------|
| `get_bot_script` | 读话术：数字员工怎么思考和说话的 |
| `update_bot_script` | 改话术/欢迎语/线索字段：改完立刻生效 |
| `update_bot_voice` | 改数字员工的音色和调音参数（语速/音量/音调/情绪） |
| `get_bot_extract` | 看通话结束后提取哪些数据、意向结果推到哪里 |
| `update_bot_extract` | 改提取字段和推送目标（飞书/企微/钉钉/API） |

**Webhook 回调**
| 工具 | 干什么的 |
|------|---------|
| `get_webhook` | 看有没有配实时回调 |
| `update_webhook` | 配一个 URL，每通电话打完自动 POST 结果过去 |

**平台助手工具（启动时动态加载，0.3.0 新增）**

启动时 toolkit 会从后端拉取平台自己的微信助手「花花」在用的同一套工具，平台上线新能力不用等 toolkit 发版。权限按 **API Key 创建人** 在网页上的权限走（部门项目范围、改话术要开通协作权限、改线路要开通协作线路），再被 Key 的 scope 收窄；只注册这个 Key 能用的工具。

| 工具 | 干什么的 |
|------|---------|
| `query_status` | 各项目今日拨打 / 接通 / 高意向 |
| `check_balance` | 企业余额和套餐 |
| `export_leads_excel` | 按时间、线索标签、意向、接通情况、通话时长等筛选导出 Excel，可自选列（含录音、外部评分），返回下载链接 |
| `redial_leads` | 同一套筛选条件，在原线索上重新排队拨打（先预览再确认） |
| `pause_resume`、`modify_work_time`、`modify_concurrency` | 启停、拨打时间、并发 |
| `modify_trunk`、`modify_trunk_concurrency` | 换线路 / 改线路并发（需开通协作线路） |
| `update_bot`、`modify_welcome`、`toggle_bot_feature`、`regen_bot` | 改提示词、开场白、音色、功能开关（需开通协作权限） |
| `platform_list_voices` | 按标签（性别 / 年龄 / 行业 / 风格）挑音色 |
| `new_project` → `confirm_step` / `revise_step` / `cancel_step` / `provide_trial_phone` | 一句话建项目、预览、试拨 |
| `import_leads_batch`、`push_lead_to_dial`、`trigger_test_call`、`generate_recharge_qrcode`、`update_project` | 导线索、试拨、充值二维码、项目设置 |

和内置工具重名的会加 `platform_` 前缀（`platform_list_programs`、`platform_list_voices`）。

## 跟你的 Agent 说人话就行

> "把这 50 个手机号推给销售数字员工，有结果了告诉我。"

> "今天续费项目跑得怎么样？接通率多少？"

> "数字员工开场白太生硬了，拿出来改一下，语气自然点。"

> "配个 webhook，每通电话结果推到我们的飞书。"

> "暂停催收项目，已经下班了。"

> "把昨天的高意向客户全拉出来看看。"

## 环境变量

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `HALFCALL_API_KEY` | 是 | — | 控制台里拿的 API 密钥 |
| `HALFCALL_BASE_URL` | 否 | `https://api.halfcall.cn` | API 地址，保持默认即可——halfcall.cn、uereport.com、onvocall.com 的账号都是同一个平台、同一套 API Key |
| `HALFCALL_TIMEOUT` | 否 | `30000` | 请求超时（毫秒） |
| `HALFCALL_SESSION_ID` | 否 | 每个进程随机 | 多步流程（如建项目）的会话 id；想在重启后接着之前的流程就固定一个值 |

> 从旧包 `smartcall-agent-toolkit` 迁移：0.4.0 起包名改为 `halfcall-agent-toolkit`，环境变量改为 `HALFCALL_*`；旧的 `SMARTCALL_*` 仍然兼容，MCP 配置里把 `npx` 参数换成新包名即可。

## 本地开发

```bash
git clone git@github.com:halfcall/agent-toolkit.git
cd agent-toolkit
npm install
npm run build

# 本地运行
HALFCALL_API_KEY=sk-xxx npm start
```

## 关于我们

事半AI Agent Toolkit 由[事半科技](https://halfcall.cn)开源维护。

事半AI 打造会思考的数字员工。让每个企业都能拥有自己的数字员工团队。

- 国内站：[halfcall.cn](https://halfcall.cn)
- 海外站：[onvocall.com](https://onvocall.com)

## 开源协议

[MIT](LICENSE)

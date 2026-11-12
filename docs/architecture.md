# Demo C 架构

Notification Copy Agent Workbench。数据均为自造 fixture。

## 链路

Browser UI（`/workbench` / `useChat`）
→ `POST /api/workbench`（`streamText` + tools）
→ Tools
→ `fixtures/triggers.jsonc` + `packages/copy-schema`

## Tools

| Tool                            | 执行端                   | 说明                                         |
| ------------------------------- | ------------------------ | -------------------------------------------- |
| `listTriggerTypes`              | 服务端                   | 读 fixtures，可按 category 过滤              |
| `getCopySchema`                 | 服务端                   | 读 copy-schema，返回必填字段                 |
| `validateFields`                | 服务端                   | Zod `safeParse`，返回 ok / missing / errors  |
| `previewNotification`           | 服务端返回结构，前端画卡 | `NotificationPreviewCard`                    |
| `exportLocaleSnippet`           | 服务端                   | `JSON.stringify` 转义后的 zh-CN / en-US 片段 |
| `publishCopy` / `sendTestEmail` | 无 `execute`             | HITL：确认卡 → `addToolOutput`；拒绝则不重试 |

## 不做

- 不接真实发布 API
- 不真发邮件
- API Key 只在 `.env.local`

## 若试点进真实运营后台

方案级边界（不落公司私有配置 / 真实用户数据）。

### 可自动（仍要登录鉴权）

- `listTriggerTypes` / `getCopySchema` / `validateFields` / `previewNotification` / `exportLocaleSnippet`
- 理由：只读或草稿；不改生产、不触达用户。导出只出片段，不直接写 CMS / 仓库。

### 必须 HITL

- `publishCopy` / `sendTestEmail`（保持无服务端 `execute`，批准后再生效）
- 批准卡至少展示：trigger code、文案摘要、环境（测试 / 预发 / 生产）；试发还要收件人，且限本人或白名单
- HITL ≠ 权限：批准后后端仍校验角色能否操作该 trigger / 环境

### 试点不挂

- 批量发布、改生产 locale / 模板、写生产 DB、未隔离的真邮件网关、任意 HTTP / Shell
- MCP 若用：只挂只读能力；写路径仍走 Chat tools + HITL

### 试点范围（Phase 1）

Agent 负责查类型 → 校验 → 起草 → 预览 → 导出草稿；正式上线走现有审核后台，或 HITL 后只建待审工单，不直接生产生效。

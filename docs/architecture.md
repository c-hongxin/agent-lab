# Demo C 架构初稿

Notification Copy Agent Workbench。数据均为自造 fixture。

## 链路

Browser UI（`/workbench`, `useChat`）
→ `POST /api/workbench`（`streamText` + tools）
→ Tools
→ `fixtures/triggers.json` + `packages/copy-schema`

## Tools

| Tool                            | 执行端                   | 说明                                         |
| ------------------------------- | ------------------------ | -------------------------------------------- |
| `listTriggerTypes`              | 服务端                   | 读 fixtures，可按 category 过滤              |
| `getCopySchema`                 | 服务端                   | 读 copy-schema，返回必填字段                 |
| `validateFields`                | 服务端                   | Zod `safeParse`，返回 ok / missing / errors  |
| `previewNotification`           | 服务端返回结构，前端画卡 | `NotificationPreviewCard`                    |
| `exportLocaleSnippet`           | 服务端                   | `JSON.stringify` 转义后的 zh-CN / en-US 片段 |
| `publishCopy` / `sendTestEmail` | 无 execute               | HITL: 确认卡 → `addToolOutput`；拒绝则不重试 |

## 不做

- 不接真实发布 API
- 不真发邮件
- API Key 只在 `.env.local`

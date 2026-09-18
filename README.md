# agent-lab

前端 Agent 工程练习仓库（与 `web-community-platform` 分离）。

完整学习路线见 **[工程师学习.md](./工程师学习.md)**（按 Demo 拆在 [`docs/learning/`](./docs/learning/)）。

## 当前进度

| 阶段 | 状态            | 说明                                                                         |
| ---- | --------------- | ---------------------------------------------------------------------------- |
| 0    | 笔记已建        | `notes/phase-0-concepts.md`                                                  |
| 1    | **Demo A 完成** | 流式 Chat + Stop + 双 tool + `parts` / ToolCallCard                          |
| 2    | **Demo B 完成** | HITL + 预览卡 + Retry；主 Chat 已合并；[`/hitl`](http://localhost:3000/hitl) |
| 3～4 | **Demo C 完成** | Demo C、`fixtures/`、`evals/`                                                |

## 如何启动

```powershell
cd C:\Users\HP\Desktop\agent-lab
copy .env.example .env.local
# 编辑 .env.local，填入 DEEPSEEK_API_KEY（https://platform.deepseek.com）

pnpm install
pnpm dev
```

浏览器打开 <http://localhost:3000>。

环境变量（见 `.env.example`）：

| 变量               | 说明                              |
| ------------------ | --------------------------------- |
| `DEEPSEEK_API_KEY` | 必填；只放在 `.env.local`，勿提交 |
| `DEEPSEEK_MODEL`   | 可选，默认 `deepseek-v4-flash`    |

Key 只在服务端 Route Handler 使用；浏览器 Network 里不应出现 API Key。

### 试两句

- 「北京天气怎么样？」→ 服务端 `getWeather` + tool 卡片
- 「我屏幕多宽？」→ 客户端 `getViewportSize` + 宽高
- 长回复时点「停止」→ 流中断，并显示已停止提示

### Demo B · HITL / 预览（主 Chat 已合并）

在首页 <http://localhost:3000> 也可直接试：

- 「发布文案：标题是测试，内容是你好」→ `ApprovalCard` 批准 / 拒绝
- 「预览通知：触发类型是 bounty_awarded」→ `NotificationPreviewCard`
- 请求失败时 →「编辑」/「重新生成」

独立练习页仍可用：<http://localhost:3000/hitl>

说明：当前为 AI SDK 5，官方 cookbook 的 `needsApproval` 属 6+；本示例用「tool 无 `execute` + 前端确认后再 `addToolOutput`」做等价 HITL。UI 暂定 Tailwind 自研，不引入 AntD / assistant-ui。

### Demo C · 通知文案工作台

页面：<http://localhost:3000/workbench>

基于 AI SDK 实现通知文案 Agent 工作台：流式对话、Tool Calling, HITL 与 Generative 预览；覆盖“查类型 → 填参数 → 生成文案 → 预览 → 导出”链路。数据均为自造 fixture，Inspired by notification workflows。API Key 仅 `.env.local`。

试一句：“帮我写赏金驳回通知，设计名是桌面收纳盒，原因是道路不清晰。写完预览并导出 locale。”

### 会话是否持久化

**本阶段不持久化。** 刷新页面后聊天记录清空（仅活在前端 `useChat` 内存里）。若以后要落库 / localStorage，再单独做。

## 与普通 Chat 的差异

普通「一问一答」聊天往往只渲染一段纯文本。Demo A 不同在：

1. **`parts` 渲染**：同一条 assistant 消息可含文本 part + 多个 tool part，按顺序展示，而不是只读 `content` 字符串。
2. **Tool 有状态**：如 `input-streaming` → `input-available` → `output-available` / `output-error`，UI（`ToolCallCard`）跟着变。
3. **多轮 tool loop**：模型决定调 tool → 服务端 `execute` 或浏览器 `onToolCall` + `addToolOutput` → 结果回灌后再继续生成（可多步，`stopWhen` 限制步数）。
4. **Stop**：流式过程中可 `stop()`，服务端用 `abortSignal` 中止生成。

## 与 B 端列表页的差异

| B 端典型列表页                                  | Demo A Chat                                           |
| ----------------------------------------------- | ----------------------------------------------------- |
| 一次 `request` 拿全量 `data.list`，表格一次画完 | UI 由 **消息流** 驱动：SSE/ 流式 chunk 陆续到达再更新 |
| 行数据静态、交互是筛选 / 分页                   | 交互是发送、Stop, tool 状态变化                       |
| 取消请求 ≈ 关掉 loading                         | Stop 后消息可能半截保留，并有明确「已停止」态         |

一句话：列表页是「请求 → 整包数据 → 渲染」；Chat 是「持续推送的消息 / part 状态机 → 渲染」。

## 目录结构

```text
agent-lab/
  工程师学习.md          # 学习方案索引（按 Demo 拆文件）
  notes/                 # 阶段笔记
  docs/
    learning/            # Demo A / B / C 与阶段 0、4
    architecture.md
    product.md
  fixtures/              # 自造 trigger（Demo C）
  evals/                 # 评测（阶段 4）
  packages/              # 后续 agent-ui、copy-schema
  src/
    app/api/chat/        # Route Handler（streamText + tools）
    components/chat/     # ChatPage / MessageList / ToolCallCard …
    lib/tools/           # 服务端 / 客户端 tool
```

## 合规

- API Key 仅 `.env.local`，勿提交
- 练习数据均为自造 fixture，Inspired by notification workflows
- 不拷贝公司业务代码与私有文案

## 参考

- [Demo A 学习清单](./docs/learning/02-demo-a.md)
- [AI SDK 中文](https://ai-sdk.com.cn/)
- [Chatbot Tool Usage](https://ai-sdk.com.cn/docs/ai-sdk-ui/chatbot-tool-usage)

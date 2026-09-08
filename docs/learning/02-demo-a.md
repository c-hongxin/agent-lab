# Demo A：流式 Chat + Tool（约 1～1.5 周）

**本阶段目标**：在 **练习仓库** 做出 **Demo A**——与业务无关的通用聊天页，但具备流式、Stop、双 tool、`parts` 渲染、组件拆分。

**本阶段不做**：通知 trigger, HITL 确认卡、接公司仓库。

前置：[阶段 0](./01-phase-0.md)。初始化仓库见 [总览 §2.4](./00-overview.md#24-练习仓库初始化demo-a-第-1-天做)。

## 官方主线（读 + 做）

| 顺序 | 内容                   | 读法              |
| ---- | ---------------------- | ----------------- |
| 1    | 快速开始               | **当天跑通**      |
| 2    | Tools and Tool Calling | **精读**          |
| 3    | Chatbot UI             | **扫过**          |
| 4    | Chatbot Tool Usage     | **精读 + 照做**   |
| 5    | 结构化输出             | **与 Zod 一起看** |
| 6    | HITL                   | **预习 only**     |

**具体动作**（对应上表顺序）

1. **快速开始**：初始化练习仓库；建 `app/api/chat/route.ts`；页面 `useChat` 流式出字
2. **Tools**：在 route 里加 **1 个服务端 tool**（如 `getWeather` 查假数据）；理解 `tools` / `execute`
3. **Chatbot UI**：弄清 `messages`、`status`、`append`；不纠结样式
4. **Tool Usage**：按文档渲染 `message.parts`；做 `ToolCallCard` 显示 tool 名与参数
5. **结构化输出**：给 tool 的 `parameters` 加 Zod schema；可选试一次 `generateObject`
6. **HITL**：浏览 cookbook，知道「写操作要人点确认」；**本阶段不实现**

**资料链接**

- [Getting Started](https://ai-sdk.com.cn/docs/getting-started)
- [Tools and Tool Calling](https://ai-sdk.com.cn/docs/ai-sdk-core/tools-and-tool-calling)
- [Chatbot UI](https://ai-sdk.com.cn/docs/ai-sdk-ui/chatbot)
- [Chatbot Tool Usage](https://ai-sdk.com.cn/docs/ai-sdk-ui/chatbot-tool-usage)
- [Structured Data](https://ai-sdk.com.cn/docs/ai-sdk-core/generating-structured-data)
- [HITL](https://ai-sdk.com.cn/cookbook/next/human-in-the-loop)

**补充（做到 Demo A 时用）**

| 主题                | 何时看       |
| ------------------- | ------------ |
| 停止流 / Abort      | 做 Stop 按钮 |
| AbortController     | 同上         |
| SSE                 | 流式卡住时   |
| Cookbook / Examples | 需要抄结构时 |

**资料链接**

- [停止流](https://ai-sdk.com.cn/docs/advanced/stopping-streams)
- [AbortController](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController)
- [SSE](https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events)
- [Cookbook](https://ai-sdk.com.cn/cookbook) / [Examples](https://ai-sdk.com.cn/examples)

## 建议日程（工作日 1～1.5h / 天）

| 天  | 任务概要                     | 勾选 |
| --- | ---------------------------- | ---- |
| D1  | 初始化仓库 + Getting Started | [ ]  |
| D2  | Tools 文档 + 服务端 tool     | [ ]  |
| D3  | Tool Usage + `parts` 分渲染  | [ ]  |
| D4  | 客户端 tool + `ToolCallCard` | [ ]  |
| D5  | Stop + 拆 `MessageList`      | [ ]  |
| D6  | Zod 入参校验 + 错误态 UI     | [ ]  |
| D7  | Demo A README + 对照验收     | [ ]  |

**每日要点**

1. **D1**：按总览 2.4 初始化；跑通 Getting Started 流式对话
2. **D2**：精读 Tools；route 里加服务端 tool
3. **D3**：照做 Chatbot Tool Usage；`parts` 文本 / tool 分渲染
4. **D4**：客户端 tool 1 个（如 `showAlert` / `window.innerWidth`）+ `ToolCallCard`
5. **D5**：Stop（`stop()` + Abort）；拆出 `MessageList`
6. **D6**：Zod 校验 tool 入参；错误态 UI
7. **D7**：写 Demo A README 草稿；对照下方验收

周末若有空：把 UI 稍微整理（输入框、发送、停止、清空会话）。

## Demo A 规格（照此实现）

### 功能清单

| #   | 功能         |
| --- | ------------ |
| 1   | 流式回复     |
| 2   | Stop         |
| 3   | 服务端 tool  |
| 4   | 客户端 tool  |
| 5   | `parts` 渲染 |
| 6   | Tool 状态 UI |
| 7   | 组件拆分     |

**要求**（对应上表）

1. **流式回复**：用户发送后逐字 / 逐块显示 assistant 文本
2. **Stop**：流式过程中可中断，UI 有明确「已停止」态
3. **服务端 tool**：在 Route Handler 里 `execute`，例如 `getWeather({ city })` 返回 JSON
4. **客户端 tool**：在浏览器 `onToolCall` 执行，例如 `getViewportSize`
5. **`parts` 渲染**：同一条 message 内：文本 part + tool part 分开渲染
6. **Tool 状态 UI**：至少区分 `input-streaming` / `call` / `result` / `error`（以 SDK 实际 state 为准）
7. **组件拆分**：禁止全部写在 `page.tsx`

### 建议目录结构

```text
agent-lab/
  src/app/
    page.tsx                 # 薄组装：ChatPage
    api/chat/route.ts        # streamText + tools
  src/components/chat/
    ChatPage.tsx
    MessageList.tsx
    MessageItem.tsx
    ToolCallCard.tsx
    ChatInput.tsx
  src/lib/tools/
    server-tools.ts          # 服务端 tool 定义
    client-tools.ts          # 客户端 tool 类型 / 处理
  notes/phase-0-concepts.md
  README.md
```

### 两个 tool 示例（可用同名，数据假即可）

**服务端 `getWeather`**

- 输入：`city: string`（Zod）
- 输出：`{ city, temperature, condition }` 假数据
- 用途：练习「模型决定调 API、服务端执行」

**客户端 `getViewportSize`**

- 输入：无或 `{}`
- 输出：`{ width, height }`
- 用途：练习「必须在前端执行、result 要 addToolOutput 回传」

### README 必须写的 3 段（Demo A）

1. **如何启动**：`pnpm install` / `pnpm dev` / 环境变量
2. **与普通 Chat 的差异**：`parts`、tool 状态、多轮 tool loop
3. **与 B 端列表页的差异**：消息流驱动 UI，不是一次 `request` 拿全量 `data.list`

## 交付物

| 交付物           | 说明                                   |
| ---------------- | -------------------------------------- |
| 练习仓库可运行   | 本地 `pnpm dev` 能聊天                 |
| Demo A 功能      | 功能清单全部满足                       |
| `README.md`      | 含启动说明 + 两段差异说明              |
| Git 提交（可选） | 至少 2～3 个有意义 commit，勿含 `.env` |

## 验收标准

- [ ] 问「北京天气怎么样」能触发 `getWeather` 并在 UI 看到 tool 卡片
- [ ] 问「我屏幕多宽」能触发客户端 tool 并显示宽高
- [ ] 长回复过程中点 Stop，流立即停止
- [ ] 刷新页面后理解：会话是否持久化（本阶段 **可不持久化**，但 README 里说明）
- [ ] 能打开 React DevTools，指出 `MessageList` / `ToolCallCard` 拆分
- [ ] **不能** 在浏览器 Network 里看到 API Key

## 常见卡点

| 现象                                 | 处理概要                                   |
| ------------------------------------ | ------------------------------------------ |
| `Tool invocation must have a result` | 客户端 tool 忘了 `addToolOutput`           |
| 流式不出字                           | 检查 route 是否返回 data stream response   |
| tool 只执行不显示                    | 遍历 `message.parts`，不要只渲染 `content` |
| 中文站与代码不一致                   | 对照英文站同页                             |

**处理细节**

1. **缺 tool result**：客户端 tool 必须 `addToolOutput`；[Demo B](./03-demo-b.md) 还会再碰到
2. **流式不出字**：确认 `return result.toUIMessageStreamResponse()`（以当前 SDK 文档为准）
3. **tool 不显示**：同一条 message 按 `parts` 分别渲染文本与 tool
4. **中文站不一致**：以 [ai-sdk.dev](https://ai-sdk.dev/) 英文站同页为准

**资料链接**

- [Tool invocation missing result](https://ai-sdk.com.cn/docs/troubleshooting/tool-invocation-missing-result)

## 与后续阶段的关系

| Demo A 能力            | Demo B / C 怎么用                                                     |
| ---------------------- | --------------------------------------------------------------------- |
| `parts` + ToolCallCard | Demo B 加 ApprovalCard；Demo C 加 PreviewCard                         |
| 服务端 / 客户端 tool   | Demo C 的 `validateFields` 服务端、`previewNotification` 可客户端渲染 |
| Zod                    | Demo C `copy-schema` 包                                               |

下一份：[Demo B](./03-demo-b.md) · 返回 [学习方案首页](../../工程师学习.md)

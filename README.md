# agent-lab

前端 Agent 工程练习仓库（与 `web-community-platform` 分离）。

完整学习路线见仓库内 **[工程师学习.md](./工程师学习.md)**。

## 当前进度

| 阶段 | 状态 | 说明 |
| ---- | ---- | ---- |
| 0 | 笔记已建 | `notes/phase-0-concepts.md` 待填写 |
| 1 | **Demo A 骨架** | 流式 Chat + `getWeather` + `getViewportSize` |
| 2～4 | 占位 | `docs/`、`fixtures/`、`evals/` |

## 快速开始

```powershell
cd C:\Users\HP\Desktop\agent-lab
copy .env.example .env.local
# 编辑 .env.local，填入 OPENAI_API_KEY

npm install
npm run dev
```

浏览器打开 http://localhost:3000

### 试两句

- 「北京天气怎么样？」→ 应触发服务端 `getWeather`
- 「我屏幕多宽？」→ 应触发客户端 `getViewportSize`

## 目录结构

```text
agent-lab/
  工程师学习.md          # 学习方案（主文档）
  notes/                 # 阶段笔记
  docs/                  # 架构 / 状态机 / MCP
  fixtures/              # 自造 trigger（Demo C）
  evals/                 # 评测（阶段 4）
  packages/              # 后续 agent-ui、copy-schema
  src/
    app/api/chat/        # Route Handler
    components/chat/     # Demo A UI
    lib/tools/           # 服务端 / 客户端 tool
```

## Demo A 与普通 Chat / B 端列表的差异

1. **消息用 `parts` 渲染**：同一条 assistant 消息可含文本 + 多个 tool part，顺序保留。
2. **Tool 有状态机**：`input-streaming` → `output-available` 等，不是一次 REST 返回。
3. **客户端 tool**：部分 tool 在浏览器 `onToolCall` 执行，必须 `addToolOutput` 回传。
4. **Stop**：流式过程中可 `stop()`，与表格页「请求取消」类似但 UI 状态更细。

## 合规

- API Key 仅 `.env.local`，勿提交
- 练习数据均为自造 fixture，Inspired by notification workflows
- 不拷贝公司业务代码与私有文案

## 参考

- [AI SDK 中文](https://ai-sdk.com.cn/)
- [Chatbot Tool Usage](https://ai-sdk.com.cn/docs/ai-sdk-ui/chatbot-tool-usage)

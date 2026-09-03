# 定位、目标与技术栈

> 经验定标准，当前业务定选题。本页是全方案共用背景，不含某个 Demo 的规格。

## 0. 定位

| 来源           | 用法                                                                |
| -------------- | ------------------------------------------------------------------- |
| 既有中后台经验 | 定「熟手验收标准」：组件拆分、权限思维、稳定性、可量化              |
| 当前业务       | **Demo / 练习选题**：抽象通知 · 邮件 · 运营流程，用自造数据完成练习仓库 |

### 0.1 已具备（跳过）

| 能力             | 说明                                              |
| ---------------- | ------------------------------------------------- |
| React Hooks + TS | 直接上 AI SDK                                     |
| 复杂中后台       | 表单联动、权限、状态枚举、请求容错有体感          |
| 工程化           | 规范、分层、接口契约意识强                        |
| AI 辅助开发      | 会用工具；本方案升级为「会搭 Agent 能力」         |
| 当前域知识       | 通知 trigger、locale、邮件模板——**Demo C 主素材** |

### 0.2 要补齐（主战场）

| 缺口                      | 为什么重要                                 |
| ------------------------- | ------------------------------------------ |
| LLM / Tool Calling 协议   | 决定 Tool UI 状态机怎么设计                |
| 流式 UI Message / `parts` | 和 REST 列表页心智不同                     |
| HITL 确认卡               | Agent 与普通 Chat 的分水岭                 |
| Generative UI             | 模型驱动业务预览组件                       |
| Eval / 成本 / 观测        | 保证能力可落地、可回归                     |
| 练习项目闭环              | 用当前业务域脱敏 Demo 巩固，不依赖过往代码 |

### 0.3 一句话目标

> 在现有中后台与工程化基础上，用 AI SDK 落地「通知文案 Agent 工作台」练习：流式对话、Tool Calling、HITL 与评测闭环。

---

## 1. 培养目标

1. 流式聊天 UI，可 Stop / Retry
2. Tool Calling 状态机可复用
3. 写操作必须 HITL
4. Generative UI ≥ 1（**通知预览卡** 优先）
5. 简单 eval（有数字）
6. **Demo C：通知文案 Agent 工作台**（贴合当前业务，脱敏 mock）

### 能力画像

| 能力       | 期望                                  |
| ---------- | ------------------------------------- |
| Agent 协议 | 能画 tool-call ↔ tool-result 时序     |
| 前端工程   | Agent UI 模块化，不是单文件堆逻辑     |
| 产品体验   | 加载 / 失败 / 权限 / 确认             |
| 工程化     | Zod、eval、密钥边界                   |
| 判断力     | 哪些用 Agent，哪些继续表单 / 配置后台 |

---

## 2. 技术栈（按优先级）

| 优先级 | 技术                             | 投入策略     |
| ------ | -------------------------------- | ------------ |
| P0     | Vercel AI SDK                    | **主学**     |
| P0     | Zod                              | 补齐         |
| P0     | Next.js App Router               | **够用即可** |
| P1     | assistant-ui 或 AntD 自研 Thread | 提效         |
| P1     | MCP 基础                         | 加分         |
| P2     | LangGraph.js                     | 按需         |
| P2     | LangSmith / 自建 Eval            | 加分         |
| —      | React / TS 基础                  | **跳过**     |
| —      | 过往公司业务 / 内部组件复刻      | **不做**     |

### 2.1 投入说明

- **AI SDK（主学）**：流式 + Tool + `useChat`
- **Zod**：tool 入参 / 结构化输出（对齐字段校验思维）
- **Next.js**：Route Handler 即可
- **UI**：Ant Design（贴近运营后台）或 assistant-ui
- **MCP**：对照 Cursor 理解工具暴露方式
- **LangGraph**：多步审批再学

### 2.2 文档链接（优先中文）

- [AI SDK 中文站首页](https://ai-sdk.com.cn/)
- [Zod 中文文档](https://zod.dev.cn/)（打不开用 [zod.dev](https://zod.dev/)）
- [Next.js App Router 中文](https://nextjs.net.cn/docs/app)
- [assistant-ui](https://www.assistant-ui.com/docs/)（暂无完整中文站）
- [MCP 中文介绍（社区）](https://www.learngraph.online/LearnGraph%201.X/module-11-subgraph-mermaid-mcp-agent-node-tool/11.3%20LangGraph%20MCP%20Integration.html)
- [LangGraph JS 中文](https://docs.langchain.org.cn/oss/javascript/langgraph/overview)
- [LangSmith](https://docs.smith.langchain.com/)（英文为主）

> `ai-sdk.com.cn`、`openai.ac.cn`、`langchain.org.cn` 多为社区中文镜像 / 译本，内容偶有滞后；若与代码对不上，再对照官方英文页 [ai-sdk.dev](https://ai-sdk.dev/)。

### 2.3 选型建议

- **AI SDK 一条线打穿**，再按需 LangGraph
- 不要同时学多个 Agent 框架

### 2.4 练习仓库初始化（[Demo A](./02-demo-a.md) 第 1 天做）

本仓库 **agent-lab 已经建好**。当前默认模型是 **DeepSeek Flash**（国内可访问），见根目录 `.env.example`。

若从零再建一份练习仓：

```powershell
npx create-next-app@latest agent-lab --ts --eslint --app --src-dir --import-alias "@/*"
cd agent-lab
pnpm add ai @ai-sdk/openai zod
```

创建 `.env.local`（**勿提交 git**）。本仓库填 `DEEPSEEK_API_KEY`；直连 OpenAI 时再改 Route Handler。

`.gitignore` 确认包含 `.env*.local`。README 写一句：API Key 仅服务端 Route Handler 使用。

---

## 3. 阶段总览

| 阶段 | 时长          | 主题                         | 交付物            | 文档                              |
| ---- | ------------- | ---------------------------- | ----------------- | --------------------------------- |
| 0    | **1～2 天**   | 概念速通                     | 半页笔记          | [阶段 0](./01-phase-0.md)         |
| 1    | **1～1.5 周** | 流式 Chat + Tool             | Demo A            | [Demo A](./02-demo-a.md)          |
| 2    | **1.5～2 周** | HITL + Generative UI         | Demo B            | [Demo B](./03-demo-b.md)          |
| 3    | **2.5～3 周** | 通知文案 Agent（当前业务域） | **Demo C**        | [Demo C](./04-demo-c.md)          |
| 4    | **1.5～2 周** | Eval / MCP / 文档收尾        | README + 评测数字 | [阶段 4](./05-phase-4.md)         |

合计约 **6～10 周**。

**为何可压缩周期**：前端与中后台已熟；选题直接用当前通知 / 邮件认知；过往经验只提高验收标准，不提供代码依赖。

**阶段依赖关系**：

```text
阶段 0 笔记 → 阶段 1 Demo A（通用 Chat+Tool）
           → 阶段 2 Demo B（HITL + 预览卡）
           → 阶段 3 Demo C（通知业务域）
           → 阶段 4 Eval + MCP + 文档
```

返回 [学习方案首页](../../工程师学习.md)。

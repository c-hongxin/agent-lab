# 附录：阅读、周计划、自测与链接

与单个 Demo 无关的清单和速查。按周推进时对照对应 Demo 文档勾验收。

## 补充阅读

**高优先级（中文）**

- [Anthropic Agent 模式全译](https://blog.iaieye.com/posts/agentic-coding-classics/anthropic-building-effective-agents-fulltext/)
- [AI SDK Examples 中文](https://ai-sdk.com.cn/examples)

**产品向**

- [Cursor 文档](https://cursor.com/docs)（英文为主，可浏览器翻译）

**模型 API（中文优先）**

- [OpenAI 中文文档](https://developers.openai.ac.cn/api/docs/overview)
- [Anthropic 文档](https://docs.anthropic.com/)（英文为主）

**明确不做**

- 再系统学 React / TS
- 并行多个 Agent 框架
- 复刻过往物流 / 样板间系统
- 从零训模型

---

## 按周清单（可打印勾选）

### Week 1 — 概念 + Demo A

- [ ] **D1-D2** [阶段 0](./01-phase-0.md) 笔记 `notes/phase-0-concepts.md` + 时序图
- [ ] **D1** 练习仓库初始化（[总览 2.4](./00-overview.md#24-练习仓库初始化demo-a-第-1-天做)）
- [ ] **D1-D3** Getting Started 流式对话跑通
- [ ] **D3-D5** Chatbot Tool Usage：`parts` + 双 tool
- [ ] **D5-D7** Stop + `MessageList` / `ToolCallCard` + Zod
- [ ] Demo A 对照 [验收标准](./02-demo-a.md#验收标准) 全部勾选

### Week 2 — Demo A 文档 + Demo B 起步

- [ ] Demo A `README.md` 写完（启动 + 两段差异）
- [ ] HITL cookbook 精读并跑通最小例
- [ ] Demo B：`ApprovalCard` + 危险 tool 一个
- [ ] Demo B：`NotificationPreviewCard` 初版（假数据）

### Week 3 — Demo B 收尾 + Demo C 准备

- [ ] `docs/demo-b-state-machine.md`
- [ ] Demo B [验收](./03-demo-b.md#验收标准)
- [ ] `docs/product.md` + `fixtures/triggers.json`
- [ ] `packages/copy-schema` 起步
- [ ] 选定 UI：AntD 或 assistant-ui

### Week 4 — Demo C 主路径

- [ ] 5 个业务 tool 实现
- [ ] 主路径：问一句 → 校验 → 预览 → export snippet
- [ ] 写操作 HITL 接入
- [ ] `docs/architecture.md` 初稿

### Week 5 — Eval + 体验

- [ ] `evals/cases.json` 20+ 条 + 跑分脚本
- [ ] 错误态 / 超时态 / 空 trigger 提示
- [ ] `architecture.md` + `product.md` 定稿

### Week 6 — MCP + 收尾

- [ ] MCP 小实验 + `docs/mcp-notes.md`
- [ ] README 终版（含 eval 数字、合规、演示步骤）
- [ ] 可选：本地演示录屏
- [ ] 对照下方 **理解自测** 10 题

### Week 7～10 — 缓冲与加深

- [ ] 补薄弱章节（Generative UI / eval / MCP 任选）
- [ ] 技术笔记 1 篇（个人笔记，勿含公司隐私）
- [ ] 复盘 Demo C：若接真实业务会改哪 3 处

---

## 理解自测清单

用来检查是否真正掌握，不必对外分享：

1. 流式半截 tool args 如何渲染？→ [Chatbot Tool Usage](https://ai-sdk.com.cn/docs/ai-sdk-ui/chatbot-tool-usage)
2. Stop / 进行中 tool 如何处理？→ [停止流](https://ai-sdk.com.cn/docs/advanced/stopping-streams)
3. tool 无 result 为何失败？→ [missing result](https://ai-sdk.com.cn/docs/troubleshooting/tool-invocation-missing-result)
4. HITL 状态机？读操作 vs 写操作门槛？→ [HITL](https://ai-sdk.com.cn/cookbook/next/human-in-the-loop)
5. Generative UI 与 Markdown 边界？如何版本化 UI 协议？→ [Generative UI](https://ai-sdk.com.cn/docs/ai-sdk-ui/generative-user-interfaces)
6. 密钥与权限边界？
7. 通知配置为何不全做成 Agent？表单 / 审核流 / Agent 如何分工？→ Agent 模式译文「何时不用 Agent」
8. 如何做 eval？Prompt / Tool schema 变更如何回归？
9. 成本与延迟如何分层？
10. 中后台复杂状态 / 权限经验，如何迁移到 Agent 工具设计？（只谈通用方法）

---

## 完成标准（全方案）

1. 有可运行的 **Demo C**（当前业务域脱敏），结构清晰 + 合规说明
2. 能讲清消息流、tool 状态机、HITL
3. 有 **eval 数字**（20+ case）
4. README 能说明设计取舍与边界
5. 能提出「通知 / 邮件场景试点」的思路（范围、权限、风险）——仅方案级，不要求落地公司仓库

---

## 链接速查（中文优先）

**核心（AI SDK 中文站）**

- [首页](https://ai-sdk.com.cn/)
- [快速开始](https://ai-sdk.com.cn/docs/getting-started)
- [工具调用](https://ai-sdk.com.cn/docs/ai-sdk-core/tools-and-tool-calling)
- [Chatbot Tool UI](https://ai-sdk.com.cn/docs/ai-sdk-ui/chatbot-tool-usage)
- [HITL](https://ai-sdk.com.cn/cookbook/next/human-in-the-loop)
- [Generative UI](https://ai-sdk.com.cn/docs/ai-sdk-ui/generative-user-interfaces)
- [停止流](https://ai-sdk.com.cn/docs/advanced/stopping-streams)
- [MCP 接入](https://ai-sdk.com.cn/docs/ai-sdk-core/mcp-tools)

**协议与通识（中文）**

- [OpenAI 函数调用](https://developers.openai.ac.cn/api/docs/guides/function-calling)
- [Anthropic Agent 全译](https://blog.iaieye.com/posts/agentic-coding-classics/anthropic-building-effective-agents-fulltext/)
- [工具调用与 MCP 通识](https://developer.volcengine.com/articles/7533551311816818724)
- [MCP vs Function Calling](https://cloud.tencent.com/developer/techpedia/2621/20674)
- [LangGraph 中文](https://docs.langchain.org.cn/oss/javascript/langgraph/overview)

**基础（中文）**

- [Next.js 中文](https://nextjs.net.cn/docs/app)
- [Zod 中文](https://zod.dev.cn/)
- [Ant Design 中文](https://ant.design/index-cn)
- [AbortController](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController)
- [SSE](https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events)

**英文原文（可选对照）**

- [AI SDK 官方](https://ai-sdk.dev/)
- [Anthropic 原文](https://www.anthropic.com/engineering/building-effective-agents)
- [MCP 官网](https://modelcontextprotocol.io/)
- [Cursor Docs](https://cursor.com/docs)

---

## 修订记录

| 日期       | 说明                                                                  |
| ---------- | --------------------------------------------------------------------- |
| 2026-08-20 | 初版与排版迭代；练习选题对齐当前业务域                                |
| 2026-08-20 | 阅读材料改为中文优先（AI SDK / OpenAI / Agent 译文 / LangGraph 等）   |
| 2026-08-24 | 各阶段补充「要做什么 / 交付物 / 验收标准」；阶段 1 日程与 Demo A 规格 |
| 2026-09-03 | 按 Demo 维度拆到 `docs/learning/`                                     |

返回 [学习方案首页](../../工程师学习.md)

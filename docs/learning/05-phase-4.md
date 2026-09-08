# 阶段 4：工程化、MCP、文档收尾（约 1.5～2 周）

在 [Demo C](./04-demo-c.md) 可演示之后做评测、MCP 小实验和 README 终版。

## 评测（必做）

**要做什么：**

- [ ] 新建 `evals/cases.json`，至少 **20 条** case，覆盖：
  - 工具选对（该调 `validateFields` 时不要只聊天）
  - 缺字段拦截
  - 多语言导出
  - 错误 trigger_code
- [ ] 写 `evals/run.mjs`（或 `run.ts`）脚本，输出统计：
  - 工具选对率
  - 校验通过率
  - 平均对话步数
  - 失败类型分布
- [ ] 把结果数字写进根 `README.md` 的 **Eval** 小节

**参考：**

- [LangSmith](https://docs.smith.langchain.com/)
- [Prompt engineering](https://ai-sdk.com.cn/docs/ai-sdk-core/prompt-engineering)

## MCP（必做：小实验 + 短文）

**要做什么：**

- [ ] 阅读 MCP 与 Function Calling 区别（见 [附录 · 链接速查](./99-appendix.md#链接速查中文优先)）
- [ ] 按 [AI SDK MCP tools](https://ai-sdk.com.cn/docs/ai-sdk-core/mcp-tools) 接 **1 个只读** MCP tool（或 mock server）
- [ ] 在 `docs/mcp-notes.md` 写 **半页**：Chat 内 tool vs MCP 的适用场景

**不要求**：把 Demo C 全部改成 MCP。

## LangGraph（选修）

仅当 Demo C 出现「多步审批图」需求时再学：

- [LangGraph 概览](https://docs.langchain.org.cn/oss/javascript/langgraph/overview)
- [Use graph API](https://docs.langchain.org.cn/oss/javascript/langgraph/use-graph-api)

## 安全（必做阅读 + README 一节）

- [ ] 扫一眼 [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)（中文解读搜即可）
- [ ] README 写清：**工具白名单、写操作 HITL、密钥不进浏览器、fixture 脱敏**

## 交付物

| 交付物                    | 说明                             |
| ------------------------- | -------------------------------- |
| `evals/cases.json` + 脚本 | 20+ case，有数字                 |
| `docs/mcp-notes.md`       | MCP 对比笔记                     |
| README 终版               | 启动、架构、eval、合规、演示步骤 |
| 可选：录屏 3～5 分钟      | 本地演示 Demo C                  |

## 验收标准

- [ ] README 陌生人能按文档 `pnpm dev` 跑起来
- [ ] eval 脚本能在本机跑出 4 项统计
- [ ] 能回答：若把 Demo C 试点进真实运营后台，你会限制哪些 tool、哪些必须 HITL

返回 [学习方案首页](../../工程师学习.md) · [附录](./99-appendix.md)

# 阶段 0：概念速通（1～2 天）

交付物是笔记，不是 Demo。做完再进 [Demo A](./02-demo-a.md)。

## 要读什么（中文优先）

| 顺序 | 材料                          | 读法                                  |
| ---- | ----------------------------- | ------------------------------------- |
| 1    | Anthropic《构建有效的 Agent》 | 精读前半（模式分类 + 何时不用 Agent） |
| 2    | OpenAI 函数调用               | 精读「调用流程」「参数 schema」       |
| 3    | 工具调用与 MCP 通识           | 任选一篇扫完                          |
| 4    | MCP vs Function Calling       | 扫过，建立名词                        |

**资料链接**

- [Anthropic《构建有效的 Agent》译文](https://blog.iaieye.com/posts/agentic-coding-classics/anthropic-building-effective-agents-fulltext/)
- [OpenAI 函数调用](https://developers.openai.ac.cn/api/docs/guides/function-calling)
- [MCP vs Function Calling](https://cloud.tencent.com/developer/techpedia/2621/20674)
- MCP 通识（任选一篇）：
  - [火山引擎](https://developer.volcengine.com/articles/7533551311816818724)
  - [博客园](https://www.cnblogs.com/pass-ion/p/19162781)
  - [libresensing](https://libresensing.com/post/function-calling-and-mcp-practice)
- Anthropic 英文原文（可选）：[building-effective-agents](https://www.anthropic.com/engineering/building-effective-agents)

## 要做什么

- [ ] 用 **1～2 小时** 读完上表材料（不必背 API）
- [ ] 新建笔记文件：`notes/phase-0-concepts.md`（放练习仓库或个人 `资料/` 均可）
- [ ] 按下面 **笔记模板** 写满 **半页～一页**（用自己的话，禁止大段粘贴译文）
- [ ] 画一张 **tool-call → tool-result** 时序（手绘拍照或 Mermaid 均可）

## 笔记模板（照此填空）

```markdown
# 阶段 0：Agent 概念笔记

## 1. LLM vs Tool vs Agent Loop

- LLM 单独能做什么：…
- Tool 解决什么：…
- Agent Loop（对照 Cursor）：用户消息 → 模型 → tool-call → 执行 → tool-result → 模型继续 → …

## 2. 前端为什么要处理 tool-call / tool-result

- tool-call：模型「打算调什么、参数是什么」
- tool-result：执行结果，必须回传，否则 loop 断掉
- UI 上要展示：pending / success / error（不是只 console.log）

## 3. 当前业务：Agent vs 运营表单 / 审核流

### 适合 Agent（辅助层）

- 通知文案起草、字段校验、多语言对齐、邮件占位符检查、预览
- 自然语言问「某 trigger 需要哪些 business_params」

### 必须留在表单 / 审核流（执行层）

- 审核通过 / 驳回、填写法定驳回原因、改订单 / 用户状态
- 真正发邮件 / 推通知（后端状态机 + 权限 + 审计）
- email_template 硬约束（驳回必须含原因、不暴露签到码等）

### 一句话边界

Agent 止于草稿与预览；人确认后仍走 B 端表单与 API。
```

## 交付物

| 交付物                      | 说明                    |
| --------------------------- | ----------------------- |
| `notes/phase-0-concepts.md` | 半页以上概念笔记        |
| 时序图 1 张                 | tool-call / tool-result |

## 验收标准

- [ ] 能 **口头 2 分钟** 讲清 Agent Loop，不混淆「模型生成文本」和「工具执行」
- [ ] 能举 **1 个** 你们业务例子：赏金驳回 = Agent 写草稿 + 审核表单提交驳回
- [ ] 笔记里 **没有** 公司真实文案、用户数据、内部 URL

## 常见卡点

| 现象                    | 处理                                                |
| ----------------------- | --------------------------------------------------- |
| 译文链接打不开          | 换备选链接或英文原文 + 浏览器翻译                   |
| Agent 和 ChatGPT 分不清 | 记住：有 **工具循环 + 状态** 才是 Agent UI 要关心的 |

返回 [学习方案首页](../../工程师学习.md) · [总览](./00-overview.md)

# （自拟标题）

> 个人技术笔记。用自己的话写；禁止公司真实文案、用户数据、内部 URL、密钥。  
> 对照提纲：附录 Week 7～10「技术笔记」；相关概念见理解自测 10 题。

## 1. 背景（3～5 句）

- 为什么做 agent-lab：中后台和工程化已熟，要补 Agent 协议、流式 UI, Tool Calling, HITL；选题用通知 / locale 域的脱敏训练，不接业务仓。
- 交付物一句话（Demo A→B→C + 阶段 4）：流式 Chat + tool → HITL / 预览卡 → 通知文案工作台 → eval + MCP 小实验 + 文档收尾。
- 本文边界（只谈通用方法 / 本仓）：只写 agent-lab 里验证过的做法，不写内部 trigger / 真文案。

## 2. 消息流 ≠ 列表页（Demo A）

- `parts` / tool 状态机，我怎么理解：一条 assistant 消息里可以有文本 part 和多个 tool part；tool 会经历 input-streaming → input-available → output-available / output-error。
- 半截 tool args 怎么渲染：流式到达就更新 UI（一边返回一边渲染），按 part 状态画 ToolCallCard，不等整段 content 齐了再画。
- Stop：`stop()` 与 `abortSignal` 分别干什么；UI「已停止」本仓靠什么：stop() 是前端中止这次请求；abortSignal: req.signal 让服务端 streamText 跟着停。本仓用本地 stopped 为 true 时显示 Generation stopped，发新消息再清掉。

**收获句：** Agent UI 是 part / tool 状态机，不是一次请求拿全量 list 再渲染。

## 3. 写操作必须 HITL（Demo B / C）

- 本仓 HITL 怎么做（无 `execute` → …）：写 tool 不挂服务端 execute，停在 input-available，确认卡批准后走 addToolOutput，拒绝走 output-error，且 prompt 要求勿重试。
- 哪些可读自动、哪些必须人批：自动——listTriggerTypes/getCopySchema/validateFields/previewNotification/exportLocaleSnippet；人批——publishCopy/sendTestEmail
- HITL 和权限的区别：HITL 是人确认这一下；权限是服务端按角色决定能不能调、能不能发到某环境。人批了后端仍要鉴权。密钥只放 .env.local + Route Handler，不进浏览器。

**收获句：** 有副作用的写路径必须人审；人审不能代替鉴权

## 4. Chat tool vs MCP（阶段 4）

- Chat tool 适合：贴本应用的业务链路（校验、导出、发布），挂在 Route Handler。
- MCP 适合（本仓例子）：跨应用复用的只读能力包；本仓 /mcp-lab 的 list_demo_triggers 只读 fixtures。
- 写路径放哪、为什么：仍放 Chat tools + HITL；不把发布迁到 MCP，避免可复用通道上直接写业务。

**收获句：** MCP 先挂只读；业务写路径留在应用内 tool。

## 5. Eval 与回归（可选）

- 本仓怎么跑（cases / 命令 / 看哪些数）：evals/cases.jsonc（20+）+ pnpm eval；看工具选对率、校验通过率、平均步数、失败分布。
- 改 prompt 或 schema 后怎么回归：用同一批 case 再跑一遍，对比数字，不靠手测两句。
- 我读数字时注意到的局限：有的 bad_trigger 只调了 getCopySchema 就停，校验通过率要结合失败分布解读。

**收获句：** 评测是固定考题 + 可对比数字；该配置必须回归。

## 6. 若接真实运营后台会改的 3 处（必写）

1.正式发布不直连生产：Agent 只做查类型 → 校验 → 起草 → 预览 → 导出；上线走原审核，或 HITL 后只建待审工单。2.试发加严：sendTestEmail 收件人限本人或白名单；批准卡展示 trigger、文案摘要、环境（测 / 预发 / 生产）。
3.tool 白名单 + 鉴权：不挂批量改生产 locale、未隔离真邮件网关、任意 HTTP/Shell；确定性校验走本地 Zod，创作才交给模型。

## 7. 未做 / 下次加深（2～3 条）

- 会话持久化（现在刷新就清空）
- 有多步审批需求时再看 LangGraph
- 收紧 eval 期望或 prompt，把校验相关指标做稳；

## 8. 备忘（可选，对照自测）

- 中后台经验 → tool 设计的映射（权限 / 枚举 / 二次确认 / 错误态）：权限 → 可调 tool 白名单；状态枚举 → Zod 固定入参；二次确认 → HITL；错误提示 → output-error / missing-errors / UI 错误态。
- 表单·审核流 vs Agent 怎么分工：稳定枚举、固定校验与正式发布走表单 / 审核流；灵活起草、解释、填草稿走 Agent。

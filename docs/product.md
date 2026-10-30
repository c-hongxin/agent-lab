# Demo C 产品说明（阶段 3 填写）

## 题目

Notification Copy Agent Workbench（通知文案 Agent 工作台）

## 用户故事

运营在 `/workbench` 用自然语言描述通知需求，例如：

> 帮我写赏金驳回通知，设计名是桌面收纳盒，原因是刀路不清晰

Agent 应完成

1. 查 trigger 类型与字段 schema（fixtures）
2. 校验必填字段（如 `reject_reason`）
3. 生成中英文案（模型 + tool 约束）
4. 站内通知预览卡（Generative UI）
5. 导出可粘贴的 locale snippet
6. 若 【发布 / 试发】→ HITL 确认（继承 Demo B）

## 范围

### 做

- 自造 `fixtures/triggers.json`(10+ 条)
- 服务端 tools：list / schema / validate / export
- 预览卡 + 可选 HITL 写操作
- 流式对话工作台 UI

### 不做

- 不接 web-community-platform 真实 API
- 不拷贝公司私有文案
- 不真发邮件、不落真实发布

## 合规

数据均为自造 fixture，Inspired by notification workflows。API Key 仅 `.env.local`。

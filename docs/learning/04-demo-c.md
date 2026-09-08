# Demo C：通知文案 Agent 工作台（约 2.5～3 周）

**本阶段目标**：**Notification Copy Agent Workbench**——用自造 trigger 与假文案，走完「查类型 → 填参数 → 校验 → 生成文案 → 预览 → 导出 snippet」。

继承 [Demo A](./02-demo-a.md) 的流式 / tool UI、[Demo B](./03-demo-b.md) 的 HITL 与预览卡。

## 题目说明

**为什么选这个**

- 正在做通知 / locale / 邮件，域模型熟，不需要过往公司代码
- 业务场景真实，练习价值高于玩具 Demo
- 用自造 fixture 即可，合规可控

**本阶段仍然不做**

- 不接 `web-community-platform` 真实 API
- 不拷贝公司 `triggerTypes` 全文、真实邮件 HTML、真实用户数据

## 用户故事（按此验收）

运营同学（你扮演）在 /workbench 输入：

> 「帮我写赏金驳回通知，设计名是桌面收纳盒，原因是刀路不清晰」

系统应能：

1. 调 `listTriggerTypes` / `getCopySchema` 找到类型与必填字段
2. 调 `validateFields` 检查 `reject_reason` 等是否齐全
3. 生成中英文案（模型生成 + tool 约束）
4. 调 `previewNotification` 出预览卡
5. 调 `exportLocaleSnippet` 输出可粘贴的 `zh-CN` / `en-US` 片段
6. 若有「发布」类动作 → **HITL**（继承 Demo B）

## 建议 Tools（全部自造实现）

| Tool                  | 执行端    | 作用        |
| --------------------- | --------- | ----------- |
| `listTriggerTypes`    | 服务端    | 列触发类型  |
| `getCopySchema`       | 服务端    | 字段 schema |
| `validateFields`      | 服务端    | 必填 / 格式 |
| `previewNotification` | 客户端 UI | 预览卡      |
| `exportLocaleSnippet` | 服务端    | 导出片段    |

**输入 / 输出要点**

1. **`listTriggerTypes`**：可选分类 filter → `{ items: [{ code, description }] }`
2. **`getCopySchema`**：`trigger_type_code` → Zod 可转的 fields 列表
3. **`validateFields`**：`code` + `fields` → `{ ok, missing[], errors[] }`
4. **`previewNotification`**：文案 + code → 渲染 NotificationPreviewCard
5. **`exportLocaleSnippet`**：locale + 文案对象 → 字符串 snippet

可选加分：

- `checkEmailTemplateVars`：对照假 HTML 模板检查 `{{var}}` 是否齐
- `sendTestEmail` + HITL：仅模拟，不真发信

## 与当前工作的映射（理解用）

| 工作里熟悉的                  | Demo C 对应                               |
| ----------------------------- | ----------------------------------------- |
| `trigger_type_code` 枚举      | `fixtures/triggers.json` 自造 10～15 条   |
| `business_params` 表单校验    | `validateFields` + `packages/copy-schema` |
| C 端通知列表展示              | `previewNotification` 预览卡              |
| `zh-CN` / `en-US` locale 文件 | `exportLocaleSnippet`                     |

## 仓库结构（本阶段补齐）

```text
agent-lab/
  apps/web/                    # 若 monorepo；单仓则保持 src/app 即可
  packages/agent-ui/           # Message / ToolCard / ApprovalCard / PreviewCard
  packages/copy-schema/        # Zod schema + 自造 trigger 定义
  fixtures/
    triggers.json              # 假 trigger 列表
    email-templates/           # 假 HTML，变量名自造
  evals/cases.json             # 阶段 4 填充，本阶段可先建空文件
  docs/
    architecture.md
    product.md
  README.md
```

## 分周任务（阶段 3 内部）

| 周    | 任务概要                      | 勾选 |
| ----- | ----------------------------- | ---- |
| W3    | 需求 + fixtures + copy-schema | [ ]  |
| W4    | 5 个 tool + 主路径 + HITL     | [ ]  |
| W4 末 | architecture 初稿             | [ ]  |

**每周要点**

1. **W3**：写 `docs/product.md`；`fixtures/triggers.json` 10+ 条；`copy-schema` 包 2～3 个 trigger 的 Zod
2. **W4**：实现 5 个 tool；打通「问一句 → 预览卡」；写操作走 HITL
3. **W4 末**：`architecture.md` 初稿：Browser → Route Handler → Tools → Fixtures

## 架构示意

```text
Browser UI（useChat / AntD Thread / assistant-ui）
    ↓ UI Message Stream
Route Handler（streamText + tools）
    ↓
Tools：schema / validate / preview / export
    ↓
Fixtures（自造 trigger 与假文案；禁止公司私有文案与密钥）
```

## 合规（硬性）

- **不要** 把公司私有文案、真实用户数据、未开源配置推到公开仓库
- 自造枚举与假数据；README 可写 `Inspired by notification workflows`
- API Key 仅服务端 `.env.local`
- **不依赖、不复刻过往公司任何项目代码**

## 交付物

| 交付物                                     | 说明                 |
| ------------------------------------------ | -------------------- |
| Demo C 可演示                              | 完整走通上方用户故事 |
| `fixtures/`                                | 自造数据             |
| `packages/copy-schema/`                    | Zod                  |
| `docs/product.md` + `docs/architecture.md` | 需求与架构           |

## 验收标准

- [ ] 至少 **3 种** 不同 `trigger_type_code` 能完成预览 + 导出
- [ ] 故意少填 `reject_reason` 时 `validateFields` 能拦住并提示
- [ ] 全流程无公司真实数据；README 有合规说明
- [ ] 能 **5 分钟** 演示：输入 → tool 链 → 预览 → 复制 snippet

## README 说明模板

> 基于 AI SDK 实现通知文案 Agent 工作台：流式对话、Tool Calling、HITL 与 Generative 预览；Zod schema + eval；覆盖「查类型 → 填参数 → 生成文案 → 预览 → 导出」链路。数据均为自造 fixture，Inspired by notification workflows.

下一份：[阶段 4](./05-phase-4.md) · 返回 [学习方案首页](../../工程师学习.md)

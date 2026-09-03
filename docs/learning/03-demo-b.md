# Demo B：HITL + Generative UI（约 1.5～2 周）

**本阶段目标**：在 [Demo A](./02-demo-a.md) 基础上演进为 **Demo B**——危险操作要人确认；用 Generative UI 做 **通知预览卡**（假数据）。

## 要读什么

| 主题              | 读法             |
| ----------------- | ---------------- |
| Human-in-the-Loop | **精读 + 照做**  |
| Generative UI     | **精读**         |
| Tool 无 result    | **遇到错误时查** |

**资料链接**

- [Human-in-the-Loop](https://ai-sdk.com.cn/cookbook/next/human-in-the-loop)
- [Generative UI](https://ai-sdk.com.cn/docs/ai-sdk-ui/generative-user-interfaces)
- [Tool invocation missing result](https://ai-sdk.com.cn/docs/troubleshooting/tool-invocation-missing-result)

## 要做什么（按顺序）

- [ ] **Fork 或分支**：从 Demo A 拉出 `demo-b` 分支（仍在练习仓库）
- [ ] 跑通官方 HITL 最小示例（可单独路由，再合并进主 Chat）
- [ ] 新增 **写操作 tool**（二选一或都要）：
  - `publishCopy`：模拟「发布文案」
  - `sendTestEmail`：模拟「试发邮件」
- [ ] 上述 tool 必须 **`requireApproval`** 或等价 HITL 流程：UI 出确认卡 → 用户点批准 / 拒绝 → 再产生 tool-result
- [ ] 新增 **Generative UI**：`previewNotification` 返回结构化数据，前端渲染 **通知预览卡**（标题、正文、CTA 按钮文案——全部用假数据）
- [ ] 实现 **Retry**：失败后允许用户编辑上一条消息或点重试
- [ ] 写 `docs/demo-b-state-machine.md`：状态枚举 + 转移表

## UI 方案（二选一，Week 3 前定稿）

| 方案               | 做法                                              |
| ------------------ | ------------------------------------------------- |
| A. Ant Design 自研 | `List` + `Card` + `Modal` 做 Thread；贴近运营后台 |
| B. assistant-ui    | 用现成 Thread 组件，少写布局                      |

**资料链接**

- [Ant Design](https://ant.design/index-cn)
- [assistant-ui](https://www.assistant-ui.com/docs/)

建议：你熟悉 AntD → 选 A；想省时间 → 选 B。

## Demo B 状态机（必须在文档里画清）

```text
idle
  → streaming（assistant 生成中）
  → tool_pending（tool 参数流式到达）
  → await_approval（写操作，等人点确认）
  → tool_executing
  → done | error
```

**读操作 tool**（如 `getCopySchema`）可跳过 `await_approval`。
**写操作 tool** 必须经过 `await_approval`。

## 通知预览卡（假数据规格）

预览卡 UI 至少包含：

| 字段                | 示例（假）                        |
| ------------------- | --------------------------------- |
| `trigger_type_code` | `bounty_review_rejected`          |
| `title`             | 图纸审核未通过                    |
| `body`              | 您提交的「桌面收纳盒」未通过审核… |
| `cta_label`         | 查看详情                          |
| `locale`            | `zh-CN`                           |

数据来自 tool result，**不要** 写死在公司仓库的 `triggerTypes.ts` 里拷贝。

## 交付物

| 交付物                                        | 说明               |
| --------------------------------------------- | ------------------ |
| Demo B 可运行                                 | HITL + 预览卡      |
| `docs/demo-b-state-machine.md`                | 状态机说明         |
| `components/chat/ApprovalCard.tsx`            | 确认卡组件         |
| `components/chat/NotificationPreviewCard.tsx` | Generative UI 预览 |

## 验收标准

- [ ] 触发 `publishCopy` 或 `sendTestEmail` 时 **不会** 未经确认直接 success
- [ ] 点「拒绝」后模型收到失败 result，能继续对话
- [ ] `previewNotification` 在聊天流里渲染出卡片，不是纯 Markdown
- [ ] 能对照状态机文档说出当前 UI 处于哪一态

下一份：[Demo C](./04-demo-c.md) · 返回 [学习方案首页](../../工程师学习.md)

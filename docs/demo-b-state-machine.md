# Demo B 状态机

对照实现：[`/hitl`](../src/app/hitl/page.tsx) · [`HitlMiniChat`](../src/components/hitl/HitlMiniChat.tsx) · [`/api/hitl`](../src/app/api/hitl/route.ts)

本文描述 **一轮对话在 UI 上的逻辑状态**（便于验收时对照），不是单独再写一套状态库。实际代码里分散在：

- `useChat` 的 `status`：`ready` / `submitted` / `streaming` / `error`
- tool part 的 `state`：`input-streaming` / `input-available` / `output-available` / `output-error` 等

---

## 1. 状态枚举

| 逻辑状态         | 含义                                             | 代码里怎么看                                                                           |
| ---------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `idle`           | 空闲，可输入发送                                 | `status === "ready"` 且没有待确认的写操作 tool                                         |
| `streaming`      | 助手正在流式输出文本 / 推进步骤                  | `status === "streaming"` 或 `"submitted"`                                              |
| `tool_pending`   | 模型正在给出 tool 参数（或参数刚到齐、尚未分支） | tool part：`input-streaming`；或读操作已 `input-available` 且服务端即将/正在 `execute` |
| `await_approval` | **写操作**已出齐参数，等人点批准/拒绝            | 写操作 tool part：`state === "input-available"`（无 `execute`，UI 出确认条）           |
| `tool_executing` | 已批准或读操作自动执行，正在出 result / 自动续写 | 批准后 `addToolOutput` → `sendAutomaticallyWhen` 再请求；或读操作服务端 `execute` 中   |
| `done`           | 本轮结束，可继续聊                               | `status === "ready"`，相关 tool 已是 `output-available`（或拒绝后的收尾文本已出完）    |
| `error`          | 请求失败                                         | `status`/钩子上的 `error` 有值；UI 显示「重新生成 / 编辑」                             |

---

## 2. 总览（转移图）

```text
idle
  │ 用户发送消息
  ▼
streaming
  │ 模型调用 tool
  ▼
tool_pending
  │
  ├─ 读操作（previewNotification 等，有 execute）
  │     → tool_executing → streaming（续写）→ done
  │
  └─ 写操作（publishCopy / sendTestEmail / 天气 HITL 示例，无 execute）
        → await_approval
              ├─ 用户批准 → tool_executing → streaming → done
              └─ 用户拒绝 → tool_executing（补 output-error）→ streaming → done

任意 streaming / tool_* 阶段若 HTTP 失败 → error
  ├─ 重新生成（regenerate）→ streaming …
  └─ 编辑上一条（截断 messages + 回填输入框）→ idle
```

---

## 3. 转移表

| 从                             | 到               | 触发条件                                                                       |
| ------------------------------ | ---------------- | ------------------------------------------------------------------------------ |
| `idle`                         | `streaming`      | 用户点发送 / `sendMessage`                                                     |
| `streaming`                    | `tool_pending`   | 流里出现 tool part（参数生成中）                                               |
| `streaming`                    | `done`           | 本轮结束且无未完成 tool                                                        |
| `streaming`                    | `error`          | 请求失败（`error` 有值）                                                       |
| `tool_pending`                 | `await_approval` | 写操作参数齐（`input-available`），且 tool **没有** 服务端 `execute`           |
| `tool_pending`                 | `tool_executing` | 读操作：服务端自动 `execute`（如 `previewNotification`）                       |
| `await_approval`               | `tool_executing` | 用户点「批准」→ `addToolOutput`（成功结果）                                    |
| `await_approval`               | `tool_executing` | 用户点「拒绝」→ `addToolOutput({ state: "output-error", … })`                  |
| `tool_executing`               | `streaming`      | `lastAssistantMessageIsCompleteWithToolCalls` 自动再请求，模型根据 result 续写 |
| `tool_executing` / `streaming` | `done`           | 续写结束，`status === "ready"`                                                 |
| `error`                        | `streaming`      | 用户点「重新生成」→ `clearError` + `regenerate`                                |
| `error`                        | `idle`           | 用户点「编辑」→ 回填输入框并 `setMessages` 截断到上一条用户之前                |
| `done`                         | `streaming`      | 用户再次发送                                                                   |

---

## 4. 读操作 vs 写操作

| 类型      | 本仓库例子                                     | 是否经过 `await_approval`                                      |
| --------- | ---------------------------------------------- | -------------------------------------------------------------- |
| 读 / 预览 | `previewNotification`（有 `execute`）          | **否**，直接 `tool_executing` → 渲染 `NotificationPreviewCard` |
| 写 / 危险 | `publishCopy`、`sendTestEmail`（无 `execute`） | **是**，必须等人确认                                           |
| HITL 练手 | `getWeatherInformation`（无 `execute`）        | **是**（与写操作同一套门闩，便于对照 cookbook）                |

规则（与 [学习文档](./learning/03-demo-b.md) 一致）：

- **读操作** 可跳过 `await_approval`
- **写操作** 必须经过 `await_approval`，未经确认不得出现成功 result

---

## 5. 验收时怎么「说出当前是哪一态」

| 你在屏幕上看到                               | 逻辑状态                                           |
| -------------------------------------------- | -------------------------------------------------- |
| 只有输入框，无在跑的请求                     | `idle` 或 `done`                                   |
| 助手字在往外蹦 / 发送按钮不可用              | `streaming`                                        |
| 出现「等待确认：发布文案 / 试发邮件 / 天气」 | `await_approval`                                   |
| 点批准后立刻出现 JSON 结果，随后模型继续说话 | `tool_executing` → `streaming`                     |
| 预览卡直接出来（无批准按钮）                 | 读操作：`tool_pending` → `tool_executing` → `done` |
| 红条「请求失败」+ 编辑 / 重新生成            | `error`                                            |

---

## 6. 相关文件

| 文件                                              | 角色                                     |
| ------------------------------------------------- | ---------------------------------------- |
| `src/app/api/hitl/route.ts`                       | 注册 tools；写操作无 `execute`，读操作有 |
| `src/lib/tools/write-tools.ts`                    | `publishCopy` / `sendTestEmail`          |
| `src/lib/tools/preview-tools.ts`                  | `previewNotification`                    |
| `src/components/hitl/HitlMiniChat.tsx`            | 确认 UI、预览卡、Retry                   |
| `src/components/chat/NotificationPreviewCard.tsx` | Generative UI 预览                       |

后续若抽出正式 `ApprovalCard.tsx` 并入主 Chat，本状态机仍然适用，只是确认 UI 换组件。

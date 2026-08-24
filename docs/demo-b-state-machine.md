# Demo B 状态机（阶段 2 填写）

```text
idle
  → streaming
  → tool_pending
  → await_approval   # 写操作 tool 专用
  → tool_executing
  → done | error
```

## 转移说明

| 状态 | 进入条件 | 退出条件 |
| ---- | -------- | -------- |
| `streaming` | 用户发送消息 | 本轮 assistant 输出结束 |
| `tool_pending` | 模型发出 tool-call | tool result 就绪或进入 approval |
| `await_approval` | 写操作 tool（如 publishCopy） | 用户批准/拒绝 |
| `done` | 无待处理 tool | 用户再次发送 |

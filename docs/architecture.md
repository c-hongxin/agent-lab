# 架构说明（Demo C 阶段完善）

```text
Browser UI（useChat / ChatPage）
    ↓ UI Message Stream
Route Handler（/api/chat · streamText + tools）
    ↓
Tools：schema / validate / preview / export
    ↓
fixtures/（自造 trigger 与假文案）
```

## 密钥边界

- `OPENAI_API_KEY` 仅存在于服务端 `.env.local`
- 浏览器只访问 `/api/chat`，不直连模型 API

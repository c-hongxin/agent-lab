# MCP 笔记（阶段 4）

## Chat tool vs MCP

|          | Chat tool                       | MCP                       |
| -------- | ------------------------------- | ------------------------- |
| 定义位置 | Route Handler / `src/lib/tools` | 外部 MCP server 进程      |
| 适合     | 本应用业务逻辑                  | 跨应用复用的能力包        |
| 本仓库   | Demo A～C 主路径                | 阶段 4 实验（`/mcp-lab`） |

## 实验记录

- 在 `mcp/demo-triggers-server.ts` 接了 stdio MCP server（TypeScript，便于编辑器类型检查 / 自动导入）。
- 一个只读 tool：`list_demo_triggers`（读 `fixtures/triggers.jsonc`）。
- 路由 `/api/mcp-lab` 使用 `@ai-sdk/mcp` 的 `createMCPClient` + `Experimental_StdioMCPTransport`（`pnpm exec tsx` 跑 server 文件），再 `mcpClient.tools()` + `streamText`。
- 练习页：`/mcp-lab`。Demo C `/workbench` 仍用仓库内 Chat tools（校验 / 导出 / HITL）。
- 结论：带业务写路径的继续用 Chat tools + HITL；MCP 留给可复用的只读能力包。

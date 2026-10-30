# MCP notes (Phase 4)

## Chat tools vs MCP

| | Chat tool | MCP |
| --- | --- | --- |
| Defined where | Route Handler / `src/lib/tools` | External MCP server process |
| Best for | App-specific business logic | Reusable capability packs across apps |
| In this repo | Demo A–C main path | Phase 4 lab (`/mcp-lab`) |

## Experiment log

- Wired a stdio MCP server at `mcp/demo-triggers-server.ts` (TypeScript so the editor can typecheck / auto-import).
- One read-only tool: `list_demo_triggers` (reads `fixtures/triggers.json`).
- Next route `/api/mcp-lab` uses `@ai-sdk/mcp` `createMCPClient` + `Experimental_StdioMCPTransport` (`pnpm exec tsx` on the server file), then `mcpClient.tools()` + `streamText`.
- Practice UI: `/mcp-lab`. Demo C `/workbench` still uses in-repo Chat tools (validate / export / HITL).
- Takeaway: keep business-bound write paths as Chat tools + HITL; use MCP for reusable read-only capability packs.

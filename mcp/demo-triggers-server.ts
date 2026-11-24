/**
 * Demo MCP server（stdio，只读）。
 * 暴露 list_demo_triggers——只读 fixtures/triggers.jsonc。
 * 由 /api/mcp-lab 通过 createMCPClient + tsx 拉起；除非调试，不要手动跑。
 */
import { readFileSync } from "node:fs";
import { parseJsonc } from "../src/lib/parse-jsonc.ts";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

type TriggerItem = {
  code: string;
  description: string;
  category: string;
};

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixtures = parseJsonc<{ items: TriggerItem[] }>(
  readFileSync(join(root, "fixtures", "triggers.jsonc"), "utf8"),
);

const server = new McpServer({
  name: "agent-lab-demo-triggers",
  version: "1.0.0",
});

server.registerTool(
  "list_demo_triggers",
  {
    description:
      "List demo notification trigger codes from fixtures (read-only). " +
      "Optional category filter: work / system / growth / social.",
    inputSchema: {
      category: z
        .string()
        .optional()
        .describe("Optional category filter, e.g. work"),
    },
    // 告诉客户端这是只读、无副作用、不访问外网。
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false,
    },
  },
  async ({ category }) => {
    let items = fixtures.items ?? [];
    if (category) {
      const needle = category.toLowerCase();
      items = items.filter((t) => t.category.toLowerCase() === needle);
    }

    const payload = {
      source: "mcp:demo-triggers-server",
      count: items.length,
      triggers: items.map(({ code, description, category }) => ({
        code,
        description,
        category,
      })),
    };

    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

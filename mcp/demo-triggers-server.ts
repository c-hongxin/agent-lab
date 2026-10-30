/**
 * Demo MCP server (stdio, read-only).
 * Exposes list_demo_triggers — reads fixtures/triggers.json only.
 * Started by /api/mcp-lab via createMCPClient + tsx; do not run by hand unless debugging.
 */
import { readFileSync } from "node:fs";
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
const fixtures = JSON.parse(
  readFileSync(join(root, "fixtures", "triggers.json"), "utf8"),
) as { items: TriggerItem[] };

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

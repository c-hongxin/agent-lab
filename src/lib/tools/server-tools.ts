import { tool } from "ai";
import { z } from "zod";

/** Demo A 服务端 tool：假天气数据 */
export const getWeather = tool({
  description: "Get current weather for a city (demo fake data)",
  inputSchema: z.object({
    city: z.string().describe("City name, e.g. Beijing"),
  }),
  execute: async ({ city }) => {
    const conditions = ["sunny", "cloudy", "rainy", "windy"] as const;
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    return {
      city,
      temperatureC: Math.round(Math.random() * 18 + 12),
      condition,
    };
  },
});

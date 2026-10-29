import { createOpenAI } from "@ai-sdk/openai";

/** DeepSeek OpenAI-compatible layer: force Chat Completions to avoid /v1/responses + item_reference 400s */
export function resolveModel() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing DEEPSEEK_API_KEY. Copy .env.example to .env.local and fill it in.",
    );
  }

  const deepseek = createOpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com/v1",
  });

  const modelId = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash";
  return deepseek.chat(modelId);
}

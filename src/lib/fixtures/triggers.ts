import { readFileSync } from "node:fs";
import { join } from "path";

import { parseJsonc } from "@/lib/parse-jsonc";

export type TriggerItem = {
  code: string;
  description: string;
  category: string;
  required_fields: string[];
};

type TriggersFile = {
  items: TriggerItem[];
};

// 进程内缓存，避免每次 list tool 都读盘。
let cashed: TriggerItem[] | null = null;

export function loadTriggers(): TriggerItem[] {
  if (cashed) return cashed;
  const path = join(process.cwd(), "fixtures", "triggers.jsonc");
  const raw = readFileSync(path, "utf8");
  const data = parseJsonc<TriggersFile>(raw);
  cashed = data.items;
  return cashed;
}

export function listTriggers(category?: string): TriggerItem[] {
  const items = loadTriggers();
  if (!category) return items;
  return items.filter((item) => item.category === category);
}

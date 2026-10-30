import { readFileSync } from "node:fs";
import { join } from "path";

export type TriggerItem = {
  code: string;
  description: string;
  category: string;
  required_fields: string[];
};

type TriggersFile = {
  items: TriggerItem[];
};

let cashed: TriggerItem[] | null = null;

export function loadTriggers(): TriggerItem[] {
  if (cashed) return cashed;
  const path = join(process.cwd(), "fixtures", "triggers.json");
  const raw = readFileSync(path, "utf8");
  const data = JSON.parse(raw) as TriggersFile;
  cashed = data.items;
  return cashed;
}

export function listTriggers(category?: string): TriggerItem[] {
  const items = loadTriggers();
  if (!category) return items;
  return items.filter((item) => item.category === category);
}

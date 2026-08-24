/**
 * 阶段 4：读取 evals/cases.json 并输出统计。
 * 用法：node evals/run.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const casesPath = join(__dirname, 'cases.json');

const cases = JSON.parse(readFileSync(casesPath, 'utf8'));

console.log('Eval cases:', cases.length);
console.log('（阶段 4 补充 runner 逻辑）');

// 数据文件用 .jsonc，编辑器才允许 // 注释。
// 运行时先剥掉 // 与 /* */（字符串里的内容不动），再 JSON.parse。

export function parseJsonc<T = unknown>(raw: string): T {
  return JSON.parse(stripJsonComments(raw)) as T;
}

function stripJsonComments(raw: string): string {
  let out = "";
  let inString = false;
  let i = 0;

  while (i < raw.length) {
    const c = raw[i];
    const next = raw[i + 1];

    if (inString) {
      out += c;
      if (c === "\\") {
        out += next ?? "";
        i += 2;
        continue;
      }
      if (c === '"') inString = false;
      i += 1;
      continue;
    }

    if (c === '"') {
      inString = true;
      out += c;
      i += 1;
      continue;
    }

    if (c === "/" && next === "/") {
      while (i < raw.length && raw[i] !== "\n") i += 1;
      continue;
    }

    if (c === "/" && next === "*") {
      i += 2;
      while (i < raw.length && !(raw[i] === "*" && raw[i + 1] === "/")) i += 1;
      i += 2;
      continue;
    }

    out += c;
    i += 1;
  }

  return out;
}

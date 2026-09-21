import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export function resolveProjectPath(root: string, requested: string): string {
  const target = path.resolve(root, requested);
  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`Refusing path outside project: ${requested}`);
  return target;
}
export async function writeProjectFile(root: string, requested: string, content: string): Promise<void> {
  const target = resolveProjectPath(root, requested); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, content, "utf8");
}
export async function readProjectFile(root: string, requested: string): Promise<string> { return readFile(resolveProjectPath(root, requested), "utf8"); }

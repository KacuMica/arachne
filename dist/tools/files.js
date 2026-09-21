import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
export function resolveProjectPath(root, requested) {
    const target = path.resolve(root, requested);
    const relative = path.relative(root, target);
    if (relative.startsWith("..") || path.isAbsolute(relative))
        throw new Error(`Refusing path outside project: ${requested}`);
    return target;
}
export async function writeProjectFile(root, requested, content) {
    const target = resolveProjectPath(root, requested);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, "utf8");
}
export async function readProjectFile(root, requested) { return readFile(resolveProjectPath(root, requested), "utf8"); }
//# sourceMappingURL=files.js.map
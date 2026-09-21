import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
export class LocalMemory {
    dir;
    constructor(root) { this.dir = path.join(root, ".arachne"); }
    async record(event) { await mkdir(this.dir, { recursive: true }); await appendFile(path.join(this.dir, "sessions.jsonl"), JSON.stringify({ at: new Date().toISOString(), ...event }) + "\n"); }
    async context() { try {
        return await readFile(path.join(this.dir, "context.md"), "utf8");
    }
    catch {
        return "No saved project context.";
    } }
    async saveContext(value) { await mkdir(this.dir, { recursive: true }); await writeFile(path.join(this.dir, "context.md"), value, "utf8"); }
}
//# sourceMappingURL=session.js.map
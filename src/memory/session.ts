import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export class LocalMemory {
  private readonly dir: string;
  constructor(root: string) { this.dir = path.join(root, ".arachne"); }
  async record(event: object): Promise<void> { await mkdir(this.dir, { recursive: true }); await appendFile(path.join(this.dir, "sessions.jsonl"), JSON.stringify({ at: new Date().toISOString(), ...event }) + "\n"); }
  async context(): Promise<string> { try { return await readFile(path.join(this.dir, "context.md"), "utf8"); } catch { return "No saved project context."; } }
  async saveContext(value: string): Promise<void> { await mkdir(this.dir, { recursive: true }); await writeFile(path.join(this.dir, "context.md"), value, "utf8"); }
}

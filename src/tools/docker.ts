import { access } from "node:fs/promises";
import path from "node:path";
import { runCommand } from "./shell.js";

export class DockerTool {
  constructor(private readonly root: string) {}
  async build(tag = "arachne-app:latest"): Promise<string | undefined> {
    try { await access(path.join(this.root, "Dockerfile")); } catch { return undefined; }
    const result = await runCommand(this.root, "docker", ["build", "-t", tag, "."]);
    if (result.code !== 0) throw new Error(`Docker build failed:\n${result.stderr}`);
    return result.stdout.trim() || `Built ${tag}`;
  }
  async composeBuild(): Promise<string | undefined> {
    try { await access(path.join(this.root, "docker-compose.yml")); } catch { return undefined; }
    const result = await runCommand(this.root, "docker", ["compose", "build"]);
    if (result.code !== 0) throw new Error(`Docker Compose build failed:\n${result.stderr}`);
    return result.stdout.trim() || "Docker Compose images built";
  }
}

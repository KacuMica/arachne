import { runCommand } from "./shell.js";

export class GitTool {
  constructor(private readonly root: string) {}
  async author(): Promise<{ name: string; email: string }> {
    const [name, email] = await Promise.all([runCommand(this.root, "git", ["config", "user.name"]), runCommand(this.root, "git", ["config", "user.email"])]);
    if (name.code !== 0 || email.code !== 0 || !name.stdout.trim() || !email.stdout.trim()) throw new Error("Git author is not configured. Run: git config --global user.name \"Your Name\" and git config --global user.email \"you@example.com\".");
    return { name: name.stdout.trim(), email: email.stdout.trim() };
  }
  async commit(paths: string[], message: string): Promise<string> {
    if (!paths.length) return "No Arachne-generated files to commit.";
    if (!message.trim() || message.length > 120) throw new Error("Git commit message must be between 1 and 120 characters.");
    await this.author();
    const add = await runCommand(this.root, "git", ["add", "--", ...paths]); if (add.code !== 0) throw new Error(add.stderr);
    const commit = await runCommand(this.root, "git", ["commit", "-m", message]); if (commit.code !== 0) throw new Error(commit.stderr);
    return commit.stdout.trim();
  }
  async push(): Promise<string> {
    const result = await runCommand(this.root, "git", ["push"]); if (result.code !== 0) throw new Error(`Git push failed. Configure SSH, Git Credential Manager, or gh auth first.\n${result.stderr}`); return result.stdout.trim() || result.stderr.trim();
  }
}

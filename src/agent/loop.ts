import type { ArachneConfig, CommandResult, ModelProvider } from "../types.js";
import { parseActions, SYSTEM_PROMPT } from "./protocol.js";
import { writeProjectFile } from "../tools/files.js";
import { runCommand } from "../tools/shell.js";
import { inspectProject, selectTests } from "../tools/project.js";
import { GitTool } from "../tools/git.js";
import { DockerTool } from "../tools/docker.js";
import { LocalMemory } from "../memory/session.js";

export class AutonomousLoop {
  constructor(private readonly root: string, private readonly config: ArachneConfig, private readonly provider: ModelProvider, private readonly memory = new LocalMemory(root)) {}
  async run(task: string): Promise<void> {
    await this.memory.record({ kind: "task", task, provider: this.provider.name });
    let feedback = `Task: ${task}\nProject context: ${await this.memory.context()}\n${await inspectProject(this.root)}`;
    const generatedPaths = new Set<string>();
    let deferredCommitMessage: string | undefined;
    let requestPush = false;
    for (let iteration = 1; iteration <= this.config.agent.maxIterations; iteration++) {
      const actions = parseActions(await this.provider.complete(SYSTEM_PROMPT, feedback));
      await this.memory.record({ kind: "actions", iteration, actions: actions.map(a => a.type) });
      let testResult: CommandResult | undefined;
      for (const action of actions) {
        if (action.type === "write_file") { await writeProjectFile(this.root, action.path, action.content); generatedPaths.add(action.path); console.log(`  wrote ${action.path}`); }
        if (action.type === "containerize") { await writeProjectFile(this.root, "Dockerfile", action.dockerfile); generatedPaths.add("Dockerfile"); if (action.compose) { await writeProjectFile(this.root, "docker-compose.yml", action.compose); generatedPaths.add("docker-compose.yml"); } }
        if (action.type === "run_tests") testResult = await this.tests(action.command);
        if (action.type === "git_commit") deferredCommitMessage = action.message;
        if (action.type === "git_push") requestPush = true;
        if (action.type === "done" && !testResult) console.log(`  model reports: ${action.summary}`);
      }
      if (!testResult && generatedPaths.size > 0) testResult = await this.tests();
      if (testResult?.code === 0) { await this.containerize(); await this.gitAfterSuccess(generatedPaths, deferredCommitMessage, requestPush, task); await this.memory.saveContext(`Completed: ${task}`); console.log("Arachne completed successfully."); return; }
      feedback = `Repair iteration ${iteration}. Tests failed. Analyze the result and return JSON corrective actions.\nstdout:\n${testResult?.stdout ?? "No tests requested"}\nstderr:\n${testResult?.stderr ?? ""}`;
    }
    throw new Error(`Iteration limit (${this.config.agent.maxIterations}) reached without a passing test run.`);
  }
  private async tests(command?: string): Promise<CommandResult> {
    const plans = await selectTests(this.root, command ?? this.config.agent.testCommand);
    if (!plans.length) return { code: 1, stdout: "", stderr: "No test runner detected. Create project tests or set agent.testCommand." };
    let stdout = ""; let stderr = "";
    for (const plan of plans) { console.log(`  running ${plan.label}`); const result = await runCommand(this.root, plan.executable, plan.args); stdout += result.stdout; stderr += result.stderr; if (result.code !== 0) return { code: result.code, stdout, stderr }; }
    console.log("  test exit: 0"); return { code: 0, stdout, stderr };
  }
  private async containerize(): Promise<void> { if (!this.config.agent.dockerBuild) return; const docker = new DockerTool(this.root); const image = await docker.build(); if (!image) { console.log("  Dockerfile not present; container build skipped."); return; } console.log(`  ${image}`); const compose = await docker.composeBuild(); if (compose) console.log(`  ${compose}`); if (this.config.agent.dockerRun) console.log("Image built. dockerRun is enabled, but an explicit port policy is required; refusing implicit docker run."); }
  private async gitAfterSuccess(paths: Set<string>, message: string | undefined, requestPush: boolean, task: string): Promise<void> {
    if (!this.config.git.commitOnSuccess) return;
    const git = new GitTool(this.root); const result = await git.commit([...paths], message ?? `arachne: ${task.slice(0, 100)}`); console.log(`  ${result}`);
    if (this.config.git.pushOnSuccess || requestPush) console.log(`  ${await git.push()}`);
  }
}

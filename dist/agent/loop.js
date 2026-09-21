import { parseActions, SYSTEM_PROMPT } from "./protocol.js";
import { writeProjectFile } from "../tools/files.js";
import { runCommand, splitCommand } from "../tools/shell.js";
import { LocalMemory } from "../memory/session.js";
export class AutonomousLoop {
    root;
    config;
    provider;
    memory;
    constructor(root, config, provider, memory = new LocalMemory(root)) {
        this.root = root;
        this.config = config;
        this.provider = provider;
        this.memory = memory;
    }
    async run(task) {
        await this.memory.record({ kind: "task", task, provider: this.provider.name });
        let feedback = `Task: ${task}\nProject context: ${await this.memory.context()}`;
        for (let iteration = 1; iteration <= this.config.agent.maxIterations; iteration++) {
            const actions = parseActions(await this.provider.complete(SYSTEM_PROMPT, feedback));
            await this.memory.record({ kind: "actions", iteration, actions: actions.map(a => a.type) });
            let testResult;
            for (const action of actions) {
                if (action.type === "write_file") {
                    await writeProjectFile(this.root, action.path, action.content);
                    console.log(`  wrote ${action.path}`);
                }
                if (action.type === "containerize") {
                    await writeProjectFile(this.root, "Dockerfile", action.dockerfile);
                    if (action.compose)
                        await writeProjectFile(this.root, "docker-compose.yml", action.compose);
                }
                if (action.type === "run_tests")
                    testResult = await this.tests(action.command);
                if (action.type === "done" && !testResult) {
                    await this.memory.saveContext(action.summary);
                    console.log(action.summary);
                    return;
                }
            }
            if (testResult?.code === 0) {
                await this.containerize();
                await this.memory.saveContext(`Completed: ${task}`);
                console.log("Arachne completed successfully.");
                return;
            }
            feedback = `Repair iteration ${iteration}. Tests failed. Analyze the result and return JSON corrective actions.\nstdout:\n${testResult?.stdout ?? "No tests requested"}\nstderr:\n${testResult?.stderr ?? ""}`;
        }
        throw new Error(`Iteration limit (${this.config.agent.maxIterations}) reached without a passing test run.`);
    }
    async tests(command) { const [exe, args] = splitCommand(command ?? this.config.agent.testCommand ?? "npm test"); const result = await runCommand(this.root, exe, args); console.log(`  test exit: ${result.code}`); return result; }
    async containerize() { if (!this.config.agent.dockerBuild)
        return; const result = await runCommand(this.root, "docker", ["build", "-t", "arachne-app:latest", "."]); if (result.code !== 0)
        throw new Error(`Docker build failed:\n${result.stderr}`); if (this.config.agent.dockerRun)
        console.log("Image built. dockerRun is enabled, but an explicit port policy is required; refusing implicit docker run."); }
}
//# sourceMappingURL=loop.js.map
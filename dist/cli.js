#!/usr/bin/env node
import { Command } from "commander";
import { resolve } from "node:path";
import { initConfig, loadConfig, resolveApiKey, saveConfig, setSecret } from "./config/store.js";
import { createProvider } from "./providers/factory.js";
import { AutonomousLoop } from "./agent/loop.js";
import { ModelStore } from "./models/store.js";
import { LlamaCppServer } from "./runtime/llamacpp.js";
import { launchUi } from "./ui/app.js";
const root = (value) => resolve(value ?? process.cwd());
const program = new Command().name("arachne").description("Local-first autonomous development CLI").version("0.1.0");
program.command("init").option("-d, --dir <path>", "project directory").action(async (options) => { const dir = root(options.dir); await initConfig(dir); console.log(`Initialized ${dir}/.arachne`); });
const configCommand = program.command("config").description("Manage local configuration");
configCommand.command("show").option("-d, --dir <path>").action(async (o) => console.log(JSON.stringify(await loadConfig(root(o.dir)), null, 2)));
configCommand.command("set <key> <value>").option("-d, --dir <path>").action(async (key, value, o) => { const dir = root(o.dir); const config = await loadConfig(dir); if (key === "apiKey")
    await setSecret(dir, config.provider.apiKeyEnv ?? { anthropic: "ANTHROPIC_API_KEY", openai: "OPENAI_API_KEY", deepseek: "DEEPSEEK_API_KEY", huggingface: "HF_TOKEN" }[config.provider.kind] ?? "ARACHNE_API_KEY", value);
else {
    const keys = key.split(".");
    const target = keys.length === 2 && (keys[0] === "provider" || keys[0] === "agent") ? config[keys[0]] : keys.length === 3 && keys[0] === "runtime" && keys[1] === "llamaCpp" ? config.runtime.llamaCpp : undefined;
    const field = keys.at(-1);
    if (!target || !(field in target))
        throw new Error("Use provider.model, agent.maxIterations, runtime.llamaCpp.executable, or apiKey");
    const current = target[field];
    const parsed = typeof current === "boolean" ? value === "true" : typeof current === "number" ? Number(value) : value;
    if (typeof current === "boolean" && value !== "true" && value !== "false")
        throw new Error("Boolean values must be true or false");
    if (typeof parsed === "number" && !Number.isFinite(parsed))
        throw new Error("Expected a number");
    target[field] = parsed;
    await saveConfig(dir, config);
} console.log("Configuration saved locally."); });
const models = program.command("models").description("Manage local GGUF models in .arachne/models");
models.command("list").option("-d, --dir <path>").action(async (o) => { console.table(await new ModelStore(root(o.dir)).list()); });
models.command("import <name> <ggufPath>").option("-d, --dir <path>").action(async (name, ggufPath, o) => { const item = await new ModelStore(root(o.dir)).import(name, resolve(ggufPath)); console.log(`Imported ${item.name} into .arachne/models/${item.file}`); });
program.command("ui").description("Open the standalone Arachne terminal interface (does not start a model)").option("--demo", "run with local demo responses only").option("--preview", "render once and exit").action(async (options) => { await launchUi(options); });
program.command("run <task>").option("-d, --dir <path>").action(async (task, o) => { const dir = root(o.dir); const config = await loadConfig(dir); const server = config.provider.kind === "llamacpp" && config.runtime.llamaCpp.autoStart ? new LlamaCppServer(dir, config) : undefined; try {
    await server?.start();
    const loop = new AutonomousLoop(dir, config, createProvider(config, await resolveApiKey(dir, config)));
    await loop.run(task);
}
finally {
    server?.stop();
} });
program.parseAsync().catch(error => { console.error(`Arachne error: ${error.message}`); process.exitCode = 1; });
//# sourceMappingURL=cli.js.map
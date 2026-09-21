import { mkdir, readFile, writeFile, chmod } from "node:fs/promises";
import path from "node:path";
import { configSchema } from "./schema.js";
const defaults = { agent: { maxIterations: 4, dockerBuild: true, dockerRun: false, testCommand: "npm test" }, provider: { kind: "ollama", model: "qwen2.5-coder:7b", baseUrl: "http://127.0.0.1:11434" }, runtime: { llamaCpp: { executable: "llama-server", host: "127.0.0.1", port: 8080, contextSize: 8192, gpuLayers: -1, autoStart: true } } };
export const arachneDir = (root) => path.join(root, ".arachne");
const configPath = (root) => path.join(arachneDir(root), "config.json");
const secretsPath = (root) => path.join(arachneDir(root), "secrets.json");
export async function initConfig(root) {
    await mkdir(arachneDir(root), { recursive: true });
    try {
        await readFile(configPath(root));
    }
    catch {
        await writeFile(configPath(root), JSON.stringify(defaults, null, 2) + "\n", "utf8");
    }
    return loadConfig(root);
}
export async function loadConfig(root) {
    const raw = JSON.parse(await readFile(configPath(root), "utf8"));
    return configSchema.parse(raw);
}
export async function saveConfig(root, config) { await writeFile(configPath(root), JSON.stringify(config, null, 2) + "\n", "utf8"); }
export async function setSecret(root, key, value) {
    await mkdir(arachneDir(root), { recursive: true });
    let current = {};
    try {
        current = JSON.parse(await readFile(secretsPath(root), "utf8"));
    }
    catch { /* new secret store */ }
    current[key] = value;
    await writeFile(secretsPath(root), JSON.stringify(current, null, 2) + "\n", { mode: 0o600 });
    await chmod(secretsPath(root), 0o600);
}
export async function resolveApiKey(root, config) {
    const defaultKeyEnvs = {
        anthropic: "ANTHROPIC_API_KEY", openai: "OPENAI_API_KEY", deepseek: "DEEPSEEK_API_KEY", huggingface: "HF_TOKEN"
    };
    const envName = config.provider.apiKeyEnv ?? defaultKeyEnvs[config.provider.kind];
    if (!envName)
        return undefined;
    if (process.env[envName])
        return process.env[envName];
    try {
        return JSON.parse(await readFile(secretsPath(root), "utf8"))[envName];
    }
    catch {
        return undefined;
    }
}
//# sourceMappingURL=store.js.map
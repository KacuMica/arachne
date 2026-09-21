import { mkdir, readFile, writeFile, chmod } from "node:fs/promises";
import path from "node:path";
import { configSchema } from "./schema.js";
import type { ArachneConfig, ProviderKind } from "../types.js";

const defaults: ArachneConfig = { agent: { maxIterations: 4, dockerBuild: true, dockerRun: false }, provider: { kind: "ollama", model: "qwen2.5-coder:7b", baseUrl: "http://127.0.0.1:11434" }, runtime: { llamaCpp: { executable: "llama-server", host: "127.0.0.1", port: 8080, contextSize: 8192, gpuLayers: -1, autoStart: true } }, git: { commitOnSuccess: false, pushOnSuccess: false } };
export const arachneDir = (root: string) => path.join(root, ".arachne");
const configPath = (root: string) => path.join(arachneDir(root), "config.json");
const secretsPath = (root: string) => path.join(arachneDir(root), "secrets.json");

export async function initConfig(root: string): Promise<ArachneConfig> {
  await mkdir(arachneDir(root), { recursive: true });
  try { await readFile(configPath(root)); } catch { await writeFile(configPath(root), JSON.stringify(defaults, null, 2) + "\n", "utf8"); }
  return loadConfig(root);
}
export async function loadConfig(root: string): Promise<ArachneConfig> {
  const raw = JSON.parse(await readFile(configPath(root), "utf8"));
  return configSchema.parse(raw) as ArachneConfig;
}
export async function saveConfig(root: string, config: ArachneConfig): Promise<void> { await writeFile(configPath(root), JSON.stringify(config, null, 2) + "\n", "utf8"); }
export async function setSecret(root: string, key: string, value: string): Promise<void> {
  await mkdir(arachneDir(root), { recursive: true }); let current: Record<string, string> = {};
  try { current = JSON.parse(await readFile(secretsPath(root), "utf8")); } catch { /* new secret store */ }
  current[key] = value; await writeFile(secretsPath(root), JSON.stringify(current, null, 2) + "\n", { mode: 0o600 }); await chmod(secretsPath(root), 0o600);
}
export async function resolveApiKey(root: string, config: ArachneConfig): Promise<string | undefined> {
  const defaultKeyEnvs: Partial<Record<ProviderKind, string>> = {
    anthropic: "ANTHROPIC_API_KEY", openai: "OPENAI_API_KEY", deepseek: "DEEPSEEK_API_KEY", huggingface: "HF_TOKEN"
  };
  const envName = config.provider.apiKeyEnv ?? defaultKeyEnvs[config.provider.kind];
  if (!envName) return undefined; if (process.env[envName]) return process.env[envName];
  try { return JSON.parse(await readFile(secretsPath(root), "utf8"))[envName]; } catch { return undefined; }
}

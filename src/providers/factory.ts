import type { ArachneConfig, ModelProvider } from "../types.js";
import { HttpProvider, openAiCompatible } from "./http.js";

export function createProvider(config: ArachneConfig, apiKey?: string): ModelProvider {
  const { kind, model } = config.provider;
  if (kind === "ollama") {
    const base = config.provider.baseUrl ?? "http://127.0.0.1:11434";
    return new HttpProvider("ollama", `${base}/api/chat`, {}, (system, prompt) => ({ model, stream: false, messages: [{ role: "system", content: system }, { role: "user", content: prompt }] }), j => j.message?.content ?? "");
  }
  if (kind === "anthropic") return new HttpProvider("anthropic", `${config.provider.baseUrl ?? "https://api.anthropic.com"}/v1/messages`, { "x-api-key": requireKey(apiKey, kind), "anthropic-version": "2023-06-01" }, (system, prompt) => ({ model, max_tokens: 8192, system, messages: [{ role: "user", content: prompt }] }), j => j.content?.[0]?.text ?? "");
  if (kind === "huggingface") return new HttpProvider("huggingface", config.provider.baseUrl ?? `https://api-inference.huggingface.co/models/${model}`, apiKey ? { authorization: `Bearer ${apiKey}` } : {}, (_s, prompt) => ({ inputs: prompt, parameters: { max_new_tokens: 4096 } }), j => Array.isArray(j) ? (j[0]?.generated_text ?? "") : (j.generated_text ?? ""));
  const base = config.provider.baseUrl ?? (kind === "deepseek" ? "https://api.deepseek.com" : kind === "llamacpp" ? "http://127.0.0.1:8080/v1" : "https://api.openai.com/v1");
  return openAiCompatible(kind, model, base, apiKey);
}
function requireKey(key: string | undefined, kind: string): string { if (!key) throw new Error(`${kind} requires an API key. Set its environment variable or run arachne config set apiKey <key>.`); return key; }

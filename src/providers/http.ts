import type { ModelProvider, ProviderKind } from "../types.js";

export class HttpProvider implements ModelProvider {
  constructor(public readonly name: string, private readonly endpoint: string, private readonly headers: Record<string, string>, private readonly body: (system: string, prompt: string) => unknown, private readonly extract: (json: any) => string) {}
  async complete(system: string, prompt: string): Promise<string> {
    const response = await fetch(this.endpoint, { method: "POST", headers: { "content-type": "application/json", ...this.headers }, body: JSON.stringify(this.body(system, prompt)) });
    if (!response.ok) throw new Error(`${this.name} request failed (${response.status}): ${await response.text()}`);
    return this.extract(await response.json());
  }
}
export function openAiCompatible(kind: ProviderKind, model: string, baseUrl: string, apiKey?: string): ModelProvider {
  return new HttpProvider(kind, `${baseUrl.replace(/\/$/, "")}/chat/completions`, apiKey ? { authorization: `Bearer ${apiKey}` } : {}, (system, prompt) => ({ model, messages: [{ role: "system", content: system }, { role: "user", content: prompt }], temperature: 0.1 }), json => json.choices?.[0]?.message?.content ?? "");
}

import type { ModelProvider, ProviderKind } from "../types.js";
export declare class HttpProvider implements ModelProvider {
    readonly name: string;
    private readonly endpoint;
    private readonly headers;
    private readonly body;
    private readonly extract;
    constructor(name: string, endpoint: string, headers: Record<string, string>, body: (system: string, prompt: string) => unknown, extract: (json: any) => string);
    complete(system: string, prompt: string): Promise<string>;
}
export declare function openAiCompatible(kind: ProviderKind, model: string, baseUrl: string, apiKey?: string): ModelProvider;

export type ProviderKind = "ollama" | "llamacpp" | "huggingface" | "openai" | "anthropic" | "deepseek";

export interface ArachneConfig {
  agent: { maxIterations: number; testCommand?: string; dockerBuild: boolean; dockerRun: boolean };
  provider: { kind: ProviderKind; model: string; baseUrl?: string; apiKeyEnv?: string };
  runtime: { llamaCpp: { executable: string; host: string; port: number; contextSize: number; gpuLayers: number; autoStart: boolean } };
  git: { commitOnSuccess: boolean; pushOnSuccess: boolean };
}

export type AgentAction =
  | { type: "plan"; summary: string }
  | { type: "write_file"; path: string; content: string }
  | { type: "run_tests"; command?: string }
  | { type: "containerize"; dockerfile: string; compose?: string }
  | { type: "git_commit"; message: string }
  | { type: "git_push" }
  | { type: "done"; summary: string };

export interface ModelProvider {
  name: string;
  complete(system: string, prompt: string): Promise<string>;
}

export interface CommandResult { code: number; stdout: string; stderr: string; }

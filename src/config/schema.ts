import { z } from "zod";

export const configSchema = z.object({
  agent: z.object({ maxIterations: z.number().int().min(1).max(20).default(4), testCommand: z.string().min(1).optional(), dockerBuild: z.boolean().default(true), dockerRun: z.boolean().default(false) }).default({}),
  provider: z.object({
    kind: z.enum(["ollama", "llamacpp", "huggingface", "openai", "anthropic", "deepseek"]),
    model: z.string().min(1), baseUrl: z.string().url().optional(), apiKeyEnv: z.string().min(1).optional()
  }),
  runtime: z.object({ llamaCpp: z.object({ executable: z.string().min(1).default("llama-server"), host: z.string().default("127.0.0.1"), port: z.number().int().min(1).max(65535).default(8080), contextSize: z.number().int().min(512).default(8192), gpuLayers: z.number().int().default(-1), autoStart: z.boolean().default(true) }).default({}) }).default({}),
  git: z.object({ commitOnSuccess: z.boolean().default(false), pushOnSuccess: z.boolean().default(false) }).default({})
});

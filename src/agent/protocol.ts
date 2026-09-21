import { z } from "zod";
import type { AgentAction } from "../types.js";

const actionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("plan"), summary: z.string() }),
  z.object({ type: z.literal("write_file"), path: z.string().min(1), content: z.string() }),
  z.object({ type: z.literal("run_tests"), command: z.string().optional() }),
  z.object({ type: z.literal("containerize"), dockerfile: z.string(), compose: z.string().optional() }),
  z.object({ type: z.literal("git_commit"), message: z.string().min(1).max(120) }),
  z.object({ type: z.literal("git_push") }),
  z.object({ type: z.literal("done"), summary: z.string() })
]);
export function parseActions(text: string): AgentAction[] {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i)?.[1] ?? text;
  const candidate = JSON.parse(fenced.trim());
  return z.array(actionSchema).min(1).parse(Array.isArray(candidate) ? candidate : candidate.actions) as AgentAction[];
}
export const SYSTEM_PROMPT = `You are Arachne, a coding agent. Return ONLY a JSON array (or {"actions": [...]}) using actions: plan, write_file, run_tests, containerize, git_commit, git_push, done. Never use shell actions. Write paths relative to project root. The runtime chooses safe test tooling from local project manifests; use run_tests without a command unless a configured command is essential. Git actions only execute when enabled by local user config. First respond with a plan and write_file actions. In repair turns, only write needed corrections and run_tests. Do not output Markdown.`;

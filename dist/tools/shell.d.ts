import type { CommandResult } from "../types.js";
export declare function runCommand(cwd: string, executable: string, args: string[], timeoutMs?: number): Promise<CommandResult>;
export declare function splitCommand(command: string): [string, string[]];

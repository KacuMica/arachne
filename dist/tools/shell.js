import { spawn } from "node:child_process";
const allowed = new Set(["npm", "pnpm", "yarn", "bun", "cargo", "pytest", "python", "python3", "docker", "git"]);
export async function runCommand(cwd, executable, args, timeoutMs = 300_000) {
    if (!allowed.has(executable))
        throw new Error(`Command is not allow-listed: ${executable}`);
    return new Promise((resolve, reject) => {
        const child = spawn(executable, args, { cwd, shell: false, windowsHide: true });
        let stdout = "", stderr = "";
        const timer = setTimeout(() => { child.kill(); reject(new Error(`Timed out: ${executable}`)); }, timeoutMs);
        child.stdout.on("data", d => stdout += d);
        child.stderr.on("data", d => stderr += d);
        child.on("error", reject);
        child.on("close", code => { clearTimeout(timer); resolve({ code: code ?? 1, stdout, stderr }); });
    });
}
export function splitCommand(command) {
    const [exe, ...args] = command.trim().split(/\s+/);
    if (!exe || /[|;&`$<>]/.test(command))
        throw new Error("Unsafe test command");
    return [exe, args];
}
//# sourceMappingURL=shell.js.map
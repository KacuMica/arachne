import readline from "node:readline";
import { divider, logo, paint } from "./theme.js";

export interface UiOptions { demo?: boolean; preview?: boolean; }

function renderShell(demo: boolean): void {
  console.log(logo());
  console.log(`${paint.muted("  autonomous engineering, local-first")}`);
  console.log(divider());
  console.log(`  ${paint.bright("◈ Arachne")}${paint.muted("  /  workspace")}`);
  console.log(`  ${paint.ok("●")}${paint.muted(" local runtime")}: ${demo ? paint.ok("demo mode — no model required") : paint.muted("not connected")}`);
  console.log(`  ${paint.purple("◆")}${paint.muted(" session")}: ${paint.bold("new")}`);
  console.log(divider());
  console.log(`  ${paint.muted("Describe what you want to build. Arachne will plan, write, test and iterate.")}`);
  console.log(`  ${paint.dim("Commands: /help  /status  /clear  /exit")}`);
  console.log("");
}

function answer(input: string): string {
  if (input === "/help") return `${paint.bright("Commands")}\n  /status  Show local runtime state\n  /clear   Redraw the interface\n  /exit    Close Arachne`;
  if (input === "/status") return `${paint.ok("● Demo runtime is ready.")} No server, model, files, or commands are used.`;
  return `${paint.purple("◆ Plan preview")}\n  ${paint.muted("Task received:")} ${input}\n  ${paint.muted("Demo mode does not call a model or modify files.")}`;
}

export async function launchUi(options: UiOptions): Promise<void> {
  const demo = Boolean(options.demo);
  if (options.preview) { renderShell(demo); return; }
  if (!process.stdin.isTTY || !process.stdout.isTTY) { renderShell(demo); console.log(paint.muted("Interactive mode requires a terminal. Use --preview for a static render.")); return; }
  console.clear(); renderShell(demo);
  const terminal = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: paint.bright("  ❯ ") });
  terminal.prompt();
  terminal.on("line", line => {
    const input = line.trim();
    if (input === "/exit" || input === "/quit") { console.log(paint.muted("\n  Session ended. Your local data stays local.\n")); terminal.close(); return; }
    if (input === "/clear") { console.clear(); renderShell(demo); terminal.prompt(); return; }
    if (input) console.log(`\n${answer(input)}\n`);
    terminal.prompt();
  });
  await new Promise<void>(resolve => terminal.on("close", resolve));
}

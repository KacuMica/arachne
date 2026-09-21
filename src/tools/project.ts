import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { splitCommand } from "./shell.js";

export interface TestPlan { label: string; executable: string; args: string[]; }
const exists = async (target: string) => access(target).then(() => true).catch(() => false);

export async function inspectProject(root: string): Promise<string> {
  const signals: string[] = [];
  if (await exists(path.join(root, "package.json"))) signals.push("Node.js package.json");
  if (await exists(path.join(root, "pyproject.toml"))) signals.push("Python pyproject.toml");
  if (await exists(path.join(root, "Cargo.toml"))) signals.push("Rust Cargo.toml");
  if (await exists(path.join(root, "Dockerfile"))) signals.push("Dockerfile");
  if (await exists(path.join(root, "docker-compose.yml"))) signals.push("Docker Compose");
  return signals.length ? `Detected project capabilities: ${signals.join(", ")}.` : "No recognized project manifest yet.";
}

export async function selectTests(root: string, fallback?: string): Promise<TestPlan[]> {
  if (fallback) { const [executable, args] = splitCommand(fallback); return [{ label: "configured test command", executable, args }]; }
  const plans: TestPlan[] = [];
  const packagePath = path.join(root, "package.json");
  if (await exists(packagePath)) {
    const pkg = JSON.parse(await readFile(packagePath, "utf8")) as { scripts?: Record<string, string>; devDependencies?: Record<string, string>; dependencies?: Record<string, string> };
    if (pkg.scripts?.test) plans.push({ label: "Node test script", executable: "npm", args: ["test"] });
    const allDependencies = { ...pkg.dependencies, ...pkg.devDependencies };
    if (allDependencies["@playwright/test"] && !pkg.scripts?.test) plans.push({ label: "Playwright", executable: "npx", args: ["playwright", "test"] });
  }
  const pythonProject = await exists(path.join(root, "pyproject.toml")) || await exists(path.join(root, "pytest.ini")) || await exists(path.join(root, "requirements.txt"));
  if (pythonProject) plans.push({ label: "pytest (including Selenium tests when present)", executable: "pytest", args: [] });
  if (await exists(path.join(root, "Cargo.toml"))) plans.push({ label: "Rust tests", executable: "cargo", args: ["test"] });
  return plans;
}

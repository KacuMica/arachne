<h1 align="center">arachne</h1>

<p align="center">Local-first, autonomous engineering CLI.</p>

Local-first, open-source CLI foundation for autonomous software development and deployment.

## Quick start

```sh
npm install
npm run build
node dist/cli.js init
node dist/cli.js config show
node dist/cli.js run "Create a TypeScript HTTP health endpoint"
```

`init` creates `.arachne/` in the target project, including `config.json` (see `arachne.config.json.example`). Configuration, session history and secrets remain there; no telemetry is sent. API keys are resolved from environment variables first, then `.arachne/secrets.json` (which is intentionally ignored by Git).

Provider examples: Hugging Face: `{ "kind": "huggingface", "model": "Qwen/Qwen2.5-Coder-32B-Instruct" }`; Claude: `{ "kind": "anthropic", "model": "claude-sonnet-4-5", "apiKeyEnv": "ANTHROPIC_API_KEY" }`; llama.cpp: `{ "kind": "llamacpp", "model": "local-model", "baseUrl": "http://127.0.0.1:8080/v1" }`.

## Independent llama.cpp runtime

Install or build `llama-server` from llama.cpp and place it on `PATH` (or set `runtime.llamaCpp.executable` to its absolute path). Import a GGUF weight file into the project-local model store, then select it:

```powershell
arachne models import qwen-coder C:\Models\qwen-coder.gguf
arachne config set provider.kind llamacpp
arachne config set provider.model qwen-coder
arachne run "Your task"
```

The imported weight stays in `.arachne/models/`; `.arachne/models/registry.json` records only its local metadata. Arachne launches `llama-server` on `127.0.0.1:8080` for the run and stops the process afterward. Adjust `runtime.llamaCpp.executable`, `.port`, `.contextSize`, or `.gpuLayers` with `arachne config set` when needed.

## Terminal interface without a model

Use the purple Arachne terminal UI without any installed provider or model. It never starts a server or changes project files:

```powershell
arachne ui --demo
# Static render for a quick check:
arachne ui --demo --preview
```

## Test, Docker, and Git automation

Before each test action, Arachne inspects local manifests. It selects `npm test` for Node package scripts, Playwright for projects declaring `@playwright/test` without a test script, `pytest` for Python and Selenium test projects, and `cargo test` for Rust. Set `agent.testCommand` only to override this selection.

On a successful test run, Arachne can build a present `Dockerfile` and `docker-compose.yml`. It skips Docker gracefully if no Dockerfile exists. Git commits stage only files that Arachne wrote during that run. Commit author name and email come only from the current user's local Git configuration; GitHub passwords are never requested or stored. Enable commit/push explicitly:

```powershell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
arachne config set git.commitOnSuccess true
# Requires existing SSH / Git Credential Manager / gh authentication:
arachne config set git.pushOnSuccess true
```

## Architecture

| Directory | Responsibility |
| --- | --- |
| `src/config` | Config parsing, validation and local secret storage |
| `src/providers` | Model adapters and provider factory |
| `src/agent` | Plan → write → test → fix → containerize orchestration |
| `src/tools` | Sandboxed project file and process operations |
| `src/memory` | JSONL sessions and compact project context |

Providers emit JSON actions, so the agent never treats arbitrary model prose as shell input. File paths are restricted to the selected project directory. Shell commands are allow-listed by executable and run with no shell interpolation.

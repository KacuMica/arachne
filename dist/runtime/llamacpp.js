import { spawn } from "node:child_process";
import { ModelStore } from "../models/store.js";
export class LlamaCppServer {
    root;
    config;
    process;
    startError;
    constructor(root, config) {
        this.root = root;
        this.config = config;
    }
    async start() {
        const settings = this.config.runtime.llamaCpp;
        if (await this.healthy())
            return;
        const model = await new ModelStore(this.root).modelPath(this.config.provider.model);
        const args = ["-m", model, "--host", settings.host, "--port", String(settings.port), "-c", String(settings.contextSize), "-ngl", String(settings.gpuLayers)];
        this.startError = undefined;
        this.process = spawn(settings.executable, args, { cwd: this.root, shell: false, windowsHide: true, stdio: "ignore" });
        this.process.once("error", error => { this.startError = error; });
        for (let retry = 0; retry < 30; retry++) {
            const error = this.launchError();
            if (error)
                throw new Error(`Could not start llama.cpp (${settings.executable}): ${error.message}`);
            if (await this.healthy())
                return;
            await new Promise(resolve => setTimeout(resolve, 1_000));
        }
        this.stop();
        throw new Error("llama.cpp did not become ready within 30 seconds. Check runtime.llamaCpp.executable and model compatibility.");
    }
    stop() { this.process?.kill(); this.process = undefined; }
    launchError() { return this.startError; }
    async healthy() { try {
        return (await fetch(`http://${this.config.runtime.llamaCpp.host}:${this.config.runtime.llamaCpp.port}/health`)).ok;
    }
    catch {
        return false;
    } }
}
//# sourceMappingURL=llamacpp.js.map
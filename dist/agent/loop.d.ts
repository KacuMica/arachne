import type { ArachneConfig, ModelProvider } from "../types.js";
import { LocalMemory } from "../memory/session.js";
export declare class AutonomousLoop {
    private readonly root;
    private readonly config;
    private readonly provider;
    private readonly memory;
    constructor(root: string, config: ArachneConfig, provider: ModelProvider, memory?: LocalMemory);
    run(task: string): Promise<void>;
    private tests;
    private containerize;
}

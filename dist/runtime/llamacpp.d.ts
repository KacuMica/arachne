import type { ArachneConfig } from "../types.js";
export declare class LlamaCppServer {
    private readonly root;
    private readonly config;
    private process?;
    private startError?;
    constructor(root: string, config: ArachneConfig);
    start(): Promise<void>;
    stop(): void;
    private launchError;
    private healthy;
}

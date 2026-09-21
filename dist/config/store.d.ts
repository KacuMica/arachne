import type { ArachneConfig } from "../types.js";
export declare const arachneDir: (root: string) => string;
export declare function initConfig(root: string): Promise<ArachneConfig>;
export declare function loadConfig(root: string): Promise<ArachneConfig>;
export declare function saveConfig(root: string, config: ArachneConfig): Promise<void>;
export declare function setSecret(root: string, key: string, value: string): Promise<void>;
export declare function resolveApiKey(root: string, config: ArachneConfig): Promise<string | undefined>;

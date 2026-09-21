export declare function resolveProjectPath(root: string, requested: string): string;
export declare function writeProjectFile(root: string, requested: string, content: string): Promise<void>;
export declare function readProjectFile(root: string, requested: string): Promise<string>;

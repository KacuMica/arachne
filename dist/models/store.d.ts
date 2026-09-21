export interface LocalModel {
    name: string;
    file: string;
    format: "gguf";
    importedAt: string;
}
export declare class ModelStore {
    private readonly root;
    constructor(root: string);
    list(): Promise<LocalModel[]>;
    find(name: string): Promise<LocalModel>;
    import(name: string, source: string): Promise<LocalModel>;
    modelPath(name: string): Promise<string>;
}

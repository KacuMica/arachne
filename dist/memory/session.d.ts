export declare class LocalMemory {
    private readonly dir;
    constructor(root: string);
    record(event: object): Promise<void>;
    context(): Promise<string>;
    saveContext(value: string): Promise<void>;
}

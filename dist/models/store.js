import { access, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
const modelDir = (root) => path.join(root, ".arachne", "models");
const registryPath = (root) => path.join(modelDir(root), "registry.json");
export class ModelStore {
    root;
    constructor(root) {
        this.root = root;
    }
    async list() { try {
        return JSON.parse(await readFile(registryPath(this.root), "utf8"));
    }
    catch {
        return [];
    } }
    async find(name) { const item = (await this.list()).find(model => model.name === name); if (!item)
        throw new Error(`Local model '${name}' is not registered. Use: arachne models import <name> <path-to-model.gguf>`); return item; }
    async import(name, source) {
        if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name))
            throw new Error("Model name may contain letters, digits, dot, underscore, and hyphen.");
        if (path.extname(source).toLowerCase() !== ".gguf")
            throw new Error("Only GGUF model files are supported by the llama.cpp model store.");
        await access(source, constants.R_OK);
        await mkdir(modelDir(this.root), { recursive: true });
        const file = `${name}.gguf`;
        await copyFile(source, path.join(modelDir(this.root), file));
        const models = (await this.list()).filter(model => model.name !== name);
        const item = { name, file, format: "gguf", importedAt: new Date().toISOString() };
        models.push(item);
        await writeFile(registryPath(this.root), JSON.stringify(models, null, 2) + "\n", "utf8");
        return item;
    }
    async modelPath(name) { const model = await this.find(name); const target = path.resolve(modelDir(this.root), model.file); if (path.dirname(target) !== path.resolve(modelDir(this.root)))
        throw new Error("Invalid model registry path."); await access(target, constants.R_OK); return target; }
}
//# sourceMappingURL=store.js.map
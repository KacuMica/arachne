import { z } from "zod";
export declare const configSchema: z.ZodObject<{
    agent: z.ZodDefault<z.ZodObject<{
        maxIterations: z.ZodDefault<z.ZodNumber>;
        testCommand: z.ZodOptional<z.ZodString>;
        dockerBuild: z.ZodDefault<z.ZodBoolean>;
        dockerRun: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        maxIterations: number;
        dockerBuild: boolean;
        dockerRun: boolean;
        testCommand?: string | undefined;
    }, {
        maxIterations?: number | undefined;
        testCommand?: string | undefined;
        dockerBuild?: boolean | undefined;
        dockerRun?: boolean | undefined;
    }>>;
    provider: z.ZodObject<{
        kind: z.ZodEnum<["ollama", "llamacpp", "huggingface", "openai", "anthropic", "deepseek"]>;
        model: z.ZodString;
        baseUrl: z.ZodOptional<z.ZodString>;
        apiKeyEnv: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        kind: "ollama" | "llamacpp" | "huggingface" | "openai" | "anthropic" | "deepseek";
        model: string;
        baseUrl?: string | undefined;
        apiKeyEnv?: string | undefined;
    }, {
        kind: "ollama" | "llamacpp" | "huggingface" | "openai" | "anthropic" | "deepseek";
        model: string;
        baseUrl?: string | undefined;
        apiKeyEnv?: string | undefined;
    }>;
    runtime: z.ZodDefault<z.ZodObject<{
        llamaCpp: z.ZodDefault<z.ZodObject<{
            executable: z.ZodDefault<z.ZodString>;
            host: z.ZodDefault<z.ZodString>;
            port: z.ZodDefault<z.ZodNumber>;
            contextSize: z.ZodDefault<z.ZodNumber>;
            gpuLayers: z.ZodDefault<z.ZodNumber>;
            autoStart: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            executable: string;
            host: string;
            port: number;
            contextSize: number;
            gpuLayers: number;
            autoStart: boolean;
        }, {
            executable?: string | undefined;
            host?: string | undefined;
            port?: number | undefined;
            contextSize?: number | undefined;
            gpuLayers?: number | undefined;
            autoStart?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        llamaCpp: {
            executable: string;
            host: string;
            port: number;
            contextSize: number;
            gpuLayers: number;
            autoStart: boolean;
        };
    }, {
        llamaCpp?: {
            executable?: string | undefined;
            host?: string | undefined;
            port?: number | undefined;
            contextSize?: number | undefined;
            gpuLayers?: number | undefined;
            autoStart?: boolean | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    agent: {
        maxIterations: number;
        dockerBuild: boolean;
        dockerRun: boolean;
        testCommand?: string | undefined;
    };
    provider: {
        kind: "ollama" | "llamacpp" | "huggingface" | "openai" | "anthropic" | "deepseek";
        model: string;
        baseUrl?: string | undefined;
        apiKeyEnv?: string | undefined;
    };
    runtime: {
        llamaCpp: {
            executable: string;
            host: string;
            port: number;
            contextSize: number;
            gpuLayers: number;
            autoStart: boolean;
        };
    };
}, {
    provider: {
        kind: "ollama" | "llamacpp" | "huggingface" | "openai" | "anthropic" | "deepseek";
        model: string;
        baseUrl?: string | undefined;
        apiKeyEnv?: string | undefined;
    };
    agent?: {
        maxIterations?: number | undefined;
        testCommand?: string | undefined;
        dockerBuild?: boolean | undefined;
        dockerRun?: boolean | undefined;
    } | undefined;
    runtime?: {
        llamaCpp?: {
            executable?: string | undefined;
            host?: string | undefined;
            port?: number | undefined;
            contextSize?: number | undefined;
            gpuLayers?: number | undefined;
            autoStart?: boolean | undefined;
        } | undefined;
    } | undefined;
}>;

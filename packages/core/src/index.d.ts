/**
 * pi-driven core — Enterprise patterns extracted from rpiv-mono, my-pi, plannotator.
 * @module @pi-driven/core
 */
declare const brand: unique symbol;
export type Brand<T, TBrand> = T & {
    [brand]: TBrand;
};
export type UserId = Brand<string, "UserId">;
export type TaskId = Brand<string, "TaskId">;
export type SessionId = Brand<string, "SessionId">;
export type Result<T, E = Error> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
export declare function ok<T>(value: T): Result<T, never>;
export declare function err<E = Error>(error: E): Result<never, E>;
export type RequestState<T> = {
    status: "idle";
} | {
    status: "loading";
} | {
    status: "success";
    data: T;
} | {
    status: "error";
    error: Error;
};
export declare function tryCatch<T>(fn: () => Promise<T>): Promise<Result<T>>;
export declare function configPath(namespace: string, file?: string): string;
export declare function loadConfig<T>(path: string, fallback: T): T;
export declare function saveConfig(path: string, data: unknown): Result<true>;
export type Reducer<S, A> = (state: S, action: A) => S;
export declare function createStore<S>(initial: S): {
    get: () => S;
    set: (next: S) => void;
    update: (fn: (s: S) => S) => void;
    subscribe: (fn: (s: S) => void) => () => boolean;
};
export type TaskStatus = "pending" | "in_progress" | "completed" | "blocked";
export interface Task {
    id: string;
    title: string;
    status: TaskStatus;
    dependsOn: string[];
    createdAt: string;
    completedAt?: string;
}
export type TaskAction = {
    type: "add";
    task: Omit<Task, "id" | "createdAt">;
} | {
    type: "update";
    id: string;
    changes: Partial<Omit<Task, "id" | "createdAt">>;
} | {
    type: "remove";
    id: string;
} | {
    type: "reorder";
    ids: string[];
};
export declare function taskReducer(state: Task[], action: TaskAction): Task[];
export declare function getEnv(key: string, fallback?: string): string | undefined;
export declare function getEnvRequired(key: string): string;
export {};
//# sourceMappingURL=index.d.ts.map
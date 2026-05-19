/**
 * pi-driven core — Enterprise patterns extracted from rpiv-mono, my-pi, plannotator.
 * @module @pi-driven/core
 */
export function ok(value) {
    return { ok: true, value };
}
export function err(error) {
    return { ok: false, error };
}
// ── Async utilities ────────────────────────────────────────
export async function tryCatch(fn) {
    try {
        return ok(await fn());
    }
    catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
    }
}
// ── Config management (from rpiv-config pattern) ───────────
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
export function configPath(namespace, file = "config.json") {
    const base = join(homedir(), ".config", namespace);
    if (!existsSync(base))
        mkdirSync(base, { recursive: true });
    return join(base, file);
}
export function loadConfig(path, fallback) {
    try {
        if (!existsSync(path))
            return fallback;
        const raw = readFileSync(path, "utf-8");
        return JSON.parse(raw);
    }
    catch {
        return fallback;
    }
}
export function saveConfig(path, data) {
    try {
        const dir = dirname(path);
        if (!existsSync(dir))
            mkdirSync(dir, { recursive: true });
        writeFileSync(path, JSON.stringify(data, null, 2), { mode: 0o600 });
        return ok(true);
    }
    catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
    }
}
export function createStore(initial) {
    let state = initial;
    const listeners = new Set();
    return {
        get: () => state,
        set: (next) => {
            state = next;
            listeners.forEach((fn) => fn(state));
        },
        update: (fn) => {
            state = fn(state);
            listeners.forEach((fn) => fn(state));
        },
        subscribe: (fn) => {
            listeners.add(fn);
            return () => listeners.delete(fn);
        },
    };
}
export function taskReducer(state, action) {
    switch (action.type) {
        case "add": {
            const id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            return [...state, { ...action.task, id, createdAt: new Date().toISOString() }];
        }
        case "update":
            return state.map((t) => t.id === action.id
                ? { ...t, ...action.changes, completedAt: action.changes.status === "completed" ? new Date().toISOString() : t.completedAt }
                : t);
        case "remove":
            return state.filter((t) => t.id !== action.id);
        case "reorder":
            return action.ids.map((id) => state.find((t) => t.id === id)).filter(Boolean);
        default:
            return state;
    }
}
// ── Environment helpers ────────────────────────────────────
export function getEnv(key, fallback) {
    return process.env[key] ?? fallback;
}
export function getEnvRequired(key) {
    const val = process.env[key];
    if (!val)
        throw new Error(`${key} is required but not set`);
    return val;
}
//# sourceMappingURL=index.js.map
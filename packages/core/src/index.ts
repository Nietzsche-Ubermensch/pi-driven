/**
 * pi-driven core — Enterprise patterns extracted from rpiv-mono, my-pi, plannotator.
 * @module @pi-driven/core
 */

// ── Branded types ──────────────────────────────────────────
declare const brand: unique symbol;
export type Brand<T, TBrand> = T & { [brand]: TBrand };

export type UserId = Brand<string, "UserId">;
export type TaskId = Brand<string, "TaskId">;
export type SessionId = Brand<string, "SessionId">;

// ── Result type (never throw, always return) ───────────────
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E = Error>(error: E): Result<never, E> {
  return { ok: false, error };
}

// ── Request state (discriminated union) ────────────────────
export type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

// ── Async utilities ────────────────────────────────────────
export async function tryCatch<T>(
  fn: () => Promise<T>,
): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

// ── Config management (from rpiv-config pattern) ───────────
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

export function configPath(namespace: string, file = "config.json"): string {
  const base = join(homedir(), ".config", namespace);
  if (!existsSync(base)) mkdirSync(base, { recursive: true });
  return join(base, file);
}

export function loadConfig<T>(path: string, fallback: T): T {
  try {
    if (!existsSync(path)) return fallback;
    const raw = readFileSync(path, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveConfig(path: string, data: unknown): Result<true> {
  try {
    const dir = dirname(path);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(path, JSON.stringify(data, null, 2), { mode: 0o600 });
    return ok(true);
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

// ── State reducer pattern (from rpiv-todo pattern) ─────────
export type Reducer<S, A> = (state: S, action: A) => S;

export function createStore<S>(initial: S) {
  let state = initial;
  const listeners = new Set<(s: S) => void>();

  return {
    get: () => state,
    set: (next: S) => {
      state = next;
      listeners.forEach((fn) => fn(state));
    },
    update: (fn: (s: S) => S) => {
      state = fn(state);
      listeners.forEach((fn) => fn(state));
    },
    subscribe: (fn: (s: S) => void) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

// ── Task types (from rpiv-todo pattern) ────────────────────
export type TaskStatus = "pending" | "in_progress" | "completed" | "blocked";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  dependsOn: string[];
  createdAt: string;
  completedAt?: string;
}

export type TaskAction =
  | { type: "add"; task: Omit<Task, "id" | "createdAt"> }
  | { type: "update"; id: string; changes: Partial<Omit<Task, "id" | "createdAt">> }
  | { type: "remove"; id: string }
  | { type: "reorder"; ids: string[] };

export function taskReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case "add": {
      const id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      return [...state, { ...action.task, id, createdAt: new Date().toISOString() }];
    }
    case "update":
      return state.map((t) =>
        t.id === action.id
          ? { ...t, ...action.changes, completedAt: action.changes.status === "completed" ? new Date().toISOString() : t.completedAt }
          : t,
      );
    case "remove":
      return state.filter((t) => t.id !== action.id);
    case "reorder":
      return action.ids.map((id) => state.find((t) => t.id === id)!).filter(Boolean);
    default:
      return state;
  }
}

// ── Environment helpers ────────────────────────────────────
export function getEnv(key: string, fallback?: string): string | undefined {
  return process.env[key] ?? fallback;
}

export function getEnvRequired(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`${key} is required but not set`);
  return val;
}

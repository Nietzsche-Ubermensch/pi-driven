import { describe, it, expect } from "vitest";
import {
  ok, err, tryCatch, type Result,
  createStore, taskReducer, type Task,
  loadConfig, saveConfig, configPath,
} from "./index.js";
import { existsSync, unlinkSync } from "node:fs";

describe("Result", () => {
  it("ok() creates success", () => {
    const r = ok(42);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("err() creates failure", () => {
    const r = err(new Error("fail"));
    expect(r.ok).toBe(false);
  });

  it("tryCatch catches errors", async () => {
    const r = await tryCatch(async () => { throw new Error("boom"); });
    expect(r.ok).toBe(false);
  });

  it("tryCatch returns value on success", async () => {
    const r = await tryCatch(async () => "hello");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("hello");
  });
});

describe("Store", () => {
  it("get/set/update", () => {
    const store = createStore(0);
    expect(store.get()).toBe(0);
    store.set(5);
    expect(store.get()).toBe(5);
    store.update((n) => n + 1);
    expect(store.get()).toBe(6);
  });

  it("subscribe notifies", () => {
    const store = createStore(0);
    let val = 0;
    const unsub = store.subscribe((s) => { val = s; });
    store.set(10);
    expect(val).toBe(10);
    unsub();
    store.set(20);
    expect(val).toBe(10);
  });
});

describe("taskReducer", () => {
  const baseTask: Omit<Task, "id" | "createdAt"> = {
    title: "Test", status: "pending", dependsOn: [],
  };

  it("adds a task", () => {
    const state = taskReducer([], { type: "add", task: baseTask });
    expect(state).toHaveLength(1);
    expect(state[0]!.title).toBe("Test");
  });

  it("removes a task", () => {
    const s1 = taskReducer([], { type: "add", task: baseTask });
    const s2 = taskReducer(s1, { type: "remove", id: s1[0]!.id });
    expect(s2).toHaveLength(0);
  });
});

describe("Config", () => {
  it("loadConfig returns fallback when file missing", () => {
    const val = loadConfig("/nonexistent/path.json", { foo: "bar" });
    expect(val.foo).toBe("bar");
  });

  it("saveConfig and loadConfig roundtrip", () => {
    const path = configPath("pi-driven-test", "test.json");
    saveConfig(path, { hello: "world" });
    const val = loadConfig<{ hello: string }>(path, { hello: "" });
    expect(val.hello).toBe("world");
    if (existsSync(path)) unlinkSync(path);
  });
});

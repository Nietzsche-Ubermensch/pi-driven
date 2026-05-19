/**
 * pi-driven API server — Production HTTP server with health checks,
 * pipeline API, and task management.
 *
 * @module @pi-driven/api
 */

import { ok, err, type Result, getEnv, createStore } from "@pi-driven/core";
import {
  createPipelineRun,
  advanceStage,
  completeStage,
  ensureArtifactsDir,
  readArtifact,
  writeArtifact,
  type PipelineRun,
  type PipelineStage,
} from "@pi-driven/pipeline";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

// ── Configuration ──────────────────────────────────────────
export interface ServerConfig {
  port: number;
  host: string;
  artifactsDir: string;
}

export function createConfig(overrides?: Partial<ServerConfig>): ServerConfig {
  return {
    port: overrides?.port ?? Number(getEnv("PORT", "3000")),
    host: overrides?.host ?? getEnv("HOST", "0.0.0.0")!,
    artifactsDir: overrides?.artifactsDir ?? ".pi-driven/artifacts",
  };
}

// ── In-memory pipeline store ───────────────────────────────
const pipelineStore = createStore<Map<string, PipelineRun>>(new Map());

// ── Request router ─────────────────────────────────────────
function parseUrl(url: string | undefined): URL {
  return new URL(url ?? "/", "http://localhost");
}

function jsonResponse(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function bodyParser(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  cwd: string,
): Promise<void> {
  const url = parseUrl(req.url);
  const path = url.pathname;

  // Health check
  if (path === "/health" && req.method === "GET") {
    return jsonResponse(res, 200, { status: "ok", uptime: process.uptime() });
  }

  // Pipeline: create
  if (path === "/api/pipeline" && req.method === "POST") {
    const body = await bodyParser(req);
    const { task } = JSON.parse(body) as { task: string };
    const run = createPipelineRun(task);
    pipelineStore.update((m) => { m.set(run.id, run); return m; });
    ensureArtifactsDir(cwd);
    return jsonResponse(res, 201, run);
  }

  // Pipeline: get status
  if (path.startsWith("/api/pipeline/") && req.method === "GET") {
    const id = path.split("/")[3]!;
    const run = pipelineStore.get().get(id);
    if (!run) return jsonResponse(res, 404, { error: "Not found" });
    return jsonResponse(res, 200, run);
  }

  // Pipeline: advance stage
  if (path.startsWith("/api/pipeline/") && path.endsWith("/advance") && req.method === "POST") {
    const id = path.split("/")[3]!;
    const body = await bodyParser(req);
    const { stage } = JSON.parse(body) as { stage: PipelineStage };
    const run = pipelineStore.get().get(id);
    if (!run) return jsonResponse(res, 404, { error: "Not found" });
    const updated = advanceStage(run, stage);
    pipelineStore.update((m) => { m.set(id, updated); return m; });
    return jsonResponse(res, 200, updated);
  }

  // Artifacts: read
  if (path.startsWith("/api/artifacts/") && req.method === "GET") {
    const parts = path.replace("/api/artifacts/", "").split("/");
    const stage = parts[0] as PipelineStage;
    const filename = parts.slice(1).join("/") || "latest.md";
    const result = readArtifact(cwd, stage, filename);
    if (!result.ok) return jsonResponse(res, 404, { error: result.error.message });
    return jsonResponse(res, 200, { stage, filename, content: result.value });
  }

  // 404
  return jsonResponse(res, 404, { error: "Not found" });
}

// ── Server ─────────────────────────────────────────────────
export function startServer(
  config: ServerConfig,
  cwd: string = process.cwd(),
): Result<{ url: string; close: () => Promise<void> }> {
  try {
    const server = createServer((req, res) => {
      void handleRequest(req, res, cwd);
    });

    server.listen(config.port, config.host);

    const url = `http://${config.host}:${config.port}`;
    console.log(`pi-driven API running at ${url}`);

    return ok({
      url,
      close: () => new Promise((resolve, reject) => {
        server.close((err) => err ? reject(err) : resolve());
      }),
    });
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

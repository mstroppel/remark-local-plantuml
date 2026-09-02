import { createHash, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { visit } from "unist-util-visit";

const require = createRequire(import.meta.url);
const plantumlPackage = require("node-plantuml-back/package.json");
const plantumlJar = require.resolve("node-plantuml-back/vendor/plantuml.jar");
const cacheDirectory = path.join(process.cwd(), ".docusaurus", "plantuml");
const renderLockDirectory = `${cacheDirectory}.locks`;
const renderConcurrency = 3;
const lockTimeoutMilliseconds = 5 * 60 * 1000;

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function acquireRenderLock() {
  await mkdir(renderLockDirectory, { recursive: true });

  while (true) {
    for (let slot = 0; slot < renderConcurrency; slot += 1) {
      const lockPath = path.join(renderLockDirectory, slot.toString());

      try {
        await mkdir(lockPath);
        return lockPath;
      } catch (error) {
        if (error.code !== "EEXIST") {
          throw error;
        }
      }

      try {
        const lockAge = Date.now() - (await stat(lockPath)).mtimeMs;
        if (lockAge > lockTimeoutMilliseconds) {
          await rm(lockPath, { recursive: true, force: true });
        }
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }
    }

    await delay(50);
  }
}

function renderPlantUml(source) {
  return new Promise((resolve, reject) => {
    const plantumlProcess = spawn(
      "java",
      [
        `-Dplantuml.include.path=${process.cwd()}`,
        "-Djava.awt.headless=true",
        "-jar",
        plantumlJar,
        "-pipe",
        "-tsvg",
        "-failfast2",
      ],
      { stdio: ["pipe", "pipe", "pipe"] },
    );
    const output = [];
    const errors = [];

    plantumlProcess.stdout.on("data", (chunk) => output.push(chunk));
    plantumlProcess.stderr.on("data", (chunk) => errors.push(chunk));
    plantumlProcess.on("error", reject);
    plantumlProcess.on("close", (exitCode) => {
      if (exitCode === 0 && output.length > 0) {
        resolve(Buffer.concat(output).toString("utf8"));
        return;
      }

      reject(new Error(`PlantUML exited with code ${exitCode}: ${Buffer.concat(errors).toString("utf8").trim()}`));
    });

    plantumlProcess.stdin.end(source);
  });
}

export async function renderWithCache(source) {
  const cacheKey = createHash("sha256").update(`${plantumlPackage.plantumlVersion}\0${source}`).digest("hex");
  const cachePath = path.join(cacheDirectory, `${cacheKey}.svg`);

  try {
    return await readFile(cachePath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  const lockPath = await acquireRenderLock();
  try {
    try {
      return await readFile(cachePath, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    const svg = await renderPlantUml(source);
    await mkdir(cacheDirectory, { recursive: true });
    const temporaryPath = `${cachePath}.${process.pid}.${randomUUID()}`;
    await writeFile(temporaryPath, svg);
    await rename(temporaryPath, cachePath);
    return svg;
  } finally {
    await rm(lockPath, { recursive: true, force: true });
  }
}

/**
 * Plugin for remark-js
 *
 * See details about plugin API:
 * https://github.com/unifiedjs/unified#plugin
 */
function remarkLocalPlantumlPlugin() {
  return async function transformer(syntaxTree) {
    const nodes = [];
    visit(syntaxTree, "code", (node) => {
      if (node.lang === "plantuml" && node.value) {
        nodes.push(node);
      }
    });

    await Promise.all(
      nodes.map(async (node) => {
        const svg = await renderWithCache(node.value);
        node.type = "html";
        node.value = `<div class="plantuml-diagram">${svg}</div>`;
        node.meta = undefined;
      }),
    );
  };
}

export default remarkLocalPlantumlPlugin;

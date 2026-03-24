import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { generateCssFromFile, generateCss, resolveConfig } from "../src/index.js";

const execFileAsync = promisify(execFile);
const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(TEST_DIR, "..");
const TAILWIND_CLI_PATH = path.join(PROJECT_ROOT, "node_modules", "@tailwindcss", "cli", "dist", "index.mjs");

test("e2e: Tailwind v4 compiles imported tailwind-utopia CSS", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "tailwind-utopia-e2e-"));

  await writeFile(
    path.join(cwd, "tailwind-utopia.config.js"),
    `export default {
  prefix: "e2e",
  typography: {
    baseStep: "base",
    steps: {
      base: { lineHeight: 1.5 },
      hero: { min: 42, max: 72, lineHeight: 0.95 }
    }
  },
  spacing: {
    scale: {
      sm: 1,
      md: 1.5,
      lg: 2.5
    },
    pairs: "contiguous",
    customPairs: ["sm-lg"]
  }
};
`,
    "utf8"
  );

  const generatedCss = await generateCssFromFile({ cwd });

  await writeFile(path.join(cwd, "tailwind-utopia.css"), generatedCss, "utf8");
  await mkdir(path.join(cwd, "node_modules"), { recursive: true });
  await symlink(
    path.join(PROJECT_ROOT, "node_modules", "tailwindcss"),
    path.join(cwd, "node_modules", "tailwindcss"),
    "dir"
  );
  await writeFile(
    path.join(cwd, "app.css"),
    `@import "tailwindcss";
@import "./tailwind-utopia.css";

@source inline("text-e2e-hero mt-e2e-sm gap-e2e-sm-md space-y-e2e-sm-lg");
`,
    "utf8"
  );

  await execFileAsync(process.execPath, [TAILWIND_CLI_PATH, "-i", path.join(cwd, "app.css"), "-o", path.join(cwd, "dist.css")], { cwd: PROJECT_ROOT });

  const compiled = await readFile(path.join(cwd, "dist.css"), "utf8");

  assert.match(compiled, /\.text-e2e-hero\b/);
  assert.match(compiled, /\.mt-e2e-sm\b/);
  assert.match(compiled, /\.gap-e2e-sm-md\b/);
  assert.match(compiled, /--tu-text-hero:/);
  assert.match(compiled, /--tu-space-sm-md:/);
});

test("guardrail: generated CSS stays under size budget and keeps utility structure", () => {
  const css = generateCss();
  const resolved = resolveConfig({});
  const byteSize = Buffer.byteLength(css, "utf8");
  const utilityCount = (css.match(/@utility /g) || []).length;
  const stepCount = Object.keys(resolved.typography.steps).length;
  const spacingTokenCount = Object.keys(resolved.spacing.scale).length + resolved.spacing.resolvedPairs.length + resolved.spacing.resolvedCustomPairs.length;
  const utilityKinds = Object.keys(resolved.spacing.utilities).length;
  const expectedUtilityCount = stepCount + (spacingTokenCount * utilityKinds);

  assert.equal(utilityCount, expectedUtilityCount);
  assert.ok(byteSize <= 90000, `Generated CSS is ${byteSize} bytes, above 90000-byte budget.`);
});

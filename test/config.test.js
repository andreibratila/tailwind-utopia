import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { loadUserConfig, resolveConfig } from "../src/core/config.js";

test("resolveConfig normalizes the v4-native contract", () => {
  const config = resolveConfig({
    prefix: "tu",
    typography: {
      minSize: 16,
      maxSize: 18,
      baseStep: "base",
      steps: {
        sm: 1.5,
        base: { lineHeight: 1.6 },
        lg: { lineHeight: 1.3 },
      },
    },
    spacing: {
      scale: {
        xs: 0.5,
        sm: 1,
        lg: 2,
      },
      pairs: "contiguous",
      customPairs: ["xs-lg"],
      utilities: {
        stack: "margin-block-start",
        mx: false,
      },
    },
  });

  assert.equal(config.prefix, "tu-");
  assert.deepEqual(config.spacing.resolvedPairs, [
    { from: "xs", to: "sm" },
    { from: "sm", to: "lg" },
  ]);
  assert.deepEqual(config.spacing.resolvedCustomPairs, [{ from: "xs", to: "lg" }]);
  assert.deepEqual(config.spacing.utilities.stack, ["margin-block-start"]);
  assert.deepEqual(config.spacing.utilities["-space-y"], []);
  assert.equal("mx" in config.spacing.utilities, false);
});

test("resolveConfig rejects unsupported spacing.pairs values", () => {
  assert.throws(
    () => resolveConfig({ spacing: { pairs: ["xs-sm"] } }),
    /`spacing\.pairs` must be 'contiguous' or false\./
  );
});

test("resolveConfig requires customPairs to use from-to strings", () => {
  assert.throws(
    () => resolveConfig({ spacing: { customPairs: [{ from: "xs", to: "lg" }] } }),
    /`spacing\.customPairs` entries must use the `from-to` string format\./
  );
});

test("loadUserConfig reads tailwind-utopia.config.js as the generator source of truth", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "tailwind-utopia-config-"));
  const configPath = path.join(cwd, "tailwind-utopia.config.js");

  await writeFile(
    configPath,
    `export default {
  prefix: "brand",
  output: "./styles/fluid.css",
  typography: {
    baseStep: "body",
    steps: {
      body: { lineHeight: 1.6 },
      display: { min: 40, max: 64, lineHeight: 1 }
    }
  },
  spacing: {
    scale: {
      xs: 0.5,
      sm: 1,
      lg: 2
    },
    pairs: false,
    customPairs: ["xs-lg"],
    utilities: {
      stack: ["margin-block-start"]
    }
  }
};\n`,
    "utf8"
  );

  const { config } = await loadUserConfig({ cwd });

  assert.equal(config.prefix, "brand-");
  assert.equal(config.output, "./styles/fluid.css");
  assert.deepEqual(config.spacing.resolvedPairs, []);
  assert.deepEqual(config.spacing.resolvedCustomPairs, [{ from: "xs", to: "lg" }]);
  assert.deepEqual(config.typography.steps.display, { min: 40, max: 64, lineHeight: 1 });
});

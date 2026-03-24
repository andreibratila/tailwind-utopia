import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { generateCss, generateCssFromFile } from "../src/index.js";

const execFileAsync = promisify(execFile);

test("generateCss renders text utilities, spacing utilities, and deduped pair tokens", () => {
  const css = generateCss({
    prefix: "fluid",
    typography: {
      steps: {
        sm: { lineHeight: 1.5 },
        base: { lineHeight: 1.6 },
        lg: { lineHeight: 1.3 },
      },
      baseStep: "base",
    },
    spacing: {
      scale: {
        xs: 0.5,
        sm: 1,
        lg: 2,
      },
      pairs: "contiguous",
      customPairs: ["xs-lg", "xs-lg"],
    },
  });

  assert.match(css, /:root \{/);
  assert.match(css, /@utility text-fluid-base \{/);
  assert.match(css, /@utility mt-fluid-sm \{/);
  assert.match(css, /@utility space-y-fluid-xs-lg \{/);
  assert.equal(css.match(/--tu-space-xs-lg:/g)?.length, 1);
});

test("generateCssFromFile renders importable CSS from tailwind-utopia.config.js", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "tailwind-utopia-generate-"));

  await writeFile(
    path.join(cwd, "tailwind-utopia.config.js"),
    `export default {
  prefix: "brand",
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
      xl: 3
    },
    pairs: "contiguous",
    customPairs: ["sm-xl"]
  }
};\n`,
    "utf8"
  );

  const css = await generateCssFromFile({ cwd });

  assert.match(css, /@utility text-brand-hero \{/);
  assert.match(css, /@utility gap-brand-sm-xl \{/);
  assert.match(css, /@utility -space-y-brand-sm-xl \{/);
});

test("CLI generate --stdout works with a project config", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "tailwind-utopia-cli-"));
  const cliPath = fileURLToPath(new URL("../bin/tailwind-utopia.js", import.meta.url));

  await writeFile(
    path.join(cwd, "tailwind-utopia.config.js"),
    `export default {
  prefix: "demo",
  typography: {
    baseStep: "base",
    steps: {
      base: { lineHeight: 1.5 },
      xl: { lineHeight: 1.2 }
    }
  },
  spacing: {
    scale: {
      sm: 1,
      md: 1.5
    },
    pairs: "contiguous",
    customPairs: []
  }
};\n`,
    "utf8"
  );

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "generate", "--stdout"], { cwd });

  assert.match(stdout, /@utility text-demo-base \{/);
  assert.match(stdout, /@utility gap-demo-sm-md \{/);
});

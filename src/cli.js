import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_OUTPUT_PATH, createConfigTemplate } from "./core/defaults.js";
import { loadUserConfig } from "./core/config.js";
import { renderCss } from "./render/css.js";

function printHelp() {
  console.log(`tailwind-utopia v4-native

Usage:
  tailwind-utopia generate [--config path] [--out path] [--stdout]
  tailwind-utopia config [--out path]

Examples:
  tailwind-utopia config
  tailwind-utopia generate
  tailwind-utopia generate --out ./src/styles/tailwind-utopia.css
`);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = { stdout: false };

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];

    if (arg === "--stdout") {
      options.stdout = true;
      continue;
    }

    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      options[key] = rest[index + 1];
      index += 1;
      continue;
    }

    if (arg.includes("=")) {
      const [key, value] = arg.split("=");
      if (key === "dist") {
        options.out = path.join(value, "tailwind-utopia.css");
      } else if (key === "configPath") {
        options.config = path.join(value, "tailwind-utopia.config.js");
      }
    }
  }

  return { command, options };
}

async function writeTextFile(targetPath, contents) {
  const fullPath = path.resolve(process.cwd(), targetPath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, contents, "utf8");
  return fullPath;
}

async function handleGenerate(options) {
  const { config, configPath } = await loadUserConfig({ configPath: options.config });
  const css = renderCss(config);

  if (options.stdout) {
    process.stdout.write(css);
    return;
  }

  const outputPath = options.out || config.output || DEFAULT_OUTPUT_PATH;
  const writtenTo = await writeTextFile(outputPath, css);
  const configLabel = configPath ? ` using ${path.relative(process.cwd(), configPath)}` : " using defaults";
  console.log(`Generated ${path.relative(process.cwd(), writtenTo)}${configLabel}`);
}

async function handleConfig(options) {
  const outputPath = options.out || "./tailwind-utopia.config.js";
  const writtenTo = await writeTextFile(outputPath, createConfigTemplate());
  console.log(`Created ${path.relative(process.cwd(), writtenTo)}`);
}

export async function runCli(argv = process.argv.slice(2)) {
  const { command, options } = parseArgs(argv);

  if (!command || command === "--help" || command === "-h" || command === "help") {
    printHelp();
    return;
  }

  if (command === "generate") {
    await handleGenerate(options);
    return;
  }

  if (command === "config") {
    await handleConfig(options);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFilePath) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

#!/usr/bin/env node
import { showHelp } from "../commands/help.js";
import { handleGenerate } from "../commands/generate.js";
import { handleConfig } from "../commands/config.js";
import { parseArgs } from "../utils/parseArgs.js";

// Capture arguments passed when running the script
const [command, ...args] = process.argv.slice(2);

// Handling --help global
if (command === "--help" || command === "-h") {
  showHelp();
  process.exit(0);
}

// Manejo de comandos
async function main() {
  const defaultOptions = { dist: "./", configPath: "" };

  // Parse arguments with key=value
  const options = { ...defaultOptions, ...parseArgs(args) };

  switch (command) {
    case "generate":
      await handleGenerate(options);
      break;

    case "config":
      await handleConfig(options);
      break;

    default:
      showHelp();
      process.exit(1);
  }
}

// Ejecutar el programa
main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

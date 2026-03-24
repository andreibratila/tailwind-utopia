#!/usr/bin/env node
import { runCli } from "../src/cli.js";

runCli().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

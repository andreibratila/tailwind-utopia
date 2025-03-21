import fs from "fs/promises";
import path from "path";
import defaultConfig from "../config/tailwind-utopia.config.js";

export async function handleConfig({ dist }) {
  // Location of the target directory relative to the current working directory (cwd)
  const targetDir = path.join(process.cwd(), dist);

  // Full path of the destination file, which will be copied to the target directory
  const targetPath = path.join(targetDir, "tailwind-utopia.config.json");

  try {
    // Ensure the target directory exists
    await fs.mkdir(targetDir, { recursive: true });

    // Convert the JS object to a JSON string
    const jsonString = JSON.stringify(defaultConfig, null, 2);

    // Write the JSON string to the target file
    await fs.writeFile(targetPath, jsonString);

    console.log(`✅ Configuration copied to ${targetPath}`);
  } catch (error) {
    console.error("❌ Error copying configuration file:", error);
    process.exit(2);
  }
}

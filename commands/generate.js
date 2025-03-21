import path from "path";
import generateCSS from "../utils/generateCss.js";
import fs from "fs/promises";

export async function handleGenerate({ dist, configPath }) {
  let newConfig = {};
  let fileUrl = "";

  if (configPath) {
    try {
      const fullPath = path.resolve(
        process.cwd(),
        configPath,
        "tailwind-utopia.config.json"
      );
      fileUrl = `file://${fullPath}`;
      // Importar el archivo dinámicamente
      const configModule = await import(fileUrl, { with: { type: "json" } });
      newConfig = configModule.default;

      // Aquí puedes acceder a las propiedades del objeto exportado
    } catch (error) {
      console.error("❌ Failed to import the configuration file:");
      console.info("ℹ️ Path provided:", configPath);
      console.info("ℹ️ Resolved full path:", fileUrl);
      console.error("Error details:", error);
      process.exit(2);
    }
  }
  console.log(newConfig);
  const css = generateCSS(newConfig);

  try {
    // Location of the target directory relative to the current working directory (cwd)
    const targetDir = path.join(process.cwd(), dist);

    // Full path of the destination file, which will be copied to the target directory
    const targetPath = path.join(targetDir, "tailwind-utopia.css");

    // Ensure the target directory exists
    await fs.mkdir(targetDir, { recursive: true });

    // Write the CSS to the target file
    await fs.writeFile(targetPath, css);
    console.log(`✅ CSS file generated at ${dist}/tailwind-utopia.css`);
  } catch (error) {
    console.error("❌ Error generating css file:", error);
    process.exit(2);
  }
}

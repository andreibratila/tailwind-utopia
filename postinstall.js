import path from "path";
import fs from "fs/promises";

const packageJsonPath = path.join(process.cwd(), "package.json");

let isDevDependency = false;

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  isDevDependency =
    packageJson.devDependencies &&
    packageJson.devDependencies["@andreibratila/tailwind-utopia"];
} catch (error) {
  // Si no se puede leer package.json, asumimos que no es devDependency
}

if (!isDevDependency) {
  console.log(
    "\x1b[33m%s\x1b[0m",
    "⚠️  It is recommended to install this package as a devDependency: npm install --save-dev @andreibratila/tailwind-utopia"
  );
}

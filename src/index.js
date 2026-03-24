import { loadUserConfig, resolveConfig } from "./core/config.js";
import { renderCss } from "./render/css.js";

export { loadUserConfig, resolveConfig };

export function defineConfig(config) {
  return config;
}

export function generateCss(userConfig = {}) {
  return renderCss(resolveConfig(userConfig));
}

export async function generateCssFromFile(options = {}) {
  const { config } = await loadUserConfig(options);
  return renderCss(config);
}

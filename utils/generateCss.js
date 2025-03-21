import defaultConfig from "../config/tailwind-utopia.config.js";
import { generateUtopiaCSS } from "../lib/generator.js";

export function generateCSS(config = {}) {
  const configSended = Object.keys(config).length > 0 ? config : defaultConfig;

  return generateUtopiaCSS(configSended);
}

// For backwards compatibility
export default generateCSS;

import { calcValue } from "../utils/utils.js";

export function generateTextStyles(config) {
  // Generate custom properties for each size
  const themeText = customProperties(config);

  // Generate utility classes
  const cssText = sizes(config.utopia.fontSize, config.prefix);

  return { cssText, themeText };
}
function customProperties(config) {
  const { utopia, baseKey } = config;
  let themeText = "";
  Object.keys(utopia.fontSize).forEach((name) => {
    let [min, max] = minMax(name, utopia, baseKey);

    min = typeof min.toFixed === "function" ? min.toFixed(2) : min;
    max = typeof max.toFixed === "function" ? max.toFixed(2) : max;

    themeText += `
    --f-${name}-min: ${min.toString()};
    --f-${name}-max: ${max.toString()};
    --f-${name}: ${calcValue(`var(--f-${name}-min)`, `var(--f-${name}-max)`)};`;
  });
  return themeText;
}

function sizes(fontSize, prefix) {
  let cssText = "";

  Object.entries(fontSize).forEach(([name, value]) => {
    const lineHeight = typeof value === "object" ? value.lineHeight : value;
    cssText += `
@utility text-${prefix}${name} {
  font-size: var(--f-${name});
  line-height: ${lineHeight};
}
`;
  });
  return cssText;
}

function minMax(name, utopia, baseKey) {
  // const { utopia, baseKey } = config;
  const { fontSize, minSize, maxSize, minScale, maxScale } = utopia;
  const { min: customMin, max: customMax } = fontSize[name];

  const names = Object.keys(fontSize);
  const baseIndex = names.indexOf(baseKey);
  const step = names.indexOf(name) - baseIndex;
  const absStep = Math.abs(step);

  let min = minSize;
  let max = maxSize;

  if (step !== 0) {
    const minFactor = Math.pow(minScale, absStep);
    const maxFactor = Math.pow(maxScale, absStep);

    if (step < 0) {
      min = minSize / minFactor;
      max = maxSize / maxFactor;
    } else {
      min = minSize * minFactor;
      max = maxSize * maxFactor;
    }
  }

  return [customMin || min, customMax || max];
}

import { access } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  DEFAULT_CONFIG_FILE,
  DEFAULT_SPACING_UTILITIES,
  defaultConfig,
} from "./defaults.js";
import { getContiguousPairs } from "./math.js";

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeObjects(base, override) {
  const result = { ...base };

  for (const [key, value] of Object.entries(override || {})) {
    if (isPlainObject(value) && isPlainObject(base[key])) {
      result[key] = mergeObjects(base[key], value);
      continue;
    }

    result[key] = value;
  }

  return result;
}

function normalizePrefix(prefix) {
  if (!prefix) {
    return "";
  }

  const normalized = `${prefix}`.trim();

  if (!normalized) {
    return "";
  }

  return normalized.endsWith("-") ? normalized : `${normalized}-`;
}

function normalizeStepConfig(step) {
  if (!isPlainObject(step)) {
    return { lineHeight: step };
  }

  return {
    min: step.min,
    max: step.max,
    lineHeight: step.lineHeight ?? 1.5,
  };
}

function assertFiniteNumber(value, fieldName) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`\`${fieldName}\` must be a finite number.`);
  }
}

function assertPositiveNumber(value, fieldName) {
  assertFiniteNumber(value, fieldName);

  if (value <= 0) {
    throw new Error(`\`${fieldName}\` must be greater than 0.`);
  }
}

function normalizeUtilityProperties(value, utilityName) {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value) && value.every((property) => typeof property === "string" && property.trim())) {
    return value;
  }

  throw new Error(`\`spacing.utilities.${utilityName}\` must be a string or an array of strings.`);
}

function normalizeUtilities(utilities) {
  const normalized = {};

  for (const [utilityName, value] of Object.entries(utilities || {})) {
    normalized[utilityName] = normalizeUtilityProperties(value, utilityName);
  }

  return normalized;
}

function resolveUtilities(defaultUtilities, userUtilities) {
  const resolved = normalizeUtilities(defaultUtilities);

  for (const [utilityName, value] of Object.entries(userUtilities || {})) {
    if (value === false || value == null) {
      delete resolved[utilityName];
      continue;
    }

    resolved[utilityName] = normalizeUtilityProperties(value, utilityName);
  }

  return resolved;
}

function normalizePair(pair) {
  if (typeof pair === "string" && pair.includes("-")) {
    const [from, to] = pair.split("-");
    return { from, to };
  }

  throw new Error("`spacing.customPairs` entries must use the `from-to` string format.");
}

function normalizePairs(configuredPairs, scaleKeys) {
  if (configuredPairs === "contiguous" || configuredPairs == null) {
    return getContiguousPairs(scaleKeys);
  }

  if (configuredPairs === false) {
    return [];
  }

  throw new Error("`spacing.pairs` must be 'contiguous' or false.");
}

function assertKeysExist(pairs, allowedKeys, fieldName) {
  for (const pair of pairs) {
    if (!allowedKeys.includes(pair.from) || !allowedKeys.includes(pair.to)) {
      throw new Error(`Invalid spacing pair in ${fieldName}: ${pair.from}-${pair.to}`);
    }
  }
}

export function resolveConfig(userConfig = {}) {
  const merged = mergeObjects(defaultConfig, userConfig);

  if (userConfig.typography?.steps) {
    merged.typography.steps = userConfig.typography.steps;
  }

  if (userConfig.spacing?.scale) {
    merged.spacing.scale = userConfig.spacing.scale;
  }

  const steps = Object.fromEntries(
    Object.entries(merged.typography.steps).map(([name, step]) => [name, normalizeStepConfig(step)])
  );
  const stepKeys = Object.keys(steps);

  if (!stepKeys.length) {
    throw new Error("`typography.steps` must contain at least one step.");
  }

  if (!stepKeys.includes(merged.typography.baseStep)) {
    throw new Error(`Base step '${merged.typography.baseStep}' is missing from typography.steps.`);
  }

  assertPositiveNumber(merged.typography.minWidth, "typography.minWidth");
  assertPositiveNumber(merged.typography.maxWidth, "typography.maxWidth");
  assertPositiveNumber(merged.typography.minSize, "typography.minSize");
  assertPositiveNumber(merged.typography.maxSize, "typography.maxSize");
  assertPositiveNumber(merged.typography.minScale, "typography.minScale");
  assertPositiveNumber(merged.typography.maxScale, "typography.maxScale");

  if (merged.typography.minWidth >= merged.typography.maxWidth) {
    throw new Error("`typography.minWidth` must be lower than `typography.maxWidth`.");
  }

  if (merged.typography.minSize > merged.typography.maxSize) {
    throw new Error("`typography.minSize` must be lower than or equal to `typography.maxSize`.");
  }

  for (const [name, step] of Object.entries(steps)) {
    assertPositiveNumber(step.lineHeight, `typography.steps.${name}.lineHeight`);

    if (step.min != null) {
      assertPositiveNumber(step.min, `typography.steps.${name}.min`);
    }

    if (step.max != null) {
      assertPositiveNumber(step.max, `typography.steps.${name}.max`);
    }

    if (step.min != null && step.max != null && step.min > step.max) {
      throw new Error(`\`typography.steps.${name}.min\` must be lower than or equal to \`typography.steps.${name}.max\`.`);
    }
  }

  const scaleKeys = Object.keys(merged.spacing.scale);

  if (!scaleKeys.length) {
    throw new Error("`spacing.scale` must contain at least one token.");
  }

  for (const [name, value] of Object.entries(merged.spacing.scale)) {
    assertPositiveNumber(value, `spacing.scale.${name}`);
  }

  const resolvedPairs = normalizePairs(merged.spacing.pairs, scaleKeys);
  const resolvedCustomPairs = (merged.spacing.customPairs || [])
    .map(normalizePair);

  assertKeysExist(resolvedPairs, scaleKeys, "spacing.pairs");
  assertKeysExist(resolvedCustomPairs, scaleKeys, "spacing.customPairs");

  return {
    ...merged,
    prefix: normalizePrefix(merged.prefix),
    typography: {
      ...merged.typography,
      steps,
    },
    spacing: {
      ...merged.spacing,
      utilities: resolveUtilities(DEFAULT_SPACING_UTILITIES, merged.spacing.utilities || {}),
      resolvedPairs,
      resolvedCustomPairs,
    },
  };
}

export async function resolveConfigPath({ cwd = process.cwd(), configPath } = {}) {
  if (configPath) {
    return path.resolve(cwd, configPath);
  }

  const candidates = [DEFAULT_CONFIG_FILE, "tailwind-utopia.config.mjs", "tailwind-utopia.config.cjs"];

  for (const candidate of candidates) {
    const fullPath = path.resolve(cwd, candidate);

    try {
      await access(fullPath);
      return fullPath;
    } catch {
      // Keep looking.
    }
  }

  return null;
}

export async function loadUserConfig(options = {}) {
  const configPath = await resolveConfigPath(options);

  if (!configPath) {
    return { config: resolveConfig(), configPath: null };
  }

  const imported = await import(pathToFileURL(configPath).href);
  const config = imported.default ?? imported;
  return { config: resolveConfig(config), configPath };
}

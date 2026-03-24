import { createClampExpression, getOrderedSteps, getStepValue } from "../core/math.js";

function indent(lines, prefix = "  ") {
  return lines.map((line) => `${prefix}${line}`).join("\n");
}

function createRootBlock(config, runtimeVariables) {
  const { minWidth, maxWidth } = config.typography;
  const declarations = [
    `--tu-min-width: ${minWidth};`,
    `--tu-max-width: ${maxWidth};`,
    "--tu-fluid-screen: 100vw;",
    "--tu-fluid-bp: calc((var(--tu-fluid-screen) - (var(--tu-min-width) / 16) * 1rem) / (var(--tu-max-width) - var(--tu-min-width)));",
    ...runtimeVariables,
  ];

  return [
    ":root {",
    indent(declarations),
    "}",
    "",
    `@media (max-width: ${minWidth}px) {`,
    indent([":root {", indent(["--tu-fluid-screen: calc(var(--tu-min-width) * 1px);"]), "}"]),
    "}",
    "",
    `@media (min-width: ${maxWidth}px) {`,
    indent([":root {", indent(["--tu-fluid-screen: calc(var(--tu-max-width) * 1px);"]), "}"]),
    "}",
  ].join("\n");
}

function renderText(config) {
  const stepEntries = Object.entries(config.typography.steps);
  const stepKeys = getOrderedSteps(config.typography.steps);
  const baseIndex = stepKeys.indexOf(config.typography.baseStep);
  const runtimeVariables = [];
  const utilities = [];

  for (const [index, [name, stepConfig]] of stepEntries.entries()) {
    const generated = getStepValue({
      stepIndex: index,
      baseIndex,
      minSize: config.typography.minSize,
      maxSize: config.typography.maxSize,
      minScale: config.typography.minScale,
      maxScale: config.typography.maxScale,
    });

    const min = stepConfig.min ?? generated.min;
    const max = stepConfig.max ?? generated.max;
    const variableName = `--tu-text-${name}`;
    runtimeVariables.push(`${variableName}: ${createClampExpression(min, max)};`);
    utilities.push([
      `@utility text-${config.prefix}${name} {`,
      indent([`font-size: var(${variableName});`, `line-height: ${stepConfig.lineHeight};`]),
      "}",
    ].join("\n"));
  }

  return { runtimeVariables, utilities };
}

function renderSpaceUtility(name, token, value) {
  if (name === "space-x" || name === "-space-x") {
    const cssValue = name.startsWith("-") ? `calc(${value} * -1)` : value;
    return [
      `@utility ${name}-${token} {`,
      indent([
        ":where(& > :not(:last-child)) {",
        indent([
          "--tw-space-x-reverse: 0;",
          `margin-inline-start: calc(${cssValue} * var(--tw-space-x-reverse));`,
          `margin-inline-end: calc(${cssValue} * (1 - var(--tw-space-x-reverse)));`,
        ]),
        "}",
      ]),
      "}",
    ].join("\n");
  }

  const cssValue = name.startsWith("-") ? `calc(${value} * -1)` : value;
  return [
    `@utility ${name}-${token} {`,
    indent([
      ":where(& > :not(:last-child)) {",
      indent([
        "--tw-space-y-reverse: 0;",
        `margin-block-start: calc(${cssValue} * (1 - var(--tw-space-y-reverse)));`,
        `margin-block-end: calc(${cssValue} * var(--tw-space-y-reverse));`,
      ]),
      "}",
    ]),
    "}",
  ].join("\n");
}

function renderSpacing(config) {
  if (!config.spacing.enabled) {
    return { runtimeVariables: [], utilities: [] };
  }

  const runtimeVariables = [];
  const utilities = [];
  const scale = config.spacing.scale;
  const pairs = [...config.spacing.resolvedPairs, ...config.spacing.resolvedCustomPairs];
  const pairTokens = new Set();

  for (const [name, multiplier] of Object.entries(scale)) {
    runtimeVariables.push(`--tu-space-${name}: ${createClampExpression(config.typography.minSize * multiplier, config.typography.maxSize * multiplier)};`);
  }

  for (const pair of pairs) {
    const key = `${pair.from}-${pair.to}`;
    if (pairTokens.has(key)) {
      continue;
    }

    pairTokens.add(key);
    runtimeVariables.push(`--tu-space-${key}: ${createClampExpression(config.typography.minSize * scale[pair.from], config.typography.maxSize * scale[pair.to])};`);
  }

  const tokens = [
    ...Object.keys(scale).map((name) => ({ name, variable: `var(--tu-space-${name})` })),
    ...Array.from(pairTokens).map((name) => ({ name, variable: `var(--tu-space-${name})` })),
  ];

  for (const token of tokens) {
    const classToken = `${config.prefix}${token.name}`;

    for (const [utilityName, properties] of Object.entries(config.spacing.utilities)) {
      if (utilityName === "space-x" || utilityName === "space-y" || utilityName === "-space-x" || utilityName === "-space-y") {
        utilities.push(renderSpaceUtility(utilityName, classToken, token.variable));
        continue;
      }

      const value = utilityName.startsWith("-") ? `calc(${token.variable} * -1)` : token.variable;
      utilities.push([
        `@utility ${utilityName}-${classToken} {`,
        indent(properties.map((property) => `${property}: ${value};`)),
        "}",
      ].join("\n"));
    }
  }

  return { runtimeVariables, utilities };
}

export function renderCss(config) {
  const text = renderText(config);
  const spacing = renderSpacing(config);
  const rootBlock = createRootBlock(config, [...text.runtimeVariables, ...spacing.runtimeVariables]);

  return [
    "/* tailwind-utopia v4-native */",
    rootBlock,
    "",
    ...text.utilities,
    "",
    ...spacing.utilities,
    "",
  ].join("\n");
}

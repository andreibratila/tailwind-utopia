import { pair, calcValue } from "../utils/utils.js";
import spacingConfig from "../config/spacing-config.js";

export function generateSpacingStyles(config) {
  const { prefix, utopia } = config;
  const { minSize, maxSize, spacing } = utopia;

  // Ordenamos los valores de spacing para crear los pares correctamente
  const orderedSpacings = Object.entries(spacing).sort((a, b) => a[1] - b[1]);

  // Generamos clases para tamaños individuales
  const tShirts = orderedSpacings.map(([size, multiplier]) => {
    const value = calcValue(minSize * multiplier, maxSize * multiplier);

    return Object.entries(spacingConfig)
      .map(([group, groupUtilities]) =>
        Object.entries(groupUtilities)
          .map(([className, properties]) => {
            const negative = className.startsWith("-");
            const cssValue = negative ? `calc(${value} * -1)` : value;
            if (group === "border") {
              return `
@utility ${className}-${prefix}${size} {
  --tw-border-spacing-x: ${cssValue};
  --tw-border-spacing-y: ${cssValue};
  border-spacing: var(--tw-border-spacing-x) var(--tw-border-spacing-y);
}
`;
            } else if (group === "space") {
              const xy = className.includes("x") ? "x" : "y";
              return `
@utility ${className}-${prefix}${size} {
  :where(& > :not(:last-child)) {
    --tw-space-${xy}-reverse: 0;
    ${
      className.includes("x")
        ? `
    margin-inline-start: calc(${cssValue} * var(--tw-space-x-reverse));
    margin-inline-end:   calc(${cssValue} * (1 - var(--tw-space-x-reverse)));`
        : `
    margin-block-start: calc(${cssValue} * var(--tw-space-y-reverse));
    margin-block-end: calc(${cssValue} * (1 - var(--tw-space-y-reverse)));`
    }
  }
}
`;
            } else {
              return `
@utility ${className}-${prefix}${size} {
  ${properties.map((prop) => `${prop}: ${cssValue};`).join("\n  ")}
}
`;
            }
          })
          .join("")
      )
      .join("");
  });

  // Generamos clases para pares de tamaños
  const orderedKeys = orderedSpacings.map(([key]) => key);
  const pairs = pair(orderedKeys).map(([start, end]) => {
    const value = calcValue(minSize * spacing[start], maxSize * spacing[end]);

    return Object.entries(spacingConfig)
      .map(([group, groupUtilities]) =>
        Object.entries(groupUtilities)
          .map(([className, properties]) => {
            const negative = className.startsWith("-");
            const cssValue = negative ? `calc(${value} * -1)` : value;

            if (group === "border") {
              return `
@utility ${className}-${prefix}${start}-${end} {
  --tw-border-spacing-x: ${cssValue};
  --tw-border-spacing-y: ${cssValue};
  border-spacing: var(--tw-border-spacing-x) var(--tw-border-spacing-y);
}
`;
            } else if (group === "space") {
              const xy = className.includes("x") ? "x" : "y";
              return `
@utility ${className}-${prefix}${start}-${end} {
  :where(& > :not(:last-child)) {
    --tw-space-${xy}-reverse: 0;
    ${
      className.includes("x")
        ? `
    margin-inline-start: calc(${cssValue} * var(--tw-space-x-reverse));
    margin-inline-end: calc(${cssValue} * (1 - var(--tw-space-x-reverse)));`
        : `
    margin-block-start: calc(${cssValue} * (1 - var(--tw-space-y-reverse)));
    margin-block-end: calc(${cssValue} * var(--tw-space-y-reverse));`
    }
  }
}
`;
            } else {
              return `
@utility ${className}-${prefix}${start}-${end} {
  ${properties.map((prop) => `${prop}: ${cssValue};`).join("\n  ")}
}
`;
            }
          })
          .join("")
      )
      .join("");
  });

  return { cssSpacing: tShirts.join("") + pairs.join("") };
}

import { pair, calcValue } from "../utils/utils.js";
import spacingConfig from "../config/spacing-config.js";

export function generateSpacingStyles(config) {
  const { prefix, utopia } = config;
  const { minSize, maxSize, spacing } = utopia;

  let cssSpacing = "";

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
              const isNegative = className.startsWith("-");
              const xy = className.includes("x") ? "x" : "y";
              const baseValue = isNegative
                ? `calc(${cssValue} * -1)`
                : cssValue;

              return `
@utility ${className}-${prefix}${size} {
  :where(& > :not(:last-child)) {
    --tw-space-${xy}-reverse: 0;
    ${
      className.includes("x")
        ? `
    margin-inline-start: calc(${baseValue} * var(--tw-space-x-reverse));
    margin-inline-end: calc(${baseValue} * (1 - var(--tw-space-x-reverse)));`
        : `
    margin-block-start: calc(${baseValue} * (1 - var(--tw-space-y-reverse)));
    margin-block-end: calc(${baseValue} * var(--tw-space-y-reverse));`
    }
  }
}
`;
            } else if (group === "slide") {
              return properties
                .map((prop) => {
                  const needsNegativeCalc =
                    className.includes("left") || className.includes("top");
                  // Aseguramos que el valor de baseValue sea negativo cuando sea necesario
                  const baseValue = needsNegativeCalc
                    ? `calc(${cssValue} * -1)` // Aplica el negativo cuando es "left" o "top"
                    : cssValue; // Usa el valor normal en caso contrario

                  return `
@utility ${className}-${prefix}${size} {
  ${prop}: ${baseValue};
}
`;
                })
                .join("\n");
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
              const isNegative = className.startsWith("-");
              const baseValue = isNegative
                ? `calc(${cssValue} * -1)`
                : cssValue;

              return `
@utility ${className}-${prefix}${start}-${end} {
  :where(& > :not(:last-child)) {
    --tw-${className}-reverse: 0;
    ${
      className.includes("x")
        ? `
    margin-inline-start: calc(${baseValue} * var(--tw-space-x-reverse));
    margin-inline-end: calc(${baseValue} * (1 - var(--tw-space-x-reverse)));`
        : `
    margin-block-start: calc(${baseValue} * (1 - var(--tw-space-y-reverse)));
    margin-block-end: calc(${baseValue} * var(--tw-space-y-reverse));`
    }
  }
}
`;
            } else if (group === "slide") {
              return properties
                .map((prop) => {
                  const needsNegativeCalc =
                    className.includes("left") || className.includes("top");

                  // Calculamos el valor de CSS con signo negativo si es necesario
                  const baseValue = needsNegativeCalc
                    ? `calc(${cssValue} * -1)`
                    : cssValue;

                  // Aplica las reglas con los valores de start y end
                  return `
@utility ${className}-${prefix}${start}-${end} {
  ${prop}: ${baseValue};
}
`;
                })
                .join("\n");
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

  cssSpacing += tShirts.join("") + pairs.join("");

  return { cssSpacing };
}

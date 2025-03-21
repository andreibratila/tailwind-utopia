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
              .${className}-${prefix}${size} {
                --tw-border-spacing-x: ${cssValue};
                --tw-border-spacing-y: ${cssValue};
                border-spacing: var(--tw-border-spacing-x) var(--tw-border-spacing-y);
              }`;
            } else if (group === "space") {
              const isNegative = className.startsWith("-");
              const baseValue = isNegative
                ? `calc(${cssValue} * -1)`
                : cssValue;

              return `
              .${className}-${prefix}${size} > :not([hidden]) ~ :not([hidden]) {
                --tw-${className}-reverse: 0;
                ${
                  className.includes("x")
                    ? `
                margin-right: calc(${baseValue} * var(--tw-${className}-reverse));
                margin-left: calc(${baseValue} * (1 - var(--tw-${className}-reverse)));`
                    : `
                margin-top: calc(${baseValue} * (1 - var(--tw-${className}-reverse)));
                margin-bottom: calc(${baseValue} * var(--tw-${className}-reverse));`
                }
              }`;
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
        .${className}-${prefix}${size} {
          ${prop}: ${baseValue};
        }`;
                })
                .join("\n");
            } else {
              return `
            .${className}-${prefix}${size} {
              ${properties.map((prop) => `${prop}: ${cssValue};`).join("\n  ")}
            }`;
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
              .${className}-${prefix}${start}-${end} {
                --tw-border-spacing-x: ${cssValue};
                --tw-border-spacing-y: ${cssValue};
                border-spacing: var(--tw-border-spacing-x) var(--tw-border-spacing-y);
              }`;
            } else if (group === "space") {
              const isNegative = className.startsWith("-");
              const baseValue = isNegative
                ? `calc(${cssValue} * -1)`
                : cssValue;

              return `
              .${className}-${prefix}${start}-${end} > :not([hidden]) ~ :not([hidden]) {
                --tw-${className}-reverse: 0;
                ${
                  className.includes("x")
                    ? `
                margin-right: calc(${baseValue} * var(--tw-${className}-reverse));
                margin-left: calc(${baseValue} * (1 - var(--tw-${className}-reverse)));`
                    : `
                margin-top: calc(${baseValue} * (1 - var(--tw-${className}-reverse)));
                margin-bottom: calc(${baseValue} * var(--tw-${className}-reverse));`
                }
              }`;
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
                  return `.${className}-${prefix}${start}-${end} {
                  ${prop}: ${baseValue};
                }`;
                })
                .join("\n");
            } else {
              return `
            .${className}-${prefix}${start}-${end} {
              ${properties.map((prop) => `${prop}: ${cssValue};`).join("\n  ")}
            }`;
            }
          })
          .join("")
      )
      .join("");
  });

  cssSpacing += tShirts.join("") + pairs.join("");

  return { cssSpacing };
}

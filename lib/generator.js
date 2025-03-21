import { generateTextStyles } from "./text.js";
import { generateSpacingStyles } from "./spacing.js";

export function generateUtopiaCSS(config) {
  const { minWidth, maxWidth } = config.utopia;
  const { cssSpacing } = generateSpacingStyles(config);
  const { cssText, themeText } = generateTextStyles(config);
  // Generate root custom properties
  let css = `
/* Utopia Fluid Responsive CSS */
@layer {
  :root {
    --fluid-min-width: ${minWidth.toString()};
    --fluid-max-width: ${maxWidth.toString()};

    --fluid-screen: 100vw;
    --fluid-bp: calc(
      (var(--fluid-screen) - var(--fluid-min-width) / 16 * 1rem) /
      (var(--fluid-max-width) - var(--fluid-min-width))
    );
  }
  
  @media (min-width: ${maxWidth}px) {
    :root {
      --fluid-screen: calc(var(--fluid-max-width) * 1px);
    }
  }
}

/* Text Styles */
@theme {
  ${themeText}
}
@layer utilities {
  ${cssText}
}

/* Spacing Utilities */

@layer utilities {
  ${cssSpacing}
}
`;

  return css;
}
// @theme {
//   ${themeSpacing}
// }

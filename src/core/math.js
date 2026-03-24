function round(value, decimals = 4) {
  return Number(value.toFixed(decimals));
}

export function pxToRem(value) {
  return round(value / 16);
}

export function createClampExpression(minPx, maxPx) {
  return `calc(${pxToRem(minPx)}rem + ${round(maxPx - minPx)} * var(--tu-fluid-bp))`;
}

export function getOrderedSteps(steps) {
  return Object.keys(steps);
}

export function getStepValue({ stepIndex, baseIndex, minSize, maxSize, minScale, maxScale }) {
  const offset = stepIndex - baseIndex;

  if (offset === 0) {
    return { min: minSize, max: maxSize };
  }

  const direction = offset < 0 ? -1 : 1;
  const exponent = Math.abs(offset);
  const minFactor = minScale ** exponent;
  const maxFactor = maxScale ** exponent;

  if (direction < 0) {
    return {
      min: round(minSize / minFactor),
      max: round(maxSize / maxFactor),
    };
  }

  return {
    min: round(minSize * minFactor),
    max: round(maxSize * maxFactor),
  };
}

export function getContiguousPairs(keys) {
  return keys.slice(0, -1).map((from, index) => ({ from, to: keys[index + 1] }));
}

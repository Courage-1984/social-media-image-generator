/**
 * CSS Filter Solver
 * Calculates optimal CSS filter values to match a target hex color
 * Based on the algorithm from https://codepen.io/sosuke/pen/Pjoqqp
 */

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color string (with or without #)
 * @returns {number[]} RGB values [r, g, b] in 0-255 range
 */
function hexToRgb(hex) {
  if (typeof hex !== 'string') {
    return [0, 0, 0];
  }

  hex = hex.replace('#', '');

  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  if (hex.length !== 6) {
    return [0, 0, 0];
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return [r, g, b];
}

/**
 * Color class for RGB manipulation
 */
class Color {
  constructor(r, g, b) {
    this.r = this.clamp(r);
    this.g = this.clamp(g);
    this.b = this.clamp(b);
  }

  clamp(value) {
    if (value > 255) {
      value = 255;
    } else if (value < 0) {
      value = 0;
    }
    return value;
  }

  /**
   * Apply CSS filter to this color
   * @param {Object} filters - Filter values
   * @returns {Color} New color after filter application
   */
  applyFilters(filters) {
    let r = this.r;
    let g = this.g;
    let b = this.b;

    // Apply invert
    if (filters.invert !== undefined) {
      r = 255 - (r - 255) * filters.invert;
      g = 255 - (g - 255) * filters.invert;
      b = 255 - (b - 255) * filters.invert;
    }

    // Apply sepia
    if (filters.sepia !== undefined) {
      const tr = 0.393 * r + 0.769 * g + 0.189 * b;
      const tg = 0.349 * r + 0.686 * g + 0.168 * b;
      const tb = 0.272 * r + 0.534 * g + 0.131 * b;
      r = tr * filters.sepia + r * (1 - filters.sepia);
      g = tg * filters.sepia + g * (1 - filters.sepia);
      b = tb * filters.sepia + b * (1 - filters.sepia);
    }

    // Apply saturate
    if (filters.saturate !== undefined) {
      const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
      r = gray + (r - gray) * filters.saturate;
      g = gray + (g - gray) * filters.saturate;
      b = gray + (b - gray) * filters.saturate;
    }

    // Apply hue-rotate (expects degrees, converts to radians internally)
    if (filters.hueRotate !== undefined) {
      const angle = (filters.hueRotate * Math.PI) / 180; // Convert degrees to radians
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      const tr = 0.213 * r + 0.715 * g + 0.072 * b;
      const tg = 0.213 * r + 0.715 * g + 0.072 * b;
      const tb = 0.213 * r + 0.715 * g + 0.072 * b;
      r = tr + cos * (0.787 * r - 0.715 * g - 0.072 * b) - sin * (0.213 * r - 0.715 * g + 0.928 * b);
      g = tg + sin * (0.213 * r - 0.715 * g - 0.072 * b) + cos * (0.213 * r - 0.715 * g + 0.928 * b);
      b = tb - sin * (0.213 * r - 0.715 * g - 0.072 * b) - cos * (0.213 * r - 0.715 * g + 0.928 * b);
    }

    // Apply brightness
    if (filters.brightness !== undefined) {
      r *= filters.brightness;
      g *= filters.brightness;
      b *= filters.brightness;
    }

    // Apply contrast
    if (filters.contrast !== undefined) {
      r = (r - 127.5) * filters.contrast + 127.5;
      g = (g - 127.5) * filters.contrast + 127.5;
      b = (b - 127.5) * filters.contrast + 127.5;
    }

    return new Color(r, g, b);
  }

  /**
   * Calculate HSL values for this color
   * @returns {Object} HSL values {h, s, l} in 0-100 range
   */
  hsl() {
    const r = this.r / 255;
    const g = this.g / 255;
    const b = this.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: h * 100,
      s: s * 100,
      l: l * 100,
    };
  }

  /**
   * Calculate color difference (loss) from target
   * @param {Color} target - Target color
   * @returns {number} Loss value (lower is better)
   */
  loss(target) {
    const dr = this.r - target.r;
    const dg = this.g - target.g;
    const db = this.b - target.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }
}

/**
 * Solver class to find optimal filter values
 */
class Solver {
  constructor(target) {
    this.target = target;
    this.targetR = target.r;
    this.targetG = target.g;
    this.targetB = target.b;
    // Calculate target HSL for more accurate color matching
    this.targetHSL = target.hsl();
  }

  /**
   * Solve for optimal filter values
   * @returns {Object} Result with filter values and loss
   */
  solve() {
    const result = this.solveNarrow(this.solveWide());
    return {
      loss: result.loss,
      filter: this.css(result.values),
      values: result.values,
    };
  }

  /**
   * Wide search for initial solution
   * @returns {Object} Initial filter values
   */
  solveWide() {
    const A = 5;
    const c = 15;
    const a = [60, 180, 18000, 600, 1.2, 1.2];

    let best = { loss: Infinity };
    for (let i = 0; best.loss > 25 && i < 3; i++) {
      const initial = [50, 20, 3750, 50, 100, 100];
      const result = this.spsa(A, a, c, initial, 1000);
      if (result.loss < best.loss) {
        best = result;
      }
    }
    return best;
  }

  /**
   * Narrow search to refine solution
   * @param {Object} wide - Initial solution from wide search
   * @returns {Object} Refined filter values
   */
  solveNarrow(wide) {
    const A = wide.loss;
    const c = 2;
    const A1 = A + 1;
    const a = [0.25 * A1, 0.25 * A1, A1, 0.25 * A1, 0.2 * A1, 0.2 * A1];
    return this.spsa(A, a, c, wide.values, 500);
  }

  /**
   * Simultaneous Perturbation Stochastic Approximation (SPSA) algorithm
   * @param {number} A - Initial step size
   * @param {number[]} a - Step size parameters
   * @param {number} c - Perturbation size
   * @param {number[]} values - Initial values
   * @param {number} iterations - Number of iterations
   * @returns {Object} Best result
   */
  spsa(A, a, c, values, iterations) {
    const alpha = 1;
    const gamma = 0.16666666666666666;

    let best = null;
    let bestLoss = Infinity;
    const deltas = new Array(6);
    const high = new Array(6);
    const low = new Array(6);

    for (let k = 0; k < iterations; k++) {
      const ck = c / Math.pow(k + 1, gamma);
      for (let i = 0; i < 6; i++) {
        deltas[i] = Math.random() > 0.5 ? 1 : -1;
        high[i] = values[i] + ck * deltas[i];
        low[i] = values[i] - ck * deltas[i];
      }

      const lossDiff = this.loss(high) - this.loss(low);
      for (let i = 0; i < 6; i++) {
        const g = lossDiff / (2 * ck * deltas[i]);
        const ak = a[i] / Math.pow(A + k + 1, alpha);
        values[i] = this.fix(values[i] - ak * g, i);
      }

      const loss = this.loss(values);
      if (loss < bestLoss) {
        best = values.slice(0);
        bestLoss = loss;
      }
    }
    return { values: best, loss: bestLoss };
  }

  /**
   * Fix value to valid range
   * @param {number} value - Value to fix
   * @param {number} idx - Index (0-5)
   * @returns {number} Fixed value
   */
  fix(value, idx) {
    let max = 100;
    if (idx === 2) {
      // saturate
      max = 7500;
    } else if (idx === 4 || idx === 5) {
      // brightness, contrast
      max = 200;
    }

    if (idx === 3) {
      // hue-rotate
      if (value > max) {
        value = value % max;
      } else if (value < 0) {
        value = max + (value % max);
      }
    } else if (value < 0) {
      value = 0;
    } else if (value > max) {
      value = max;
    }
    return value;
  }

  /**
   * Calculate loss for given filter values
   * @param {number[]} values - Filter values [invert, sepia, saturate, hueRotate, brightness, contrast] (all as percentages 0-100)
   * @returns {number} Loss value
   */
  loss(values) {
    // Start with white (255, 255, 255) - our logo is white
    const color = new Color(255, 255, 255);
    const filters = {
      invert: values[0] / 100,
      sepia: values[1] / 100,
      saturate: values[2] / 100,
      hueRotate: values[3] * 3.6, // Convert percentage (0-100) to degrees (0-360)
      brightness: values[4] / 100,
      contrast: values[5] / 100,
    };
    const result = color.applyFilters(filters);

    // Calculate HSL for result color
    const resultHSL = result.hsl();

    // Combined RGB + HSL loss for more accurate color matching
    return (
      Math.abs(result.r - this.target.r) +
      Math.abs(result.g - this.target.g) +
      Math.abs(result.b - this.target.b) +
      Math.abs(resultHSL.h - this.targetHSL.h) +
      Math.abs(resultHSL.s - this.targetHSL.s) +
      Math.abs(resultHSL.l - this.targetHSL.l)
    );
  }

  /**
   * Generate CSS filter string
   * @param {number[]} values - Filter values (all as percentages 0-100)
   * @returns {string} CSS filter string
   */
  css(values) {
    const invert = Math.round(values[0]);
    const sepia = Math.round(values[1]);
    const saturate = Math.round(values[2]);
    const hueRotate = Math.round(values[3] * 3.6); // Convert percentage to degrees
    const brightness = Math.round(values[4]);
    const contrast = Math.round(values[5]);

    return `invert(${invert}%) sepia(${sepia}%) saturate(${saturate}%) hue-rotate(${hueRotate}deg) brightness(${brightness}%) contrast(${contrast}%)`;
  }
}

/**
 * Generate CSS filter to convert white to target color
 * @param {string} hexColor - Target hex color (e.g., '#00ffff')
 * @returns {string} CSS filter string
 */
export function generateColorFilter(hexColor) {
  if (!hexColor || typeof hexColor !== 'string') {
    return 'none';
  }

  // Handle white color - no filter needed
  const normalized = hexColor.replace('#', '').toLowerCase();
  if (normalized === 'ffffff' || normalized === 'fff') {
    return 'none';
  }

  const rgb = hexToRgb(hexColor);
  if (rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 0) {
    return 'none';
  }

  const target = new Color(rgb[0], rgb[1], rgb[2]);
  const solver = new Solver(target);
  const result = solver.solve();

  return result.filter;
}


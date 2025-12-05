/**
 * High-Resolution Export Utility
 * Exports canvas with smooth gradients (no banding/hard lines)
 * Implements dithering to eliminate color quantization artifacts
 */

/**
 * Clamp value to valid color range (0-255)
 * @param {number} v - Value to clamp
 * @returns {number} Clamped value
 */
function clamp(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

/**
 * Apply random noise dithering to image data
 * Fast and effective for breaking up banding
 * @param {ImageData} imageData - Image data to dither
 * @param {number} noiseAmount - Amount of noise (0-255, recommended 4-8)
 */
function applyRandomDither(imageData, noiseAmount = 6) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Apply same noise to all RGB channels for grayscale-like dithering
    // Or apply independent noise for color dithering
    const d = (Math.random() - 0.5) * noiseAmount;
    data[i] = clamp(data[i] + d); // R
    data[i + 1] = clamp(data[i + 1] + d); // G
    data[i + 2] = clamp(data[i + 2] + d); // B
    // Alpha channel (i+3) is not modified
  }
}

/**
 * Apply Floyd-Steinberg error diffusion dithering
 * Higher quality but slower than random dithering
 * @param {ImageData} imageData - Image data to dither
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
function applyFloydSteinbergDither(imageData, width, height) {
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Get current pixel values
      const oldR = data[idx];
      const oldG = data[idx + 1];
      const oldB = data[idx + 2];

      // Quantize to nearest color (round to nearest integer)
      const newR = Math.round(oldR);
      const newG = Math.round(oldG);
      const newB = Math.round(oldB);

      // Set quantized value
      data[idx] = newR;
      data[idx + 1] = newG;
      data[idx + 2] = newB;

      // Calculate quantization error
      const errorR = oldR - newR;
      const errorG = oldG - newG;
      const errorB = oldB - newB;

      // Distribute error to neighboring pixels using Floyd-Steinberg coefficients:
      //     * 7/16 to (x+1, y)
      //     * 3/16 to (x-1, y+1)
      //     * 5/16 to (x, y+1)
      //     * 1/16 to (x+1, y+1)

      // Right pixel (x+1, y)
      if (x + 1 < width) {
        const rightIdx = (y * width + (x + 1)) * 4;
        data[rightIdx] = clamp(data[rightIdx] + errorR * (7 / 16));
        data[rightIdx + 1] = clamp(data[rightIdx + 1] + errorG * (7 / 16));
        data[rightIdx + 2] = clamp(data[rightIdx + 2] + errorB * (7 / 16));
      }

      // Bottom-left pixel (x-1, y+1)
      if (x > 0 && y + 1 < height) {
        const bottomLeftIdx = ((y + 1) * width + (x - 1)) * 4;
        data[bottomLeftIdx] = clamp(data[bottomLeftIdx] + errorR * (3 / 16));
        data[bottomLeftIdx + 1] = clamp(data[bottomLeftIdx + 1] + errorG * (3 / 16));
        data[bottomLeftIdx + 2] = clamp(data[bottomLeftIdx + 2] + errorB * (3 / 16));
      }

      // Bottom pixel (x, y+1)
      if (y + 1 < height) {
        const bottomIdx = ((y + 1) * width + x) * 4;
        data[bottomIdx] = clamp(data[bottomIdx] + errorR * (5 / 16));
        data[bottomIdx + 1] = clamp(data[bottomIdx + 1] + errorG * (5 / 16));
        data[bottomIdx + 2] = clamp(data[bottomIdx + 2] + errorB * (5 / 16));
      }

      // Bottom-right pixel (x+1, y+1)
      if (x + 1 < width && y + 1 < height) {
        const bottomRightIdx = ((y + 1) * width + (x + 1)) * 4;
        data[bottomRightIdx] = clamp(data[bottomRightIdx] + errorR * (1 / 16));
        data[bottomRightIdx + 1] = clamp(data[bottomRightIdx + 1] + errorG * (1 / 16));
        data[bottomRightIdx + 2] = clamp(data[bottomRightIdx + 2] + errorB * (1 / 16));
      }
    }
  }
}

/**
 * Export high-resolution canvas with dithering to eliminate banding
 * @param {Object} options - Export options
 * @param {HTMLCanvasElement} options.sourceCanvas - Source canvas to export
 * @param {number} options.width - Original width
 * @param {number} options.height - Original height
 * @param {number} options.scale - Scale factor (default: devicePixelRatio or 2)
 * @param {string} options.dither - Dithering mode: 'random', 'floyd', or 'none' (default: 'random')
 * @param {number} options.noiseAmount - Noise amount for random dithering (default: 6)
 * @param {string} options.format - Output format: 'image/png' or 'image/webp' (default: 'image/png')
 * @param {number} options.quality - Quality for WebP (0-1, default: 1.0)
 * @returns {Promise<Blob>} Promise resolving to image blob
 */
export async function exportHighResCanvas({
  sourceCanvas,
  width,
  height,
  scale = window.devicePixelRatio || 2,
  dither = 'random',
  noiseAmount = 6,
  format = 'image/png',
  quality = 1.0,
}) {
  if (!sourceCanvas) {
    throw new Error('Source canvas is required');
  }

  const cw = width * scale;
  const ch = height * scale;

  // Create high-resolution canvas
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = cw;
  exportCanvas.height = ch;

  const ctx = exportCanvas.getContext('2d', {
    // Use high-quality rendering
    alpha: true,
    desynchronized: false,
    willReadFrequently: false,
  });

  // Use imageSmoothingEnabled for better quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw source canvas at high resolution
  ctx.drawImage(sourceCanvas, 0, 0, cw, ch);

  // Apply dithering if requested
  if (dither !== 'none') {
    const imageData = ctx.getImageData(0, 0, cw, ch);

    if (dither === 'random') {
      applyRandomDither(imageData, noiseAmount);
    } else if (dither === 'floyd') {
      applyFloydSteinbergDither(imageData, cw, ch);
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // Export as blob
  return new Promise((resolve, reject) => {
    exportCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      },
      format,
      quality
    );
  });
}

/**
 * Export high-resolution gradient with dithering
 * Wrapper function that creates a canvas from a draw function
 * @param {Object} options - Export options
 * @param {Function} options.draw - Draw function: (ctx, width, height) => Promise<void>
 * @param {number} options.width - Canvas width
 * @param {number} options.height - Canvas height
 * @param {number} options.scale - Scale factor (default: devicePixelRatio or 2)
 * @param {string} options.dither - Dithering mode: 'random', 'floyd', or 'none' (default: 'random')
 * @param {number} options.noiseAmount - Noise amount for random dithering (default: 6)
 * @param {string} options.format - Output format: 'image/png' or 'image/webp' (default: 'image/png')
 * @param {number} options.quality - Quality for WebP (0-1, default: 1.0)
 * @returns {Promise<Blob>} Promise resolving to image blob
 */
export async function exportHighResGradient({
  draw,
  width,
  height,
  scale = window.devicePixelRatio || 2,
  dither = 'random',
  noiseAmount = 6,
  format = 'image/png',
  quality = 1.0,
}) {
  const cw = width * scale;
  const ch = height * scale;

  // Create high-resolution canvas
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;

  const ctx = canvas.getContext('2d', {
    alpha: true,
    desynchronized: false,
    willReadFrequently: false,
  });

  // Use high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Scale context for drawing at original size
  ctx.scale(scale, scale);

  // Call draw function
  if (draw) {
    await draw(ctx, width, height);
  }

  // Get image data for dithering
  let imageData = ctx.getImageData(0, 0, cw, ch);

  // Apply dithering if requested
  if (dither === 'random') {
    applyRandomDither(imageData, noiseAmount);
    ctx.putImageData(imageData, 0, 0);
  } else if (dither === 'floyd') {
    applyFloydSteinbergDither(imageData, cw, ch);
    ctx.putImageData(imageData, 0, 0);
  }

  // Export as blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      },
      format,
      quality
    );
  });
}


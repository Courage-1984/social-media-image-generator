/**
 * High-Resolution Export Utility with Web Worker Support
 * Exports canvas with smooth gradients (no banding/hard lines)
 * Uses Web Worker with OffscreenCanvas for off-thread dithering
 */

let ditherWorker = null;

/**
 * Initialize dither worker (lazy load)
 * @returns {Worker} Web Worker instance
 */
function getDitherWorker() {
  if (!ditherWorker) {
    // Create worker from blob URL to avoid CORS issues
    const workerCode = `
      importScripts('utils/dither-worker.js');
    `;

    // For ES modules, we need to use import.meta.url
    // Create worker with proper path
    try {
      // Try to create worker from file
      ditherWorker = new Worker(new URL('./dither-worker.js', import.meta.url), {
        type: 'module',
      });
    } catch (error) {
      // Fallback: create inline worker
      const blob = new Blob([`
        // Import dither functions from export-high-res.js logic
        // (We'll inline the functions for now)
        ${getDitherFunctionsCode()}

        self.addEventListener('message', async (event) => {
          const { type, canvas, width, height, dither, noiseAmount } = event.data;
          if (type === 'dither') {
            try {
              const offscreen = canvas;
              const ctx = offscreen.getContext('2d');
              const imageData = ctx.getImageData(0, 0, width, height);

              if (dither === 'random') {
                applyRandomDither(imageData, noiseAmount);
              } else if (dither === 'floyd') {
                applyFloydSteinbergDither(imageData, width, height);
              }

              ctx.putImageData(imageData, 0, 0);
              const blob = await offscreen.convertToBlob({ type: 'image/png', quality: 1.0 });

              self.postMessage({ type: 'dither-complete', blob });
            } catch (error) {
              self.postMessage({ type: 'dither-error', error: error.message });
            }
          }
        });
      `], { type: 'application/javascript' });
      ditherWorker = new Worker(URL.createObjectURL(blob));
    }
  }
  return ditherWorker;
}

/**
 * Get dither functions code for inline worker
 * @returns {string} JavaScript code for dither functions
 */
function getDitherFunctionsCode() {
  return `
    function clamp(v) {
      return Math.max(0, Math.min(255, Math.round(v)));
    }

    function applyRandomDither(imageData, noiseAmount = 6) {
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const d = (Math.random() - 0.5) * noiseAmount;
        data[i] = clamp(data[i] + d);
        data[i + 1] = clamp(data[i + 1] + d);
        data[i + 2] = clamp(data[i + 2] + d);
      }
    }

    function applyFloydSteinbergDither(imageData, width, height) {
      const data = imageData.data;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const oldR = data[idx];
          const oldG = data[idx + 1];
          const oldB = data[idx + 2];
          const newR = Math.round(oldR);
          const newG = Math.round(oldG);
          const newB = Math.round(oldB);
          data[idx] = newR;
          data[idx + 1] = newG;
          data[idx + 2] = newB;
          const errorR = oldR - newR;
          const errorG = oldG - newG;
          const errorB = oldB - newB;

          if (x + 1 < width) {
            const rightIdx = (y * width + (x + 1)) * 4;
            data[rightIdx] = clamp(data[rightIdx] + errorR * (7 / 16));
            data[rightIdx + 1] = clamp(data[rightIdx + 1] + errorG * (7 / 16));
            data[rightIdx + 2] = clamp(data[rightIdx + 2] + errorB * (7 / 16));
          }
          if (x > 0 && y + 1 < height) {
            const bottomLeftIdx = ((y + 1) * width + (x - 1)) * 4;
            data[bottomLeftIdx] = clamp(data[bottomLeftIdx] + errorR * (3 / 16));
            data[bottomLeftIdx + 1] = clamp(data[bottomLeftIdx + 1] + errorG * (3 / 16));
            data[bottomLeftIdx + 2] = clamp(data[bottomLeftIdx + 2] + errorB * (3 / 16));
          }
          if (y + 1 < height) {
            const bottomIdx = ((y + 1) * width + x) * 4;
            data[bottomIdx] = clamp(data[bottomIdx] + errorR * (5 / 16));
            data[bottomIdx + 1] = clamp(data[bottomIdx + 1] + errorG * (5 / 16));
            data[bottomIdx + 2] = clamp(data[bottomIdx + 2] + errorB * (5 / 16));
          }
          if (x + 1 < width && y + 1 < height) {
            const bottomRightIdx = ((y + 1) * width + (x + 1)) * 4;
            data[bottomRightIdx] = clamp(data[bottomRightIdx] + errorR * (1 / 16));
            data[bottomRightIdx + 1] = clamp(data[bottomRightIdx + 1] + errorG * (1 / 16));
            data[bottomRightIdx + 2] = clamp(data[bottomRightIdx + 2] + errorB * (1 / 16));
          }
        }
      }
    }
  `;
}

/**
 * Export high-resolution canvas with dithering using Web Worker
 * Offloads expensive dithering to separate thread for better performance
 * @param {Object} options - Export options
 * @param {HTMLCanvasElement} options.sourceCanvas - Source canvas to export
 * @param {number} options.width - Original width
 * @param {number} options.height - Original height
 * @param {number} options.scale - Scale factor (default: devicePixelRatio or 2)
 * @param {string} options.dither - Dithering mode: 'random', 'floyd', or 'none' (default: 'random')
 * @param {number} options.noiseAmount - Noise amount for random dithering (default: 6)
 * @param {string} options.format - Output format: 'image/png' or 'image/webp' (default: 'image/png')
 * @param {number} options.quality - Quality for WebP (0-1, default: 1.0)
 * @param {boolean} options.useWorker - Use Web Worker for dithering (default: true)
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
  useWorker = true,
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
    alpha: true,
    desynchronized: false,
    willReadFrequently: false,
  });

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw source canvas at high resolution
  ctx.drawImage(sourceCanvas, 0, 0, cw, ch);

  // Apply dithering
  if (dither !== 'none') {
    if (useWorker && typeof OffscreenCanvas !== 'undefined') {
      // Use Web Worker with OffscreenCanvas for off-thread processing
      try {
        const offscreen = exportCanvas.transferControlToOffscreen();
        const worker = getDitherWorker();

        return new Promise((resolve, reject) => {
          // Handle worker messages
          const messageHandler = (event) => {
            if (event.data.type === 'dither-complete') {
              worker.removeEventListener('message', messageHandler);
              resolve(event.data.blob);
            } else if (event.data.type === 'dither-error') {
              worker.removeEventListener('message', messageHandler);
              reject(new Error(event.data.error));
            }
          };

          worker.addEventListener('message', messageHandler);

          // Transfer OffscreenCanvas to worker
          worker.postMessage(
            {
              type: 'dither',
              canvas: offscreen,
              width: cw,
              height: ch,
              dither,
              noiseAmount,
            },
            [offscreen]
          );
        });
      } catch (error) {
        // Fallback to main thread if OffscreenCanvas transfer fails
        console.warn('OffscreenCanvas transfer failed, falling back to main thread:', error);
        useWorker = false;
      }
    }

    // Fallback: Main thread dithering (original implementation)
    if (!useWorker) {
      const imageData = ctx.getImageData(0, 0, cw, ch);

      // Import dither functions from export-high-res.js
      const { applyRandomDither, applyFloydSteinbergDither } = await import('./export-high-res.js');

      if (dither === 'random') {
        applyRandomDither(imageData, noiseAmount);
      } else if (dither === 'floyd') {
        applyFloydSteinbergDither(imageData, cw, ch);
      }

      ctx.putImageData(imageData, 0, 0);
    }
  }

  // Export as blob (if not already done by worker)
  if (dither === 'none' || !useWorker || typeof OffscreenCanvas === 'undefined') {
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
}


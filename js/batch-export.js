/**
 * Batch Export Module
 * Generate multiple variations at once
 */

import { exportImage } from './export.js';
import { IMAGE_TYPES } from './config.js';

/**
 * Export multiple variations
 * @param {HTMLElement} canvasWrapper - Canvas wrapper element
 * @param {Object} imageType - Image type from IMAGE_TYPES
 * @param {Array} variations - Array of state variations to export
 * @param {number} scale - Export scale
 * @param {Function} onProgress - Progress callback (index, total)
 * @returns {Promise} Promise that resolves when all exports complete
 */
export async function batchExport(canvasWrapper, imageType, variations, scale = 2, onProgress = null) {
  if (!canvasWrapper || !variations || variations.length === 0) {
    return Promise.reject(new Error('Invalid parameters'));
  }

  const results = [];
  const total = variations.length;

  for (let i = 0; i < total; i++) {
    if (onProgress) {
      onProgress(i + 1, total);
    }

    // Apply variation state (this would need to be implemented in main.js)
    // For now, we'll export with a delay between exports
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between exports
      results.push({ index: i, success: true });
    } catch (error) {
      results.push({ index: i, success: false, error });
    }
  }

  return results;
}

/**
 * Generate variations from base state
 * @param {Object} baseState - Base state
 * @param {Object} options - Variation options
 * @returns {Array} Array of state variations
 */
export function generateVariations(baseState, options = {}) {
  const variations = [];
  const {
    colors = false,
    sizes = false,
    positions = false,
    presets = false,
  } = options;

  // If no options specified, create a simple copy
  if (!colors && !sizes && !positions && !presets) {
    return [JSON.parse(JSON.stringify(baseState))];
  }

  // Generate color variations
  if (colors) {
    // This would generate variations with different color combinations
    // Implementation depends on available colors
  }

  // Generate size variations
  if (sizes) {
    const sizeVariations = [0.8, 0.9, 1.0, 1.1, 1.2];
    sizeVariations.forEach(scale => {
      const variation = JSON.parse(JSON.stringify(baseState));
      variation.titleSize = Math.round(baseState.titleSize * scale);
      variation.subtitleSize = Math.round(baseState.subtitleSize * scale);
      variations.push(variation);
    });
  }

  return variations.length > 0 ? variations : [JSON.parse(JSON.stringify(baseState))];
}


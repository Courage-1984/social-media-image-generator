/**
 * Color Picker Module
 * Handles color selection UI and state
 */

import { colorPalette } from './config.js';

/**
 * Create color picker UI
 * @param {string} containerId - ID of container element
 * @param {string} defaultColor - Default color key
 * @param {Function} onChange - Callback when color changes
 */
export function createColorPicker(containerId, defaultColor = 'cyan', onChange = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  Object.entries(colorPalette).forEach(([key, color]) => {
    const option = document.createElement('div');
    option.className = 'color-option';
    option.style.backgroundColor = color.hex;
    option.dataset.color = color.hex;
    option.dataset.key = key;
    option.title = color.name;

    if (key === defaultColor) {
      option.classList.add('selected');
    }

    option.addEventListener('click', () => {
      container
        .querySelectorAll('.color-option')
        .forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      if (onChange) onChange();
    });

    container.appendChild(option);
  });
}

/**
 * Get selected color hex value
 * @param {string} containerId - ID of color picker container
 * @returns {string} Hex color value
 */
export function getSelectedColor(containerId) {
  const selected = document.querySelector(`#${containerId} .color-option.selected`);
  return selected ? selected.dataset.color : '#00ffff';
}

/**
 * Get selected color key
 * @param {string} containerId - ID of color picker container
 * @returns {string} Color key
 */
export function getSelectedColorKey(containerId) {
  const selected = document.querySelector(`#${containerId} .color-option.selected`);
  return selected ? selected.dataset.key : 'cyan';
}

/**
 * Set selected color by key
 * @param {string} containerId - ID of color picker container
 * @param {string} colorKey - Color key to select
 */
export function setSelectedColor(containerId, colorKey) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll('.color-option').forEach(opt => {
    opt.classList.remove('selected');
    if (opt.dataset.key === colorKey) {
      opt.classList.add('selected');
    }
  });
}


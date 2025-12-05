/**
 * Pattern Preview Tooltip Module
 * Shows pattern previews when hovering over dropdown options
 */

import { backgroundPatterns } from './background-patterns.js';
import { getSelectedColor } from './color-picker.js';

let tooltipElement = null;
let hoverTimeout = null;

/**
 * Create or update pattern preview tooltip
 * @param {string} patternKey - Pattern key
 * @param {HTMLElement} targetElement - The target element (option or select)
 */
export function showPatternPreview(patternKey, targetElement) {
  if (!patternKey || patternKey === '') {
    hidePatternPreview();
    return;
  }

  // Clear any existing timeout
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }

  // Get or create tooltip element - ALWAYS ensure it's in document.body
  // This is critical to escape parent stacking contexts (like controls-column with z-index: 1)
  if (!tooltipElement) {
    tooltipElement = document.getElementById('patternPreviewTooltip');
    if (!tooltipElement) {
      tooltipElement = document.createElement('div');
      tooltipElement.id = 'patternPreviewTooltip';
      tooltipElement.className = 'pattern-preview-tooltip';
      document.body.appendChild(tooltipElement);
    }
  }

  // CRITICAL: Always move tooltip to body if it's not already there
  // This ensures it escapes any parent stacking contexts (like controls-column)
  if (tooltipElement && tooltipElement.parentElement !== document.body) {
    document.body.appendChild(tooltipElement);
  }

  // Get pattern color (use title color as default)
  let patternColor = '#00ffff';
  try {
    const titleColor = getSelectedColor('titleColorPicker');
    if (titleColor) {
      patternColor = titleColor;
    }
  } catch (e) {
    // Use default - color picker might not be initialized yet
  }

  // Apply pattern styles
  const pattern = backgroundPatterns[patternKey];
  if (pattern) {
    // Use appropriate defaults for each pattern type
    let patternOptions = {
      opacity: 0.2,
      size: 30,
      rotation: 0,
    };

    // Set pattern-specific defaults for preview to ensure correct display
    if (patternKey === 'diagonal-lines') {
      patternOptions.rotation = 45; // Ensure diagonal lines show at 45 degrees
    } else if (patternKey === 'diagonal-lines-reverse') {
      patternOptions.rotation = 0; // Will be adjusted to -45 in the pattern itself
    } else if (patternKey === 'stars') {
      patternOptions.opacity = 0.6; // Higher opacity for stars to be visible
    } else if (patternKey === 'noise') {
      patternOptions.opacity = 0.3; // Higher opacity for noise
      patternOptions.size = 100; // Smaller size for noise preview
    } else if (patternKey === 'holographic') {
      patternOptions.opacity = 0.4; // Higher opacity for holographic effect
    } else if (patternKey === 'tech-mesh') {
      patternOptions.size = 40; // Larger size to show dots better
    } else if (patternKey === 'neon-grid') {
      patternOptions.size = 50; // Standard size for neon grid
    }

    const patternStyles = pattern.create(patternColor, patternOptions);

    // Reset and apply styles - Increased size for better visibility
    const previewWidth = 500;
    const previewHeight = 400;
    tooltipElement.style.cssText = `
      position: fixed !important;
      width: ${previewWidth}px;
      height: ${previewHeight}px;
      background: #0a0a0a;
      border: 1px solid rgba(0, 255, 255, 0.4);
      border-radius: 4px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6), 0 0 24px rgba(0, 255, 255, 0.3);
      z-index: 999999 !important;
      pointer-events: none;
      overflow: hidden;
      display: block;
      opacity: 1;
    `;

    Object.assign(tooltipElement.style, patternStyles);
    tooltipElement.style.display = 'block';

    // Position tooltip in the right half of the dropdown menu
    if (targetElement) {
      // Find the dropdown menu element - check if targetElement is an option or the select
      const dropdownWrapper = targetElement.closest('.custom-pattern-dropdown-wrapper');
      const dropdownMenu = dropdownWrapper ? dropdownWrapper.querySelector('.custom-pattern-dropdown-menu') : null;

      if (dropdownMenu) {
        const menuRect = dropdownMenu.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();

        // Position in the right half of the dropdown menu
        // Calculate right half: menu left + (menu width / 2)
        const rightHalfLeft = menuRect.left + (menuRect.width / 2);

        // ALWAYS center the tooltip vertically in relation to the viewport
        // Calculate viewport vertical center
        const viewportCenterY = window.innerHeight / 2;
        // Center tooltip on viewport center (tooltip center = viewport center)
        let top = viewportCenterY - (previewHeight / 2);

        // Horizontal positioning - align to right half
        let left = rightHalfLeft + 5; // Small margin from center line

        // Ensure tooltip stays within dropdown menu bounds
        // Right edge check
        if (left + previewWidth > menuRect.right - 5) {
          left = menuRect.right - previewWidth - 5;
        }

        // Left edge check (shouldn't go past center)
        if (left < rightHalfLeft) {
          left = rightHalfLeft + 5;
        }

        // Viewport boundary checks - ensure tooltip doesn't go outside viewport
        // If viewport centering would cause overflow, adjust but try to stay as centered as possible
        if (top < 10) {
          top = 10;
        }
        if (top + previewHeight > window.innerHeight - 10) {
          top = window.innerHeight - previewHeight - 10;
        }

        tooltipElement.style.position = 'fixed';
        tooltipElement.style.left = `${left}px`;
        tooltipElement.style.top = `${top}px`;
      } else {
        // Fallback to original positioning if dropdown menu not found
        const rect = targetElement.getBoundingClientRect();

        // ALWAYS center vertically in relation to the viewport
        const viewportCenterY = window.innerHeight / 2;
        let top = viewportCenterY - (previewHeight / 2);
        let left = rect.right + 15;

        // Horizontal boundary checks
        if (left + previewWidth > window.innerWidth - 10) {
          left = rect.left - previewWidth - 15;
        }

        // Vertical boundary checks - adjust if needed but try to stay as centered as possible
        if (top + previewHeight > window.innerHeight - 10) {
          top = window.innerHeight - previewHeight - 10;
        }

        if (top < 10) {
          top = 10;
        }

        tooltipElement.style.position = 'fixed';
        tooltipElement.style.left = `${left}px`;
        tooltipElement.style.top = `${top}px`;
      }
    }
  }
}

/**
 * Hide pattern preview tooltip
 * @param {boolean} immediate - If true, hide immediately. If false, delay slightly
 */
export function hidePatternPreview(immediate = false) {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }

  const hide = () => {
    if (tooltipElement) {
      tooltipElement.style.display = 'none';
    }
  };

  if (immediate) {
    hide();
  } else {
    // Small delay to prevent flickering when moving between options
    hoverTimeout = setTimeout(hide, 150);
  }
}

/**
 * Initialize pattern preview for select element
 * @param {HTMLElement} selectElement - The select element
 */
export function initPatternPreview(selectElement) {
  if (!selectElement) return;

  // Show preview when hovering over select
  selectElement.addEventListener('mouseenter', () => {
    const value = selectElement.value;
    if (value) {
      showPatternPreview(value, selectElement);
    }
  });

  selectElement.addEventListener('mouseleave', () => {
    hidePatternPreview();
  });

  // Update preview when value changes (keyboard navigation)
  selectElement.addEventListener('change', () => {
    const value = selectElement.value;
    if (value) {
      showPatternPreview(value, selectElement);
      // Hide after a moment
      setTimeout(() => hidePatternPreview(true), 1000);
    } else {
      hidePatternPreview(true);
    }
  });

  // Show preview on focus (for keyboard users)
  selectElement.addEventListener('focus', () => {
    const value = selectElement.value;
    if (value) {
      showPatternPreview(value, selectElement);
    }
  });

  // Update preview on keydown (arrow keys)
  selectElement.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
      // Small delay to let the value update
      setTimeout(() => {
        const value = selectElement.value;
        if (value) {
          showPatternPreview(value, selectElement);
        } else {
          hidePatternPreview(true);
        }
      }, 10);
    }
  });

  selectElement.addEventListener('blur', () => {
    hidePatternPreview(true);
  });
}


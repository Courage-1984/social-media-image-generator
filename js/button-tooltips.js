/**
 * Button Tooltips Module
 * Shows styled tooltips for preview buttons with delay
 */

let tooltipElement = null;
let tooltipTimeout = null;
const TOOLTIP_DELAY = 500; // 500ms delay before showing tooltip

/**
 * Create tooltip element
 */
function createTooltip() {
  if (tooltipElement) return tooltipElement;

  tooltipElement = document.createElement('div');
  tooltipElement.className = 'button-tooltip';
  tooltipElement.style.cssText = `
    position: fixed;
    background: #1a1a2e;
    border: 1px solid rgba(0, 255, 255, 0.4);
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    color: #ffffff;
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.75rem;
    line-height: 1.4;
    max-width: 200px;
    z-index: 999999;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 16px rgba(0, 255, 255, 0.2);
    white-space: nowrap;
  `;
  document.body.appendChild(tooltipElement);
  return tooltipElement;
}

/**
 * Show tooltip for a button
 * @param {HTMLElement} button - The button element
 * @param {string} text - Tooltip text
 */
export function showButtonTooltip(button, text) {
  if (!button || !text) return;

  // Clear any existing timeout
  if (tooltipTimeout) {
    clearTimeout(tooltipTimeout);
    tooltipTimeout = null;
  }

  // Hide tooltip immediately if it's showing
  hideButtonTooltip();

  // Set delay before showing tooltip
  tooltipTimeout = setTimeout(() => {
    const tooltip = createTooltip();
    tooltip.textContent = text;
    tooltip.style.display = 'block';

    // Position tooltip
    const rect = button.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    // Position above the button by default, or below if not enough space
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    let top = rect.top - tooltipRect.height - 8;

    // Adjust if tooltip would go off screen to the left
    if (left < 10) {
      left = 10;
    }

    // Adjust if tooltip would go off screen to the right
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }

    // Adjust if tooltip would go off screen at top (show below instead)
    if (top < 10) {
      top = rect.bottom + 8;
    }

    // Adjust if tooltip would go off screen at bottom
    if (top + tooltipRect.height > window.innerHeight - 10) {
      top = window.innerHeight - tooltipRect.height - 10;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    // Fade in
    requestAnimationFrame(() => {
      tooltip.style.opacity = '1';
    });
  }, TOOLTIP_DELAY);
}

/**
 * Hide tooltip
 */
export function hideButtonTooltip() {
  // Clear any pending timeout
  if (tooltipTimeout) {
    clearTimeout(tooltipTimeout);
    tooltipTimeout = null;
  }

  if (tooltipElement) {
    tooltipElement.style.opacity = '0';
    setTimeout(() => {
      if (tooltipElement) {
        tooltipElement.style.display = 'none';
      }
    }, 200);
  }
}

/**
 * Initialize tooltips for preview buttons
 */
export function initButtonTooltips() {
  // Get all preview buttons in the row above the preview window
  const previewButtons = [
    'randomizeBtn',
    'resetBtn',
    'popoutBtn',
    'undoBtn',
    'redoBtn',
    'gridToggleBtn',
    'rulerToggleBtn',
    'contrastToggleBtn',
    'transparencyCheckerBtn',
    'layerVisibilityBtn',
    'historyTimelineBtn',
  ];

  previewButtons.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (!button) return;

    // Get tooltip text from title attribute or use button text
    const tooltipText = button.getAttribute('title') || button.textContent.trim();

    // Remove title attribute to prevent native tooltip
    button.removeAttribute('title');

    // Add data attribute for accessibility
    button.setAttribute('aria-label', tooltipText);

    // Add hover event listeners
    button.addEventListener('mouseenter', () => {
      showButtonTooltip(button, tooltipText);
    });

    button.addEventListener('mouseleave', () => {
      hideButtonTooltip();
    });

    // Also hide on click to prevent tooltip staying visible
    button.addEventListener('click', () => {
      hideButtonTooltip();
    });
  });
}


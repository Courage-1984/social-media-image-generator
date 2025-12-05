/**
 * Text Alignment Module
 * Handles X and Y position adjustments for text elements
 */

/**
 * Calculate text position with alignment offsets
 * @param {number} baseX - Base X position (percentage or pixels)
 * @param {number} baseY - Base Y position (percentage or pixels)
 * @param {number} offsetX - X offset in pixels
 * @param {number} offsetY - Y offset in pixels
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @returns {Object} Calculated position {x, y, transform}
 */
export function calculateTextPosition(baseX, baseY, offsetX, offsetY, canvasWidth, canvasHeight) {
  let x, y, transform;

  // If baseX/baseY are percentages, convert to pixels
  if (typeof baseX === 'string' && baseX.includes('%')) {
    x = (parseFloat(baseX) / 100) * canvasWidth + offsetX;
  } else {
    x = baseX + offsetX;
  }

  if (typeof baseY === 'string' && baseY.includes('%')) {
    y = (parseFloat(baseY) / 100) * canvasHeight + offsetY;
  } else {
    y = baseY + offsetY;
  }

  // Calculate transform for centering
  transform = `translate(-50%, -50%)`;

  return { x, y, transform };
}

/**
 * Apply text position to element
 * @param {HTMLElement} element - Text element
 * @param {Object} position - Position object from calculateTextPosition
 */
export function applyTextPosition(element, position) {
  element.style.left = `${position.x}px`;
  element.style.top = `${position.y}px`;
  element.style.transform = position.transform;
}


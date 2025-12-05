/**
 * Grid Overlay Module
 * Visual alignment guide overlay
 */

let gridOverlayVisible = false;
let gridOverlayElement = null;

/**
 * Create grid overlay element
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {HTMLElement} Grid overlay element
 */
function createGridOverlay(width, height) {
  const overlay = document.createElement('div');
  overlay.id = 'gridOverlay';
  overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: ${width}px;
    height: ${height}px;
    pointer-events: none;
    z-index: 1000;
    opacity: 1;
    overflow: visible;
  `;

  // Create grid lines
  const gridSize = 50;
  const verticalLines = Math.ceil(width / gridSize);
  const horizontalLines = Math.ceil(height / gridSize);

  // Vertical lines - ensure we cover the full width including the right edge
  for (let i = 0; i <= verticalLines; i++) {
    const line = document.createElement('div');
    let lineLeft = i * gridSize;
    // Ensure the last line is at the right edge (width - 1px so the line is visible)
    if (lineLeft >= width) {
      lineLeft = width - 1;
    }

    line.style.cssText = `
      position: absolute;
      left: ${lineLeft}px;
      top: 0;
      width: 1px;
      height: ${height}px;
      background: rgba(0, 255, 255, 0.5);
      box-shadow: 0 0 2px rgba(0, 255, 255, 0.3);
    `;
    overlay.appendChild(line);
  }

  // Horizontal lines - ensure we cover the full height including the bottom edge
  // Calculate lines at grid intervals, stopping before exceeding canvas height
  for (let i = 0; ; i++) {
    const lineTop = i * gridSize;
    // Stop if this line would be beyond the canvas
    if (lineTop >= height) break;

    const line = document.createElement('div');
    line.style.cssText = `
      position: absolute;
      left: 0;
      top: ${lineTop}px;
      width: ${width}px;
      height: 1px;
      background: rgba(0, 255, 255, 0.5);
      box-shadow: 0 0 2px rgba(0, 255, 255, 0.3);
    `;
    overlay.appendChild(line);
  }

  // Always add a line at the very bottom edge (height - 1px) to ensure full coverage
  const bottomLineTop = height - 1;
  const lastGridLineTop = Math.floor(height / gridSize) * gridSize;
  // Only add if the last grid line doesn't already cover the bottom
  if (lastGridLineTop < bottomLineTop) {
    const bottomLine = document.createElement('div');
    bottomLine.style.cssText = `
      position: absolute;
      left: 0;
      top: ${bottomLineTop}px;
      width: ${width}px;
      height: 1px;
      background: rgba(0, 255, 255, 0.5);
      box-shadow: 0 0 2px rgba(0, 255, 255, 0.3);
    `;
    overlay.appendChild(bottomLine);
  }

  // Center lines (highlighted - more prominent)
  const centerV = document.createElement('div');
  centerV.style.cssText = `
    position: absolute;
    left: 50%;
    top: 0;
    width: 2px;
    height: 100%;
    background: rgba(0, 255, 255, 0.9);
    box-shadow: 0 0 4px rgba(0, 255, 255, 0.8), 0 0 8px rgba(0, 255, 255, 0.4);
    transform: translateX(-50%);
    z-index: 1001;
  `;
  overlay.appendChild(centerV);

  const centerH = document.createElement('div');
  centerH.style.cssText = `
    position: absolute;
    left: 0;
    top: 50%;
    width: 100%;
    height: 2px;
    background: rgba(0, 255, 255, 0.9);
    box-shadow: 0 0 4px rgba(0, 255, 255, 0.8), 0 0 8px rgba(0, 255, 255, 0.4);
    transform: translateY(-50%);
    z-index: 1001;
  `;
  overlay.appendChild(centerH);

  return overlay;
}

/**
 * Toggle grid overlay visibility
 * @param {HTMLElement} canvasWrapper - Canvas wrapper element
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {boolean} New visibility state
 */
export function toggleGridOverlay(canvasWrapper, width, height) {
  if (!canvasWrapper) return false;

  gridOverlayVisible = !gridOverlayVisible;

  if (gridOverlayVisible) {
    // Always recreate to ensure correct dimensions
    if (gridOverlayElement) {
      gridOverlayElement.remove();
    }
    gridOverlayElement = createGridOverlay(width, height);
    canvasWrapper.appendChild(gridOverlayElement);
  } else {
    if (gridOverlayElement && gridOverlayElement.parentNode) {
      gridOverlayElement.parentNode.removeChild(gridOverlayElement);
    }
  }

  return gridOverlayVisible;
}

/**
 * Get grid overlay visibility state
 * @returns {boolean} Visibility state
 */
export function isGridOverlayVisible() {
  return gridOverlayVisible;
}

/**
 * Update grid overlay dimensions
 * @param {number} width - New canvas width
 * @param {number} height - New canvas height
 */
export function updateGridOverlayDimensions(width, height) {
  // Remove existing overlay if it exists
  if (gridOverlayElement && gridOverlayElement.parentNode) {
    gridOverlayElement.remove();
  }

  // Recreate overlay if it should be visible
  if (gridOverlayVisible) {
    gridOverlayElement = createGridOverlay(width, height);
    const canvasWrapper = document.getElementById('canvasWrapper');
    if (canvasWrapper) {
      canvasWrapper.appendChild(gridOverlayElement);
    }
  } else {
    // Clear reference if not visible
    gridOverlayElement = null;
  }
}

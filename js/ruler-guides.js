/**
 * Enhanced Ruler/Guides System
 * Architectural Implementation per Specification
 *
 * MVC Architecture:
 * - Model: RulerState (centralized singleton)
 * - View: Canvas rendering + DOM overlays
 * - Controller: Event handlers and UI interactions
 */

// ============================================================================
// I. MODEL: Centralized State Management (RulerState Singleton)
// ============================================================================

const RulerState = {
  // Core state flags
  isActive: false,
  snapEnabled: false,
  currentUnit: 'px', // 'px', '%', 'em'
  gridSize: 10, // pixels
  baseFontSize: 16, // Base font size for em conversion

  // Cursor state
  cursorX: 0, // Canvas-relative pixel position
  cursorY: 0,
  cursorVisible: false,

  // Guide collections (stored in absolute pixels - source of truth)
  guides: [], // Array of Guide objects

  // Canvas dimensions (for unit conversion)
  canvasWidth: 0,
  canvasHeight: 0,

  // Rendering state
  needsRerender: true,
  rafId: null,

  // Distance calculation debounce
  distanceCalcTimeout: null,
};

// Guide data model (per specification Table 1)
class Guide {
  constructor(type, positionPx, colorIndex = 0) {
    this.id = `guide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.type = type; // 'H' (Horizontal) or 'V' (Vertical)
    this.positionPx = positionPx; // PRIMARY SOURCE OF TRUTH - absolute canvas pixels
    this.colorIndex = colorIndex; // 0-4 (cyclical color mapping)
    this.isDragging = false;
  }
}

// Color palette (5 colors as specified)
const GUIDE_COLORS = [
  'rgba(0, 255, 255, 0.6)',   // Cyan
  'rgba(255, 0, 255, 0.6)',   // Magenta
  'rgba(0, 255, 0, 0.6)',     // Green
  'rgba(255, 255, 0, 0.6)',   // Yellow
  'rgba(255, 128, 0, 0.6)',   // Orange
];

// Legacy variable mappings for backward compatibility during migration
let isRulerActive = false; // Will be removed - use RulerState.isActive
let guides = []; // Will be removed - use RulerState.guides
let unitType = 'px'; // Will be removed - use RulerState.currentUnit
let snapToGrid = false; // Will be removed - use RulerState.snapEnabled
let gridSize = 10; // Will be removed - use RulerState.gridSize
let showCrosshair = true; // Will be removed - use RulerState.cursorVisible
let showDistanceIndicators = true; // Kept for now

// ============================================================================
// II. UNIT CONVERSION LAYER (per Section V.A)
// ============================================================================

const UnitConverter = {
  /**
   * Convert pixel value to percentage
   */
  pxToPercent(valuePx, isHorizontal = true) {
    const dimension = isHorizontal ? RulerState.canvasWidth : RulerState.canvasHeight;
    if (dimension === 0) return 0;
    return (valuePx / dimension) * 100;
  },

  /**
   * Convert percentage to pixels
   */
  percentToPx(valuePercent, isHorizontal = true) {
    const dimension = isHorizontal ? RulerState.canvasWidth : RulerState.canvasHeight;
    return (valuePercent / 100) * dimension;
  },

  /**
   * Convert pixel value to em
   */
  pxToEm(valuePx) {
    return valuePx / RulerState.baseFontSize;
  },

  /**
   * Convert em to pixels
   */
  emToPx(valueEm) {
    return valueEm * RulerState.baseFontSize;
  },

  /**
   * Format value for display based on current unit
   */
  formatForDisplay(valuePx, isHorizontal = true) {
    switch (RulerState.currentUnit) {
      case '%':
        return `${this.pxToPercent(valuePx, isHorizontal).toFixed(1)}%`;
      case 'em':
        return `${this.pxToEm(valuePx).toFixed(2)}em`;
      default: // 'px'
        return this.formatPixels(valuePx);
    }
  },

  /**
   * Format pixel value with smart abbreviation
   */
  formatPixels(valuePx) {
    if (valuePx >= 1000) {
      return `${(valuePx / 1000).toFixed(1)}k`;
    }
    return `${Math.round(valuePx)}`;
  },
};

// ============================================================================
// III. SMART RULER ENGINE (per Section III)
// ============================================================================

const SmartRulerEngine = {
  /**
   * Calculate "nice" tick interval using Heckbert's method
   */
  calculateNiceInterval(min, max, desiredTicks = 10) {
    const range = max - min;
    if (range === 0) return 1;

    const roughStep = range / desiredTicks;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalizedStep = roughStep / magnitude;

    let niceStep;
    if (normalizedStep <= 1) niceStep = 1;
    else if (normalizedStep <= 2) niceStep = 2;
    else if (normalizedStep <= 5) niceStep = 5;
    else niceStep = 10;

    return niceStep * magnitude;
  },

  /**
   * Generate tick marks for ruler
   */
  generateTicks(width, height) {
    let desiredTicks = 10;
    if (width >= 2000 && width < 10000) desiredTicks = 20;
    else if (width >= 10000) desiredTicks = 25;

    const majorInterval = this.calculateNiceInterval(0, width, desiredTicks);
    const minorInterval = majorInterval / 5;

    return {
      horizontal: {
        major: majorInterval,
        minor: minorInterval,
        count: Math.ceil(width / majorInterval),
      },
      vertical: {
        major: this.calculateNiceInterval(0, height, desiredTicks),
        minor: this.calculateNiceInterval(0, height, desiredTicks) / 5,
        count: Math.ceil(height / this.calculateNiceInterval(0, height, desiredTicks)),
      },
    };
  },
};

// ============================================================================
// IV. CANVAS RENDERING LAYER (per Section II)
// ============================================================================

let rulerCanvas = null;
let rulerCtx = null;
let guideCanvas = null;
let guideCtx = null;

/**
 * Initialize canvas layers for rendering
 */
function initializeCanvasLayers() {
  const canvasWrapper = document.getElementById('canvasWrapper');
  if (!canvasWrapper) return;

  const rect = canvasWrapper.getBoundingClientRect();
  RulerState.canvasWidth = rect.width;
  RulerState.canvasHeight = rect.height;

  // Create ruler canvas (cached layer for ruler marks)
  if (!rulerCanvas) {
    rulerCanvas = document.createElement('canvas');
    rulerCanvas.id = 'rulerCanvas';
    rulerCanvas.className = 'ruler-canvas';
    rulerCanvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 8;
    `;
    const rulerOverlay = document.getElementById('rulerOverlay');
    if (rulerOverlay) {
      rulerOverlay.appendChild(rulerCanvas);
    }
    rulerCtx = rulerCanvas.getContext('2d');
  }

  // Create guide canvas (dynamic layer for guides and crosshair)
  if (!guideCanvas) {
    guideCanvas = document.createElement('canvas');
    guideCanvas.id = 'guideCanvas';
    guideCanvas.className = 'guide-canvas';
    guideCanvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: auto;
      z-index: 9;
    `;
    const rulerOverlay = document.getElementById('rulerOverlay');
    if (rulerOverlay) {
      rulerOverlay.appendChild(guideCanvas);
    }
    guideCtx = guideCanvas.getContext('2d');
  }

  // Set canvas dimensions
  rulerCanvas.width = rect.width;
  rulerCanvas.height = rect.height;
  guideCanvas.width = rect.width;
  guideCanvas.height = rect.height;
}

/**
 * Render ruler marks onto cached ruler canvas
 */
function renderRulerMarks() {
  if (!rulerCtx || !rulerCanvas) return;

  const width = rulerCanvas.width;
  const height = rulerCanvas.height;

  rulerCtx.clearRect(0, 0, width, height);

  const ticks = SmartRulerEngine.generateTicks(width, height);

  // Render horizontal ruler marks (top)
  rulerCtx.save();
  rulerCtx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
  rulerCtx.fillStyle = '#00ffff';
  rulerCtx.font = '10px Rajdhani, sans-serif';
  rulerCtx.textAlign = 'center';
  rulerCtx.textBaseline = 'top';

  // Major ticks
  for (let i = 0; i <= width; i += ticks.horizontal.major) {
    rulerCtx.beginPath();
    rulerCtx.moveTo(i, 0);
    rulerCtx.lineTo(i, 12);
    rulerCtx.stroke();

    const label = UnitConverter.formatForDisplay(i, true);
    rulerCtx.fillText(label, i, 2);
  }

  // Minor ticks
  rulerCtx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
  for (let i = 0; i <= width; i += ticks.horizontal.minor) {
    if (i % ticks.horizontal.major !== 0) {
      rulerCtx.beginPath();
      rulerCtx.moveTo(i, 0);
      rulerCtx.lineTo(i, 6);
      rulerCtx.stroke();
    }
  }

  // Render vertical ruler marks (left)
  rulerCtx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
  rulerCtx.textAlign = 'left';
  rulerCtx.textBaseline = 'middle';

  // Major ticks
  for (let i = 0; i <= height; i += ticks.vertical.major) {
    rulerCtx.beginPath();
    rulerCtx.moveTo(0, i);
    rulerCtx.lineTo(12, i);
    rulerCtx.stroke();

    const label = UnitConverter.formatForDisplay(i, false);
    rulerCtx.save();
    rulerCtx.translate(6, i);
    rulerCtx.rotate(-Math.PI / 2);
    rulerCtx.fillText(label, 0, 0);
    rulerCtx.restore();
  }

  // Minor ticks
  rulerCtx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
  for (let i = 0; i <= height; i += ticks.vertical.minor) {
    if (i % ticks.vertical.major !== 0) {
      rulerCtx.beginPath();
      rulerCtx.moveTo(0, i);
      rulerCtx.lineTo(6, i);
      rulerCtx.stroke();
    }
  }

  rulerCtx.restore();
}

/**
 * Render guides and crosshair onto guide canvas (RAF loop)
 */
function renderGuideLayer() {
  if (!guideCtx || !guideCanvas || !RulerState.isActive) return;

  const width = guideCanvas.width;
  const height = guideCanvas.height;

  guideCtx.clearRect(0, 0, width, height);

  const rulerOffsetX = 20;
  const rulerOffsetY = 24;

  // Render guides (batched by color for performance)
  const guidesByColor = {};
  RulerState.guides.forEach(guide => {
    if (!guidesByColor[guide.colorIndex]) {
      guidesByColor[guide.colorIndex] = [];
    }
    guidesByColor[guide.colorIndex].push(guide);
  });

  // Draw guides grouped by color
  Object.keys(guidesByColor).forEach(colorIndex => {
    const color = GUIDE_COLORS[parseInt(colorIndex)];
    guideCtx.strokeStyle = color;
    guideCtx.lineWidth = 2;

    guidesByColor[colorIndex].forEach(guide => {
      guideCtx.beginPath();
      if (guide.type === 'H') {
        const y = guide.positionPx + rulerOffsetY;
        guideCtx.moveTo(rulerOffsetX, y);
        guideCtx.lineTo(width, y);
      } else {
        const x = guide.positionPx + rulerOffsetX;
        guideCtx.moveTo(x, rulerOffsetY);
        guideCtx.lineTo(x, height);
      }
      guideCtx.stroke();
    });
  });

  // Render crosshair (if visible) with glow effect
  if (RulerState.cursorVisible) {
    const x = RulerState.cursorX + rulerOffsetX;
    const y = RulerState.cursorY + rulerOffsetY;

    // Configure glow effect using Canvas Shadow API
    guideCtx.shadowColor = 'rgba(0, 255, 255, 0.8)';
    guideCtx.shadowBlur = 10;
    guideCtx.shadowOffsetX = 0;
    guideCtx.shadowOffsetY = 0;

    guideCtx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
    guideCtx.lineWidth = 1;

    // Horizontal line
    guideCtx.beginPath();
    guideCtx.moveTo(rulerOffsetX, y);
    guideCtx.lineTo(width, y);
    guideCtx.stroke();

    // Vertical line
    guideCtx.beginPath();
    guideCtx.moveTo(x, rulerOffsetY);
    guideCtx.lineTo(x, height);
    guideCtx.stroke();

    guideCtx.shadowBlur = 0;
  }

  // Render distance indicators (debounced - only if not dragging)
  const isDragging = RulerState.guides.some(g => g.isDragging);
  if (!isDragging && RulerState.needsRerender) {
    renderDistanceIndicators();
  }
}

/**
 * Render distance indicators between adjacent guides
 */
function renderDistanceIndicators() {
  if (!guideCtx || !guideCanvas) return;

  const rulerOffsetX = 20;
  const rulerOffsetY = 24;

  // Sort guides by position
  const horizontalGuides = RulerState.guides
    .filter(g => g.type === 'H')
    .sort((a, b) => a.positionPx - b.positionPx);

  const verticalGuides = RulerState.guides
    .filter(g => g.type === 'V')
    .sort((a, b) => a.positionPx - b.positionPx);

  guideCtx.save();
  guideCtx.fillStyle = 'rgba(0, 255, 255, 0.9)';
  guideCtx.font = '11px Rajdhani, sans-serif';
  guideCtx.textAlign = 'center';
  guideCtx.textBaseline = 'middle';

  // Horizontal guide distances
  for (let i = 0; i < horizontalGuides.length - 1; i++) {
    const delta = horizontalGuides[i + 1].positionPx - horizontalGuides[i].positionPx;
    const midY = (horizontalGuides[i].positionPx + horizontalGuides[i + 1].positionPx) / 2 + rulerOffsetY;
    const label = UnitConverter.formatForDisplay(delta, false);

    guideCtx.fillText(label, rulerOffsetX + 30, midY);
  }

  // Vertical guide distances
  for (let i = 0; i < verticalGuides.length - 1; i++) {
    const delta = verticalGuides[i + 1].positionPx - verticalGuides[i].positionPx;
    const midX = (verticalGuides[i].positionPx + verticalGuides[i + 1].positionPx) / 2 + rulerOffsetX;
    const label = UnitConverter.formatForDisplay(delta, true);

    guideCtx.save();
    guideCtx.translate(midX, rulerOffsetY + 30);
    guideCtx.rotate(-Math.PI / 2);
    guideCtx.fillText(label, 0, 0);
    guideCtx.restore();
  }

  guideCtx.restore();
}

/**
 * Main render loop using requestAnimationFrame
 */
function renderLoop() {
  if (!RulerState.isActive) {
    RulerState.rafId = null;
    return;
  }

  renderGuideLayer();
  RulerState.needsRerender = false;

  RulerState.rafId = requestAnimationFrame(renderLoop);
}

/**
 * Initialize ruler/guides system
 */
export function initRulerGuides() {
  const rulerToggleBtn = document.getElementById('rulerToggleBtn');
  if (!rulerToggleBtn) return;

  // Create enhanced overlay structure
  createEnhancedOverlay();

  // Event listeners
  rulerToggleBtn.addEventListener('click', (e) => {
    console.log('Ruler button clicked');
    e.preventDefault();
    e.stopPropagation();
    toggleRuler();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);

  // Mouse tracking for crosshair and measurements
  setupMouseTracking();

  // Guide management
  setupGuideManagement();

  // Unit switching
  setupUnitSwitching();
}

/**
 * Create enhanced overlay with additional UI elements
 */
function createEnhancedOverlay() {
  const rulerOverlay = document.getElementById('rulerOverlay');
  if (!rulerOverlay) {
    console.error('Ruler overlay not found!');
    return;
  }

  // Add coordinate display
  let coordDisplay = document.getElementById('coordinateDisplay');
  if (!coordDisplay) {
    coordDisplay = document.createElement('div');
    coordDisplay.id = 'coordinateDisplay';
    coordDisplay.className = 'coordinate-display';
    coordDisplay.innerHTML = '<div class="coord-x">X: 0px</div><div class="coord-y">Y: 0px</div>';
    coordDisplay.style.display = 'none'; // Hidden by default
    rulerOverlay.appendChild(coordDisplay);
    console.log('Coordinate display created');
  }

  // Add unit switcher
  let unitSwitcher = document.getElementById('unitSwitcher');
  if (!unitSwitcher) {
    unitSwitcher = document.createElement('div');
    unitSwitcher.id = 'unitSwitcher';
    unitSwitcher.className = 'unit-switcher';
    unitSwitcher.innerHTML = `
      <button class="unit-btn active" data-unit="px">px</button>
      <button class="unit-btn" data-unit="%">%</button>
      <button class="unit-btn" data-unit="em">em</button>
    `;
    unitSwitcher.style.display = 'none'; // Hidden by default
    rulerOverlay.appendChild(unitSwitcher);
    console.log('Unit switcher created');
  }

  // Add guide controls
  let guideControls = document.getElementById('guideControls');
  if (!guideControls) {
    guideControls = document.createElement('div');
    guideControls.id = 'guideControls';
    guideControls.className = 'guide-controls';
    guideControls.innerHTML = `
      <button class="guide-btn" id="addHorizontalGuide" title="Add Horizontal Guide (H)">
        <span>+</span> H
      </button>
      <button class="guide-btn" id="addVerticalGuide" title="Add Vertical Guide (V)">
        <span>+</span> V
      </button>
      <button class="guide-btn" id="clearAllGuides" title="Clear All Guides (C)">
        <span>✕</span> Clear
      </button>
      <label class="snap-toggle">
        <input type="checkbox" id="snapToGridToggle">
        <span>Snap</span>
      </label>
    `;
    guideControls.style.display = 'none'; // Hidden by default
    rulerOverlay.appendChild(guideControls);
    console.log('Guide controls created');
  }

  // Add measurement tool indicator
  if (!document.getElementById('measurementTool')) {
    const measureTool = document.createElement('div');
    measureTool.id = 'measurementTool';
    measureTool.className = 'measurement-tool';
    measureTool.style.display = 'none';
    rulerOverlay.appendChild(measureTool);
  }

  // Create DOM overlay container for delete buttons (hybrid architecture)
  if (!document.getElementById('guideDeleteButtons')) {
    const deleteContainer = document.createElement('div');
    deleteContainer.id = 'guideDeleteButtons';
    deleteContainer.className = 'guide-delete-buttons';
    deleteContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
    `;
    rulerOverlay.appendChild(deleteContainer);
  }

  console.log('Enhanced overlay structure created successfully');
}

/**
 * Toggle ruler/guides visibility
 */
function toggleRuler() {
  console.log('toggleRuler called');
  const rulerOverlay = document.getElementById('rulerOverlay');
  const rulerToggleBtn = document.getElementById('rulerToggleBtn');
  const canvasWrapper = document.getElementById('canvasWrapper');

  if (!rulerOverlay) {
    console.warn('Ruler overlay not found');
    return;
  }

  if (!canvasWrapper) {
    console.warn('Canvas wrapper not found');
    return;
  }

  // Check current state - handle both 'none' and empty string
  const currentDisplay = rulerOverlay.style.display || window.getComputedStyle(rulerOverlay).display;
  RulerState.isActive = currentDisplay !== 'none' && currentDisplay !== '';
  RulerState.isActive = !RulerState.isActive;

  // Sync legacy variable for backward compatibility
  isRulerActive = RulerState.isActive;

  rulerOverlay.style.display = RulerState.isActive ? 'block' : 'none';
  if (rulerToggleBtn) {
    rulerToggleBtn.classList.toggle('active', RulerState.isActive);
  }

  if (RulerState.isActive) {
    // Initialize canvas layers
    initializeCanvasLayers();
    renderRulerMarks();
    updateAllGuides();
    updateCoordinateDisplay(0, 0);

    // Start render loop
    if (!RulerState.rafId) {
      renderLoop();
    }

    // Show all UI elements with proper display values
    const coordDisplay = document.getElementById('coordinateDisplay');
    const unitSwitcher = document.getElementById('unitSwitcher');
    const guideControls = document.getElementById('guideControls');
    if (coordDisplay) {
      coordDisplay.style.display = 'block';
      coordDisplay.style.visibility = 'visible';
      coordDisplay.style.opacity = '1';
    }
    if (unitSwitcher) {
      unitSwitcher.style.display = 'flex';
      unitSwitcher.style.visibility = 'visible';
      unitSwitcher.style.opacity = '1';
    }
    if (guideControls) {
      guideControls.style.display = 'flex';
      guideControls.style.visibility = 'visible';
      guideControls.style.opacity = '1';
    }

    // Update on resize
    const resizeObserver = new ResizeObserver(() => {
      if (RulerState.isActive) {
        initializeCanvasLayers();
        renderRulerMarks();
        updateAllGuides();
        RulerState.needsRerender = true;
      }
    });
    resizeObserver.observe(canvasWrapper);
  } else {
    // Stop render loop
    if (RulerState.rafId) {
      cancelAnimationFrame(RulerState.rafId);
      RulerState.rafId = null;
    }

    RulerState.cursorVisible = false;
    // Hide crosshair and UI elements when deactivated
    hideCrosshair();
    const coordDisplay = document.getElementById('coordinateDisplay');
    const unitSwitcher = document.getElementById('unitSwitcher');
    const guideControls = document.getElementById('guideControls');
    if (coordDisplay) {
      coordDisplay.style.display = 'none';
      coordDisplay.style.visibility = 'hidden';
    }
    if (unitSwitcher) {
      unitSwitcher.style.display = 'none';
      unitSwitcher.style.visibility = 'hidden';
    }
    if (guideControls) {
      guideControls.style.display = 'none';
      guideControls.style.visibility = 'hidden';
    }
  }
}

/**
 * Update ruler marks - now uses Canvas rendering
 * Legacy function kept for compatibility, redirects to renderRulerMarks
 */
function updateRulerMarks() {
  renderRulerMarks();
}

/**
 * Create a ruler mark element
 */
function createRulerMark(position, orientation, step) {
  const mark = document.createElement('div');
  mark.className = 'ruler-mark';

  let value = position;
  let displayValue = formatValue(value, unitType);

  // Format large numbers
  if (value >= 1000) {
    displayValue = (value / 1000).toFixed(1) + 'k';
  }

  mark.textContent = displayValue;

  if (orientation === 'horizontal') {
    mark.style.left = `${position}px`;
    mark.style.transform = 'translateX(-50%)';
  } else {
    mark.style.top = `${position}px`;
    mark.style.transform = 'translateY(-50%) rotate(-90deg)';
  }

  // Add tooltip with multiple unit formats
  mark.title = `${position}px (${((position / step) * 100).toFixed(1)}%)`;

  return mark;
}

/**
 * Format value based on unit type
 */
function formatValue(value, unit) {
  switch (unit) {
    case '%':
      // Would need canvas dimensions to calculate percentage
      return `${value}`;
    case 'em':
      // Would need font size to calculate em
      return `${value}`;
    default:
      return `${value}`;
  }
}

/**
 * Update all guides - now uses Canvas rendering + DOM delete buttons
 */
function updateAllGuides() {
  // Remove old DOM guide elements (legacy cleanup)
  const existingGuides = document.querySelectorAll('.guide-line:not(.guide-horizontal):not(.guide-vertical)');
  existingGuides.forEach(guide => guide.remove());

  // Clear and recreate delete buttons (hybrid DOM/Canvas architecture)
  const deleteContainer = document.getElementById('guideDeleteButtons');
  if (deleteContainer) {
    deleteContainer.innerHTML = '';
  }

  // Create delete buttons for each guide
  RulerState.guides.forEach(guide => {
    createGuideDeleteButton(guide);
  });

  // Sync legacy guides array for backward compatibility
  guides = RulerState.guides.map(g => ({
    id: g.id,
    type: g.type === 'H' ? 'horizontal' : 'vertical',
    position: UnitConverter.pxToPercent(g.positionPx, g.type === 'H'),
    color: GUIDE_COLORS[g.colorIndex],
  }));

  // Trigger rerender (guides drawn on Canvas in RAF loop)
  RulerState.needsRerender = true;
}

/**
 * Create a guide line element
 */
function createGuideElement(guide) {
  const rulerOverlay = document.getElementById('rulerOverlay');
  if (!rulerOverlay) return;

  const guideEl = document.createElement('div');
  guideEl.className = `guide-line guide-${guide.type}`;
  guideEl.dataset.guideId = guide.id;
  guideEl.style.backgroundColor = guide.color || 'rgba(0, 255, 255, 0.4)';

  if (guide.type === 'horizontal') {
    guideEl.style.top = `${guide.position}%`;
    guideEl.style.left = '20px';
    guideEl.style.width = 'calc(100% - 20px)';
    guideEl.style.height = '2px';
    guideEl.style.cursor = 'ns-resize';
  } else {
    guideEl.style.left = `${guide.position}%`;
    guideEl.style.top = '24px';
    guideEl.style.width = '2px';
    guideEl.style.height = 'calc(100% - 24px)';
    guideEl.style.cursor = 'ew-resize';
  }

  // Make draggable
  makeGuideDraggable(guideEl, guide);

  // Add delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'guide-delete';
  deleteBtn.innerHTML = '×';
  deleteBtn.title = 'Delete guide';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    removeGuide(guide.id);
  });
  guideEl.appendChild(deleteBtn);

  rulerOverlay.appendChild(guideEl);
}

/**
 * Make a guide element draggable
 */
function makeGuideDraggable(guideEl, guide) {
  let isDragging = false;

  guideEl.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('guide-delete')) return;
    isDragging = true;
    e.preventDefault();

    const canvasWrapper = document.getElementById('canvasWrapper');
    if (!canvasWrapper) return;

    const rect = canvasWrapper.getBoundingClientRect();

    const handleMouseMove = (e) => {
      if (!isDragging) return;

      let newPosition;
      if (guide.type === 'horizontal') {
        const y = e.clientY - rect.top;
        newPosition = (y / rect.height) * 100;
      } else {
        const x = e.clientX - rect.left;
        newPosition = (x / rect.width) * 100;
      }

      // Snap to grid if enabled
      if (snapToGrid) {
        newPosition = snapToGridPosition(newPosition, guide.type);
      }

      guide.position = Math.max(0, Math.min(100, newPosition));
      updateGuidePosition(guideEl, guide);
      updateDistanceIndicators();
    };

    const handleMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  });
}

/**
 * Update guide position visually
 */
function updateGuidePosition(guideEl, guide) {
  if (guide.type === 'horizontal') {
    guideEl.style.top = `${guide.position}%`;
  } else {
    guideEl.style.left = `${guide.position}%`;
  }
}

/**
 * Snap position to grid
 */
function snapToGridPosition(position, type) {
  const canvasWrapper = document.getElementById('canvasWrapper');
  if (!canvasWrapper) return position;

  const rect = canvasWrapper.getBoundingClientRect();
  const totalSize = type === 'horizontal' ? rect.height : rect.width;
  const pixelPosition = (position / 100) * totalSize;
  const snappedPixel = Math.round(pixelPosition / gridSize) * gridSize;
  return (snappedPixel / totalSize) * 100;
}

/**
 * Add a new guide
 */
function addGuide(type, positionPx = null) {
  const canvasWrapper = document.getElementById('canvasWrapper');
  if (!canvasWrapper) return;

  const rect = canvasWrapper.getBoundingClientRect();
  const rulerOffsetX = 20;
  const rulerOffsetY = 24;

  // Default to center if no position provided
  if (positionPx === null) {
    if (type === 'horizontal' || type === 'H') {
      positionPx = (rect.height - rulerOffsetY) / 2;
      type = 'H'; // Normalize to 'H'
    } else {
      positionPx = (rect.width - rulerOffsetX) / 2;
      type = 'V'; // Normalize to 'V'
    }
  } else if (type === 'horizontal' || type === 'vertical') {
    // Convert legacy percentage to pixels if needed
    if (positionPx <= 1 && positionPx >= 0) {
      // Assume percentage
      positionPx = type === 'horizontal'
        ? UnitConverter.percentToPx(positionPx * 100, false)
        : UnitConverter.percentToPx(positionPx * 100, true);
    }
    type = type === 'horizontal' ? 'H' : 'V';
  }

  // Get next color index (cyclical)
  const colorIndex = RulerState.guides.length % GUIDE_COLORS.length;

  // Create guide with positionPx as source of truth
  const guide = new Guide(type, positionPx, colorIndex);
  RulerState.guides.push(guide);

  // Create DOM delete button (hybrid architecture)
  createGuideDeleteButton(guide);

  // Trigger rerender
  RulerState.needsRerender = true;

  // Debounced distance calculation
  debounceDistanceCalculation();
}

/**
 * Create DOM delete button for guide (hybrid architecture)
 */
function createGuideDeleteButton(guide) {
  const deleteContainer = document.getElementById('guideDeleteButtons');
  if (!deleteContainer) return;

  const btn = document.createElement('button');
  btn.className = 'guide-delete-btn';
  btn.dataset.guideId = guide.id;
  btn.innerHTML = '×';
  btn.title = 'Delete guide';
  btn.style.cssText = `
    position: absolute;
    width: 18px;
    height: 18px;
    background: rgba(255, 0, 0, 0.8);
    border: 1px solid rgba(255, 0, 0, 1);
    border-radius: 50%;
    color: white;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: auto;
    z-index: 11;
  `;

  const rulerOffsetX = 20;
  const rulerOffsetY = 24;

  if (guide.type === 'H') {
    btn.style.top = `${guide.positionPx + rulerOffsetY - 9}px`;
    btn.style.left = `${rulerOffsetX + 5}px`;
  } else {
    btn.style.left = `${guide.positionPx + rulerOffsetX - 9}px`;
    btn.style.top = `${rulerOffsetY + 5}px`;
  }

  // Show on hover (hit test via guideCanvas mousemove)
  const guideCanvas = document.getElementById('guideCanvas');
  if (guideCanvas) {
    const hoverHandler = (e) => {
      const rect = guideCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let isNear = false;
      if (guide.type === 'H') {
        const guideY = guide.positionPx + rulerOffsetY;
        isNear = Math.abs(y - guideY) <= 5;
      } else {
        const guideX = guide.positionPx + rulerOffsetX;
        isNear = Math.abs(x - guideX) <= 5;
      }

      btn.style.opacity = isNear ? '1' : '0';
    };

    guideCanvas.addEventListener('mousemove', hoverHandler);
    // Store handler for cleanup if needed
    btn._hoverHandler = hoverHandler;
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    removeGuide(guide.id);
  });

  deleteContainer.appendChild(btn);
}

/**
 * Debounced distance calculation (per spec - O(NlogN) deferred)
 */
function debounceDistanceCalculation() {
  if (RulerState.distanceCalcTimeout) {
    clearTimeout(RulerState.distanceCalcTimeout);
  }

  RulerState.distanceCalcTimeout = setTimeout(() => {
    RulerState.needsRerender = true;
  }, 50); // 50ms debounce
}

/**
 * Remove a guide
 */
function removeGuide(id) {
  RulerState.guides = RulerState.guides.filter(g => g.id !== id);

  // Sync legacy array
  guides = guides.filter(g => g.id !== id);

  // Remove DOM delete button
  const btn = document.querySelector(`[data-guide-id="${id}"]`);
  if (btn) btn.remove();

  // Remove legacy DOM guide element if exists
  const guideEl = document.querySelector(`.guide-line[data-guide-id="${id}"]`);
  if (guideEl) guideEl.remove();

  RulerState.needsRerender = true;
  debounceDistanceCalculation();
}

/**
 * Clear all guides (with confirmation per spec)
 */
function clearAllGuides() {
  // Confirmation dialog per specification
  if (!confirm('Clear all guides? This action cannot be undone.')) {
    return;
  }

  RulerState.guides = [];
  // Sync legacy variable
  guides = [];

  // Remove all guide elements and delete buttons
  document.querySelectorAll('.guide-line:not(.guide-horizontal):not(.guide-vertical)').forEach(el => el.remove());
  const deleteContainer = document.getElementById('guideDeleteButtons');
  if (deleteContainer) {
    deleteContainer.innerHTML = '';
  }

  RulerState.needsRerender = true;
  updateDistanceIndicators();
}

/**
 * Update distance indicators between guides
 */
function updateDistanceIndicators() {
  if (!showDistanceIndicators) return;

  // Remove existing indicators
  document.querySelectorAll('.distance-indicator').forEach(el => el.remove());

  // Calculate distances between horizontal guides
  const horizontalGuides = guides.filter(g => g.type === 'horizontal').sort((a, b) => a.position - b.position);
  for (let i = 0; i < horizontalGuides.length - 1; i++) {
    const distance = horizontalGuides[i + 1].position - horizontalGuides[i].position;
    createDistanceIndicator('horizontal', horizontalGuides[i].position, distance);
  }

  // Calculate distances between vertical guides
  const verticalGuides = guides.filter(g => g.type === 'vertical').sort((a, b) => a.position - b.position);
  for (let i = 0; i < verticalGuides.length - 1; i++) {
    const distance = verticalGuides[i + 1].position - verticalGuides[i].position;
    createDistanceIndicator('vertical', verticalGuides[i].position, distance);
  }
}

/**
 * Create a distance indicator
 */
function createDistanceIndicator(type, startPosition, distance) {
  const rulerOverlay = document.getElementById('rulerOverlay');
  if (!rulerOverlay) return;

  const indicator = document.createElement('div');
  indicator.className = 'distance-indicator';
  indicator.textContent = `${distance.toFixed(1)}%`;

  if (type === 'horizontal') {
    indicator.style.top = `${startPosition + distance / 2}%`;
    indicator.style.left = '30px';
  } else {
    indicator.style.left = `${startPosition + distance / 2}%`;
    indicator.style.top = '30px';
  }

  rulerOverlay.appendChild(indicator);
}

/**
 * Setup optimized mouse tracking (only updates state, rendering in RAF)
 */
function setupMouseTracking() {
  const canvasWrapper = document.getElementById('canvasWrapper');
  const canvasContainer = document.getElementById('canvasContainer');
  const container = canvasContainer || canvasWrapper;

  if (!container || !canvasWrapper) return;

  container.addEventListener('mousemove', (e) => {
    if (!RulerState.isActive) return;

    const rect = canvasWrapper.getBoundingClientRect();
    const rulerOffsetX = 20;
    const rulerOffsetY = 24;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Only update if mouse is within canvas bounds
    if (x >= rulerOffsetX && x <= rect.width && y >= rulerOffsetY && y <= rect.height) {
      // Update state only (lightweight operation)
      RulerState.cursorX = x - rulerOffsetX;
      RulerState.cursorY = y - rulerOffsetY;
      RulerState.cursorVisible = true;

      // Update coordinate display (DOM operation, fast)
      updateCoordinateDisplay(RulerState.cursorX, RulerState.cursorY);

      // Rendering happens in RAF loop
      RulerState.needsRerender = true;
    }
  });

  container.addEventListener('mouseenter', () => {
    if (RulerState.isActive) {
      RulerState.cursorVisible = true;
      RulerState.needsRerender = true;
    }
  });

  container.addEventListener('mouseleave', () => {
    RulerState.cursorVisible = false;
    RulerState.needsRerender = true;
  });
}

/**
 * Update coordinate display
 */
function updateCoordinateDisplay(x, y) {
  const coordDisplay = document.getElementById('coordinateDisplay');
  if (!coordDisplay) return;

  const xEl = coordDisplay.querySelector('.coord-x');
  const yEl = coordDisplay.querySelector('.coord-y');

  if (xEl) {
    const xPercent = UnitConverter.pxToPercent(x, true).toFixed(1);
    xEl.textContent = `X: ${Math.round(x)}px (${xPercent}%)`;
  }

  if (yEl) {
    const yPercent = UnitConverter.pxToPercent(y, false).toFixed(1);
    yEl.textContent = `Y: ${Math.round(y)}px (${yPercent}%)`;
  }
}

/**
 * Update crosshair cursor
 */
function updateCrosshair(x, y) {
  // Create or update crosshair elements
  let crosshairH = document.getElementById('crosshair-horizontal');
  let crosshairV = document.getElementById('crosshair-vertical');

  const canvasWrapper = document.getElementById('canvasWrapper');
  if (!canvasWrapper) return;

  const rect = canvasWrapper.getBoundingClientRect();
  const rulerOverlay = document.getElementById('rulerOverlay');
  if (!rulerOverlay) return;

  if (!crosshairH) {
    crosshairH = document.createElement('div');
    crosshairH.id = 'crosshair-horizontal';
    crosshairH.className = 'crosshair crosshair-horizontal';
    rulerOverlay.appendChild(crosshairH);
  }

  if (!crosshairV) {
    crosshairV = document.createElement('div');
    crosshairV.id = 'crosshair-vertical';
    crosshairV.className = 'crosshair crosshair-vertical';
    rulerOverlay.appendChild(crosshairV);
  }

  // Account for ruler offsets
  const rulerOffsetX = 20; // Vertical ruler width
  const rulerOffsetY = 24; // Horizontal ruler height

  // Position crosshair - coordinates are already adjusted for ruler offsets
  crosshairH.style.top = `${y + rulerOffsetY}px`;
  crosshairH.style.left = `${rulerOffsetX}px`;
  crosshairH.style.width = `${rect.width - rulerOffsetX}px`;
  crosshairH.style.display = 'block';

  crosshairV.style.left = `${x + rulerOffsetX}px`;
  crosshairV.style.top = `${rulerOffsetY}px`;
  crosshairV.style.height = `${rect.height - rulerOffsetY}px`;
  crosshairV.style.display = 'block';
}

/**
 * Hide crosshair
 */
function hideCrosshair() {
  const crosshairH = document.getElementById('crosshair-horizontal');
  const crosshairV = document.getElementById('crosshair-vertical');
  if (crosshairH) crosshairH.style.display = 'none';
  if (crosshairV) crosshairV.style.display = 'none';
}

/**
 * Setup guide dragging with Canvas hit testing
 */
function setupGuideDragging() {
  const guideCanvas = document.getElementById('guideCanvas');
  if (!guideCanvas) return;

  let draggedGuide = null;

  guideCanvas.addEventListener('mousedown', (e) => {
    if (!RulerState.isActive) return;

    const rect = guideCanvas.getBoundingClientRect();
    const rulerOffsetX = 20;
    const rulerOffsetY = 24;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Hit test: find guide within 5px tolerance
    for (const guide of RulerState.guides) {
      let distance = Infinity;
      if (guide.type === 'H') {
        const guideY = guide.positionPx + rulerOffsetY;
        distance = Math.abs(y - guideY);
      } else {
        const guideX = guide.positionPx + rulerOffsetX;
        distance = Math.abs(x - guideX);
      }

      if (distance <= 5) {
        draggedGuide = guide;
        guide.isDragging = true;
        guideCanvas.style.cursor = guide.type === 'H' ? 'ns-resize' : 'ew-resize';
        guideCanvas.style.pointerEvents = 'auto';
        break;
      }
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (!draggedGuide) return;

    const guideCanvas = document.getElementById('guideCanvas');
    if (!guideCanvas) return;

    const rect = guideCanvas.getBoundingClientRect();
    const rulerOffsetX = 20;
    const rulerOffsetY = 24;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let newPositionPx;
    if (draggedGuide.type === 'H') {
      newPositionPx = y - rulerOffsetY;
    } else {
      newPositionPx = x - rulerOffsetX;
    }

    // Apply snap-to-grid if enabled
    if (RulerState.snapEnabled) {
      newPositionPx = Math.round(newPositionPx / RulerState.gridSize) * RulerState.gridSize;
    }

    // Clamp to canvas bounds
    if (draggedGuide.type === 'H') {
      newPositionPx = Math.max(0, Math.min(rect.height - rulerOffsetY, newPositionPx));
    } else {
      newPositionPx = Math.max(0, Math.min(rect.width - rulerOffsetX, newPositionPx));
    }

    // Update positionPx (source of truth)
    draggedGuide.positionPx = newPositionPx;

    // Update delete button position
    const btn = document.querySelector(`[data-guide-id="${draggedGuide.id}"]`);
    if (btn) {
      if (draggedGuide.type === 'H') {
        btn.style.top = `${newPositionPx + rulerOffsetY - 9}px`;
      } else {
        btn.style.left = `${newPositionPx + rulerOffsetX - 9}px`;
      }
    }

    RulerState.needsRerender = true;
  });

  document.addEventListener('mouseup', () => {
    if (draggedGuide) {
      draggedGuide.isDragging = false;
      const guideCanvas = document.getElementById('guideCanvas');
      if (guideCanvas) {
        guideCanvas.style.cursor = '';
        guideCanvas.style.pointerEvents = 'none';
      }
      draggedGuide = null;
      debounceDistanceCalculation();
    }
  });
}

/**
 * Setup guide management buttons
 */
function setupGuideManagement() {
  const addHorizontalBtn = document.getElementById('addHorizontalGuide');
  const addVerticalBtn = document.getElementById('addVerticalGuide');
  const clearAllBtn = document.getElementById('clearAllGuides');
  const snapToggle = document.getElementById('snapToGridToggle');

  if (addHorizontalBtn) {
    addHorizontalBtn.addEventListener('click', () => addGuide('H'));
  }

  if (addVerticalBtn) {
    addVerticalBtn.addEventListener('click', () => addGuide('V'));
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearAllGuides);
  }

  if (snapToggle) {
    snapToggle.addEventListener('change', (e) => {
      RulerState.snapEnabled = e.target.checked;
      // Sync legacy variable
      snapToGrid = RulerState.snapEnabled;
    });
  }

  // Setup Canvas-based guide dragging
  setupGuideDragging();
}

/**
 * Setup unit switching
 */
function setupUnitSwitching() {
  const unitButtons = document.querySelectorAll('.unit-btn');
  unitButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      RulerState.currentUnit = btn.dataset.unit;
      // Sync legacy variable
      unitType = RulerState.currentUnit;

      unitButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Rerender ruler marks and update displays
      renderRulerMarks();
      updateCoordinateDisplay(RulerState.cursorX, RulerState.cursorY);
      RulerState.needsRerender = true;
    });
  });
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(e) {
  if (!isRulerActive) return;

  // Ignore if typing in input field
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  // H - Add horizontal guide
  if ((e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    addGuide('H');
  }

  // V - Add vertical guide
  if ((e.key === 'v' || e.key === 'V') && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    addGuide('V');
  }

  // C - Clear all guides (with confirmation)
  if ((e.key === 'c' || e.key === 'C') && !e.ctrlKey && !e.metaKey) {
    // Ignore if typing in input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    e.preventDefault();
    clearAllGuides();
  }

  // Delete/Backspace - Remove selected guide (if implemented)
  if ((e.key === 'Delete' || e.key === 'Backspace') && e.target.classList.contains('guide-line')) {
    const guideId = e.target.dataset.guideId;
    if (guideId) {
      removeGuide(guideId);
    }
  }
}

// Import getZoomLevel from preview.js
let getZoomLevelFn = null;

/**
 * Get current zoom level (helper function)
 */
async function getZoomLevel() {
  // Lazy import getZoomLevel from preview.js
  if (!getZoomLevelFn) {
    try {
      const previewModule = await import('./preview.js');
      if (previewModule && previewModule.getZoomLevel) {
        getZoomLevelFn = previewModule.getZoomLevel;
      }
    } catch (e) {
      // Module not available, use default
    }
  }

  if (getZoomLevelFn) {
    return getZoomLevelFn();
  }

  // Default zoom level
  return 1;
}

/**
 * Export functions for external use
 */
export function getRulerState() {
  return {
    isActive: RulerState.isActive,
    guides: RulerState.guides.map(g => ({
      id: g.id,
      type: g.type,
      positionPx: g.positionPx,
      colorIndex: g.colorIndex,
    })),
    currentUnit: RulerState.currentUnit,
    snapEnabled: RulerState.snapEnabled,
    gridSize: RulerState.gridSize,
  };
}

export function setRulerState(state) {
  if (state.isActive !== undefined && state.isActive !== RulerState.isActive) {
    toggleRuler();
  }
  if (state.guides) {
    RulerState.guides = state.guides.map(g => new Guide(g.type, g.positionPx, g.colorIndex));
    updateAllGuides();
  }
  if (state.currentUnit) {
    RulerState.currentUnit = state.currentUnit;
    renderRulerMarks();
  }
  if (state.snapEnabled !== undefined) {
    RulerState.snapEnabled = state.snapEnabled;
    const snapToggle = document.getElementById('snapToGridToggle');
    if (snapToggle) snapToggle.checked = state.snapEnabled;
  }
  if (state.gridSize) {
    RulerState.gridSize = state.gridSize;
  }
}


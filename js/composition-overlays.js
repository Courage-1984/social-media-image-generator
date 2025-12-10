/**
 * Composition Overlays Module
 * Provides various composition guides: Safe Areas, Aspect Ratios, Rule of Thirds, Golden Ratio, etc.
 */

// Composition Overlay State
const CompositionState = {
  isActive: false,
  currentOverlay: null, // 'safe-area', 'aspect-ratio', 'rule-of-thirds', 'phi-grid', 'fibonacci-spiral', 'golden-rectangle', 'fibonacci-circles', 'golden-triangle', 'dynamic-symmetry'
  safeAreaPlatform: 'facebook', // 'facebook', 'twitter', 'instagram'
  aspectRatio: '1:1', // '1:1', '16:9', '4:5', '9:16'
  rotation: 0, // Rotation angle in degrees (0-360)
  overlayCanvas: null,
  overlayCtx: null,
  canvasWidth: 0,
  canvasHeight: 0,
  rafId: null,
};

// Golden Ratio constant (Phi)
const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI; // ≈ 0.618

// Platform-specific safe area definitions (as percentage of canvas)
const SAFE_AREAS = {
  facebook: {
    // Facebook OG Image safe area (1200×630)
    // Keep important content within 80% of center
    horizontal: { start: 0.1, end: 0.9 },
    vertical: { start: 0.1, end: 0.9 },
  },
  twitter: {
    // Twitter Card safe area (1200×675)
    // Account for profile picture and text overlay
    horizontal: { start: 0.1, end: 0.9 },
    vertical: { start: 0.15, end: 0.85 }, // More top margin for profile
  },
  instagram: {
    // Instagram post safe area
    // Account for profile info and action buttons
    horizontal: { start: 0.05, end: 0.95 },
    vertical: { start: 0.1, end: 0.9 },
  },
};

// Aspect ratio definitions
const ASPECT_RATIOS = {
  '1:1': { width: 1, height: 1 },
  '16:9': { width: 16, height: 9 },
  '4:5': { width: 4, height: 5 },
  '9:16': { width: 9, height: 16 },
};

/**
 * Initialize composition overlay canvas
 */
function initializeCompositionCanvas() {
  const canvasWrapper = document.getElementById('canvasWrapper');
  if (!canvasWrapper) return;

  const rect = canvasWrapper.getBoundingClientRect();
  CompositionState.canvasWidth = rect.width;
  CompositionState.canvasHeight = rect.height;

  // Create or update overlay canvas
  if (!CompositionState.overlayCanvas) {
    CompositionState.overlayCanvas = document.createElement('canvas');
    CompositionState.overlayCanvas.id = 'compositionOverlayCanvas';
    CompositionState.overlayCanvas.className = 'composition-overlay-canvas';
    CompositionState.overlayCanvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 7;
    `;
    canvasWrapper.appendChild(CompositionState.overlayCanvas);
    CompositionState.overlayCtx = CompositionState.overlayCanvas.getContext('2d');
  }

  // Set canvas dimensions
  CompositionState.overlayCanvas.width = rect.width;
  CompositionState.overlayCanvas.height = rect.height;
}

/**
 * Clear overlay canvas
 */
function clearOverlay() {
  if (!CompositionState.overlayCtx || !CompositionState.overlayCanvas) return;
  CompositionState.overlayCtx.clearRect(
    0,
    0,
    CompositionState.overlayCanvas.width,
    CompositionState.overlayCanvas.height
  );
}

/**
 * Apply rotation transform to canvas context
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
function applyRotation(ctx, width, height) {
  if (CompositionState.rotation === 0) return;
  
  const centerX = width / 2;
  const centerY = height / 2;
  ctx.translate(centerX, centerY);
  ctx.rotate((CompositionState.rotation * Math.PI) / 180);
  ctx.translate(-centerX, -centerY);
}

/**
 * Draw safe area overlay
 */
function drawSafeAreaOverlay() {
  if (!CompositionState.overlayCtx || !CompositionState.overlayCanvas) return;

  const ctx = CompositionState.overlayCtx;
  const width = CompositionState.canvasWidth;
  const height = CompositionState.canvasHeight;
  const safeArea = SAFE_AREAS[CompositionState.safeAreaPlatform];

  // Calculate safe area bounds
  const left = width * safeArea.horizontal.start;
  const right = width * safeArea.horizontal.end;
  const top = height * safeArea.vertical.start;
  const bottom = height * safeArea.vertical.end;

  ctx.save();
  applyRotation(ctx, width, height);

  // Draw outer exclusion zones (semi-transparent)
  ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
  
  // Top zone
  ctx.fillRect(0, 0, width, top);
  // Bottom zone
  ctx.fillRect(0, bottom, width, height - bottom);
  // Left zone
  ctx.fillRect(0, top, left, bottom - top);
  // Right zone
  ctx.fillRect(right, top, width - right, bottom - top);

  // Draw safe area border
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(left, top, right - left, bottom - top);

  // Draw corner indicators
  ctx.setLineDash([]);
  ctx.lineWidth = 3;
  const cornerSize = 20;
  
  // Top-left
  ctx.beginPath();
  ctx.moveTo(left, top + cornerSize);
  ctx.lineTo(left, top);
  ctx.lineTo(left + cornerSize, top);
  ctx.stroke();
  
  // Top-right
  ctx.beginPath();
  ctx.moveTo(right - cornerSize, top);
  ctx.lineTo(right, top);
  ctx.lineTo(right, top + cornerSize);
  ctx.stroke();
  
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(left, bottom - cornerSize);
  ctx.lineTo(left, bottom);
  ctx.lineTo(left + cornerSize, bottom);
  ctx.stroke();
  
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(right - cornerSize, bottom);
  ctx.lineTo(right, bottom);
  ctx.lineTo(right, bottom - cornerSize);
  ctx.stroke();

  // Platform label
  ctx.fillStyle = 'rgba(0, 255, 0, 0.9)';
  ctx.font = '14px Rajdhani, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(
    `${CompositionState.safeAreaPlatform.toUpperCase()} Safe Area`,
    left + 10,
    top + 10
  );

  ctx.restore();
}

/**
 * Draw aspect ratio overlay
 */
function drawAspectRatioOverlay() {
  if (!CompositionState.overlayCtx || !CompositionState.overlayCanvas) return;

  const ctx = CompositionState.overlayCtx;
  const width = CompositionState.canvasWidth;
  const height = CompositionState.canvasHeight;
  const ratio = ASPECT_RATIOS[CompositionState.aspectRatio];

  // Calculate aspect ratio dimensions
  const targetAspect = ratio.width / ratio.height;
  const canvasAspect = width / height;

  let overlayWidth, overlayHeight, offsetX, offsetY;

  if (targetAspect > canvasAspect) {
    // Target is wider - fit to width
    overlayWidth = width;
    overlayHeight = width / targetAspect;
    offsetX = 0;
    offsetY = (height - overlayHeight) / 2;
  } else {
    // Target is taller - fit to height
    overlayHeight = height;
    overlayWidth = height * targetAspect;
    offsetX = (width - overlayWidth) / 2;
    offsetY = 0;
  }

  ctx.save();
  applyRotation(ctx, width, height);

  // Draw exclusion zones
  ctx.fillStyle = 'rgba(255, 165, 0, 0.2)';
  
  // Top
  if (offsetY > 0) {
    ctx.fillRect(0, 0, width, offsetY);
  }
  // Bottom
  if (offsetY + overlayHeight < height) {
    ctx.fillRect(0, offsetY + overlayHeight, width, height - (offsetY + overlayHeight));
  }
  // Left
  if (offsetX > 0) {
    ctx.fillRect(0, offsetY, offsetX, overlayHeight);
  }
  // Right
  if (offsetX + overlayWidth < width) {
    ctx.fillRect(offsetX + overlayWidth, offsetY, width - (offsetX + overlayWidth), overlayHeight);
  }

  // Draw aspect ratio border
  ctx.strokeStyle = 'rgba(255, 165, 0, 0.8)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(offsetX, offsetY, overlayWidth, overlayHeight);

  // Draw corner indicators
  ctx.setLineDash([]);
  ctx.lineWidth = 3;
  const cornerSize = 20;
  
  // Top-left
  ctx.beginPath();
  ctx.moveTo(offsetX, offsetY + cornerSize);
  ctx.lineTo(offsetX, offsetY);
  ctx.lineTo(offsetX + cornerSize, offsetY);
  ctx.stroke();
  
  // Top-right
  ctx.beginPath();
  ctx.moveTo(offsetX + overlayWidth - cornerSize, offsetY);
  ctx.lineTo(offsetX + overlayWidth, offsetY);
  ctx.lineTo(offsetX + overlayWidth, offsetY + cornerSize);
  ctx.stroke();
  
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(offsetX, offsetY + overlayHeight - cornerSize);
  ctx.lineTo(offsetX, offsetY + overlayHeight);
  ctx.lineTo(offsetX + cornerSize, offsetY + overlayHeight);
  ctx.stroke();
  
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(offsetX + overlayWidth - cornerSize, offsetY + overlayHeight);
  ctx.lineTo(offsetX + overlayWidth, offsetY + overlayHeight);
  ctx.lineTo(offsetX + overlayWidth, offsetY + overlayHeight - cornerSize);
  ctx.stroke();

  // Aspect ratio label
  ctx.fillStyle = 'rgba(255, 165, 0, 0.9)';
  ctx.font = '14px Rajdhani, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(
    `Aspect Ratio: ${CompositionState.aspectRatio}`,
    offsetX + 10,
    offsetY + 10
  );

  ctx.restore();
}

/**
 * Draw Rule of Thirds grid
 */
function drawRuleOfThirds() {
  if (!CompositionState.overlayCtx || !CompositionState.overlayCanvas) return;

  const ctx = CompositionState.overlayCtx;
  const width = CompositionState.canvasWidth;
  const height = CompositionState.canvasHeight;

  ctx.save();
  applyRotation(ctx, width, height);

  // Calculate third positions
  const thirdX = width / 3;
  const thirdY = height / 3;
  const twoThirdX = (width * 2) / 3;
  const twoThirdY = (height * 2) / 3;

  // Draw grid lines
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);

  // Vertical lines
  ctx.beginPath();
  ctx.moveTo(thirdX, 0);
  ctx.lineTo(thirdX, height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(twoThirdX, 0);
  ctx.lineTo(twoThirdX, height);
  ctx.stroke();

  // Horizontal lines
  ctx.beginPath();
  ctx.moveTo(0, thirdY);
  ctx.lineTo(width, thirdY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, twoThirdY);
  ctx.lineTo(width, twoThirdY);
  ctx.stroke();

  // Draw intersection points
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
  const pointSize = 6;

  // Top-left
  ctx.beginPath();
  ctx.arc(thirdX, thirdY, pointSize, 0, Math.PI * 2);
  ctx.fill();

  // Top-right
  ctx.beginPath();
  ctx.arc(twoThirdX, thirdY, pointSize, 0, Math.PI * 2);
  ctx.fill();

  // Bottom-left
  ctx.beginPath();
  ctx.arc(thirdX, twoThirdY, pointSize, 0, Math.PI * 2);
  ctx.fill();

  // Bottom-right
  ctx.beginPath();
  ctx.arc(twoThirdX, twoThirdY, pointSize, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw Phi Grid (Golden Section Grid)
 */
function drawPhiGrid() {
  if (!CompositionState.overlayCtx || !CompositionState.overlayCanvas) return;

  const ctx = CompositionState.overlayCtx;
  const width = CompositionState.canvasWidth;
  const height = CompositionState.canvasHeight;

  ctx.save();
  applyRotation(ctx, width, height);

  // Calculate golden section positions
  // The golden section divides a line so that the ratio of the whole to the larger part
  // equals the ratio of the larger part to the smaller part (PHI)
  const goldenSectionX = width * PHI_INV; // ≈ 0.618 of width
  const goldenSectionY = height * PHI_INV; // ≈ 0.618 of height

  // Draw grid lines
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);

  // Vertical lines
  ctx.beginPath();
  ctx.moveTo(goldenSectionX, 0);
  ctx.lineTo(goldenSectionX, height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width - goldenSectionX, 0);
  ctx.lineTo(width - goldenSectionX, height);
  ctx.stroke();

  // Horizontal lines
  ctx.beginPath();
  ctx.moveTo(0, goldenSectionY);
  ctx.lineTo(width, goldenSectionY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, height - goldenSectionY);
  ctx.lineTo(width, height - goldenSectionY);
  ctx.stroke();

  // Draw intersection points
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
  const pointSize = 7;

  const intersections = [
    { x: goldenSectionX, y: goldenSectionY },
    { x: width - goldenSectionX, y: goldenSectionY },
    { x: goldenSectionX, y: height - goldenSectionY },
    { x: width - goldenSectionX, y: height - goldenSectionY },
  ];

  intersections.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, pointSize, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Draw Fibonacci Spiral (Golden Spiral)
 */
function drawFibonacciSpiral() {
  if (!CompositionState.overlayCtx || !CompositionState.overlayCanvas) return;

  const ctx = CompositionState.overlayCtx;
  const width = CompositionState.canvasWidth;
  const height = CompositionState.canvasHeight;

  ctx.save();
  applyRotation(ctx, width, height);

  ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
  ctx.lineWidth = 2;
  ctx.setLineDash([]);

  // Draw Fibonacci spiral using golden rectangle method
  // Build rectangles in golden ratio, then draw arcs
  const minDimension = Math.min(width, height);
  const maxSize = minDimension * 0.9;
  
  // Start with largest rectangle and subdivide
  let x = 0;
  let y = 0;
  let w = width;
  let h = height;
  
  // Scale to fit canvas while maintaining golden ratio
  if (w / h > PHI) {
    // Canvas is wider - fit to height
    h = height;
    w = height * PHI;
    x = (width - w) / 2;
  } else {
    // Canvas is taller - fit to width
    w = width;
    h = width / PHI;
    y = (height - h) / 2;
  }
  
  ctx.beginPath();
  
  // Draw spiral by subdividing golden rectangles
  let currentW = w;
  let currentH = h;
  let currentX = x;
  let currentY = y;
  let angle = 0;
  const segments = 6; // Number of spiral segments
  
  // Start from bottom-right corner
  let spiralX = currentX + currentW;
  let spiralY = currentY + currentH;
  ctx.moveTo(spiralX, spiralY);
  
  for (let i = 0; i < segments; i++) {
    const radius = Math.min(currentW, currentH);
    const nextW = currentW * PHI_INV;
    const nextH = currentH * PHI_INV;
    
    // Determine arc center and direction
    const quarter = i % 4;
    let centerX, centerY, startAngle, endAngle;
    
    if (quarter === 0) {
      // Moving left (from right edge)
      centerX = currentX + currentW;
      centerY = currentY + currentH - radius;
      startAngle = Math.PI / 2;
      endAngle = Math.PI;
      spiralX = centerX - radius;
      spiralY = centerY;
      currentX += currentW - nextW;
      currentW = nextW;
    } else if (quarter === 1) {
      // Moving up (from bottom edge)
      centerX = currentX + currentW - radius;
      centerY = currentY + currentH;
      startAngle = Math.PI;
      endAngle = 3 * Math.PI / 2;
      spiralX = centerX;
      spiralY = centerY - radius;
      currentY += currentH - nextH;
      currentH = nextH;
    } else if (quarter === 2) {
      // Moving right (from left edge)
      centerX = currentX;
      centerY = currentY + radius;
      startAngle = 3 * Math.PI / 2;
      endAngle = 0;
      spiralX = centerX + radius;
      spiralY = centerY;
      currentW = nextW;
    } else {
      // Moving down (from top edge)
      centerX = currentX + radius;
      centerY = currentY;
      startAngle = 0;
      endAngle = Math.PI / 2;
      spiralX = centerX;
      spiralY = centerY + radius;
      currentH = nextH;
    }
    
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
  }
  
  ctx.stroke();

  // Draw focal point (center of spiral - golden ratio point)
  const focalX = x + w * PHI_INV;
  const focalY = y + h * PHI_INV;
  ctx.fillStyle = 'rgba(255, 215, 0, 1)';
  ctx.beginPath();
  ctx.arc(focalX, focalY, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw Golden Rectangle overlay
 */
function drawGoldenRectangle() {
  if (!CompositionState.overlayCtx || !CompositionState.overlayCanvas) return;

  const ctx = CompositionState.overlayCtx;
  const width = CompositionState.canvasWidth;
  const height = CompositionState.canvasHeight;

  ctx.save();
  applyRotation(ctx, width, height);

  // Calculate golden rectangle dimensions
  // A golden rectangle has sides in ratio 1:PHI
  let rectWidth, rectHeight, offsetX, offsetY;

  if (width / height > PHI) {
    // Canvas is wider than golden ratio - fit to height
    rectHeight = height;
    rectWidth = height * PHI;
    offsetX = (width - rectWidth) / 2;
    offsetY = 0;
  } else {
    // Canvas is taller - fit to width
    rectWidth = width;
    rectHeight = width / PHI;
    offsetX = 0;
    offsetY = (height - rectHeight) / 2;
  }

  // Draw golden rectangle
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(offsetX, offsetY, rectWidth, rectHeight);

  // Draw subdivision (showing how to create smaller golden rectangles)
  ctx.setLineDash([3, 3]);
  ctx.lineWidth = 1;

  // Vertical subdivision
  const subX = offsetX + rectWidth * PHI_INV;
  ctx.beginPath();
  ctx.moveTo(subX, offsetY);
  ctx.lineTo(subX, offsetY + rectHeight);
  ctx.stroke();

  // Horizontal subdivision
  const subY = offsetY + rectHeight * PHI_INV;
  ctx.beginPath();
  ctx.moveTo(offsetX, subY);
  ctx.lineTo(offsetX + rectWidth, subY);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw Fibonacci Circles
 */
function drawFibonacciCircles() {
  if (!CompositionState.overlayCtx || !CompositionState.overlayCanvas) return;

  const ctx = CompositionState.overlayCtx;
  const width = CompositionState.canvasWidth;
  const height = CompositionState.canvasHeight;

  ctx.save();
  applyRotation(ctx, width, height);

  // Fibonacci sequence: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144...
  // Scale to fit canvas
  const baseSize = Math.min(width, height) / 20;
  const fibonacci = [1, 1, 2, 3, 5, 8, 13];

  ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([2, 2]);

  // Draw circles in spiral pattern (starting from center)
  const centerX = width / 2;
  const centerY = height / 2;
  let currentX = centerX;
  let currentY = centerY;
  let direction = 0; // 0=right, 1=down, 2=left, 3=up

  fibonacci.forEach((fib, index) => {
    const radius = fib * baseSize;

    // Draw circle
    ctx.beginPath();
    ctx.arc(currentX, currentY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Move to next position for spiral
    if (index < fibonacci.length - 1) {
      const nextRadius = fibonacci[index + 1] * baseSize;
      const moveDistance = radius + nextRadius;

      switch (direction) {
        case 0: // Right
          currentX += moveDistance;
          break;
        case 1: // Down
          currentY += moveDistance;
          break;
        case 2: // Left
          currentX -= moveDistance;
          break;
        case 3: // Up
          currentY -= moveDistance;
          break;
      }

      direction = (direction + 1) % 4;
    }
  });

  ctx.restore();
}

/**
 * Draw Golden Triangle
 * Correct implementation: Main diagonal + 2 perpendicular lines at 90° angles
 */
function drawGoldenTriangle() {
  if (!CompositionState.overlayCtx || !CompositionState.overlayCanvas) return;

  const ctx = CompositionState.overlayCtx;
  const width = CompositionState.canvasWidth;
  const height = CompositionState.canvasHeight;

  ctx.save();
  applyRotation(ctx, width, height);

  ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);

  // Draw main diagonal from top-left to bottom-right
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, height);
  ctx.stroke();

  // Calculate perpendicular lines from other two corners
  // Diagonal line from (0,0) to (width, height): y = (height/width) * x
  // Perpendicular slope: -width/height
  
  const diagSlope = height / width;
  const perpSlope = -width / height;
  
  // Intersection point 1: from top-right corner (width, 0)
  // Perpendicular line: y - 0 = perpSlope * (x - width)
  // Diagonal: y = diagSlope * x
  // Solve: diagSlope * x = perpSlope * (x - width)
  // diagSlope * x = perpSlope * x - perpSlope * width
  // (diagSlope - perpSlope) * x = -perpSlope * width
  // x = (-perpSlope * width) / (diagSlope - perpSlope)
  const denom1 = diagSlope - perpSlope;
  const intX1 = (-perpSlope * width) / denom1;
  const intY1 = diagSlope * intX1;
  
  // Intersection point 2: from bottom-left corner (0, height)
  // Perpendicular line: y - height = perpSlope * (x - 0)
  // y = perpSlope * x + height
  // Diagonal: y = diagSlope * x
  // Solve: diagSlope * x = perpSlope * x + height
  // (diagSlope - perpSlope) * x = height
  const denom2 = diagSlope - perpSlope;
  const intX2 = height / denom2;
  const intY2 = diagSlope * intX2;

  // Draw perpendicular line from top-right corner
  ctx.beginPath();
  ctx.moveTo(width, 0);
  ctx.lineTo(intX1, intY1);
  ctx.stroke();

  // Draw perpendicular line from bottom-left corner
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(intX2, intY2);
  ctx.stroke();

  // Highlight intersection points (power points)
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
  const pointSize = 6;

  const points = [
    { x: intX1, y: intY1 },
    { x: intX2, y: intY2 },
  ];

  points.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, pointSize, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Draw Dynamic Symmetry grid
 * Correct implementation: Main diagonals + reciprocal lines (perpendicular at 90°)
 */
function drawDynamicSymmetry() {
  if (!CompositionState.overlayCtx || !CompositionState.overlayCanvas) return;

  const ctx = CompositionState.overlayCtx;
  const width = CompositionState.canvasWidth;
  const height = CompositionState.canvasHeight;

  ctx.save();
  applyRotation(ctx, width, height);

  ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);

  // Main diagonals (Baroque and Sinister)
  // Baroque diagonal: bottom-left to top-right
  const baroqueSlope = height / width;
  // Sinister diagonal: top-left to bottom-right
  const sinisterSlope = -height / width;

  // Draw Baroque diagonal (bottom-left to top-right)
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(width, 0);
  ctx.stroke();

  // Draw Sinister diagonal (top-left to bottom-right)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, height);
  ctx.stroke();

  // Calculate reciprocal lines (perpendicular to diagonals at 90°)
  // Reciprocal slope for Baroque: -width/height
  // Reciprocal slope for Sinister: width/height

  // Reciprocal 1: from top-left corner, perpendicular to Baroque diagonal
  // Baroque: y = height - baroqueSlope * x
  // Perpendicular: y = (width/height) * x
  // Intersection: height - baroqueSlope * x = (width/height) * x
  const baroquePerpSlope = -width / height;
  const rec1Slope = width / height;
  // Intersection with Baroque: height - baroqueSlope * x = rec1Slope * x
  const rec1X = height / (baroqueSlope + rec1Slope);
  const rec1Y = rec1Slope * rec1X;

  // Reciprocal 2: from top-right corner, perpendicular to Baroque diagonal
  // Line from (width, 0): y = baroquePerpSlope * (x - width)
  // Intersection with Baroque: height - baroqueSlope * x = baroquePerpSlope * (x - width)
  const rec2X = (height + baroquePerpSlope * width) / (baroqueSlope + Math.abs(baroquePerpSlope));
  const rec2Y = height - baroqueSlope * rec2X;

  // Reciprocal 3: from bottom-left corner, perpendicular to Sinister diagonal
  // Sinister: y = sinisterSlope * x + height (from (0, height))
  // Actually, Sinister from (0,0) to (width, height): y = baroqueSlope * x
  // Perpendicular from (0, height): y = baroquePerpSlope * x + height
  // Intersection: baroqueSlope * x = baroquePerpSlope * x + height
  const rec3X = height / (baroqueSlope - baroquePerpSlope);
  const rec3Y = baroqueSlope * rec3X;

  // Reciprocal 4: from bottom-right corner, perpendicular to Sinister diagonal
  // Line from (width, height): y - height = baroquePerpSlope * (x - width)
  // Intersection with Sinister: baroqueSlope * x = height + baroquePerpSlope * (x - width)
  const rec4X = (height - baroquePerpSlope * width) / (baroqueSlope - baroquePerpSlope);
  const rec4Y = baroqueSlope * rec4X;

  // Draw reciprocal lines
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(rec1X, rec1Y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width, 0);
  ctx.lineTo(rec2X, rec2Y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(rec3X, rec3Y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width, height);
  ctx.lineTo(rec4X, rec4Y);
  ctx.stroke();

  // Highlight key intersection points
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
  const pointSize = 5;

  const intersections = [
    { x: rec1X, y: rec1Y },
    { x: rec2X, y: rec2Y },
    { x: rec3X, y: rec3Y },
    { x: rec4X, y: rec4Y },
  ];

  intersections.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, pointSize, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Main render function
 */
function renderCompositionOverlay() {
  if (!CompositionState.isActive || !CompositionState.currentOverlay) {
    clearOverlay();
    return;
  }

  clearOverlay();

  switch (CompositionState.currentOverlay) {
    case 'safe-area':
      drawSafeAreaOverlay();
      break;
    case 'aspect-ratio':
      drawAspectRatioOverlay();
      break;
    case 'rule-of-thirds':
      drawRuleOfThirds();
      break;
    case 'phi-grid':
      drawPhiGrid();
      break;
    case 'fibonacci-spiral':
      drawFibonacciSpiral();
      break;
    case 'golden-rectangle':
      drawGoldenRectangle();
      break;
    case 'fibonacci-circles':
      drawFibonacciCircles();
      break;
    case 'golden-triangle':
      drawGoldenTriangle();
      break;
    case 'dynamic-symmetry':
      drawDynamicSymmetry();
      break;
  }
}

/**
 * Render loop using requestAnimationFrame
 */
function renderLoop() {
  if (!CompositionState.isActive) {
    CompositionState.rafId = null;
    return;
  }

  renderCompositionOverlay();
  CompositionState.rafId = requestAnimationFrame(renderLoop);
}

/**
 * Toggle composition overlay
 */
export function toggleCompositionOverlay(overlayType) {
  if (!overlayType) {
    // Toggle off
    CompositionState.isActive = false;
    CompositionState.currentOverlay = null;
    if (CompositionState.rafId) {
      cancelAnimationFrame(CompositionState.rafId);
      CompositionState.rafId = null;
    }
    clearOverlay();
    return;
  }

  // Toggle on or switch overlay
  if (CompositionState.currentOverlay === overlayType && CompositionState.isActive) {
    // Same overlay clicked - toggle off
    CompositionState.isActive = false;
    CompositionState.currentOverlay = null;
    if (CompositionState.rafId) {
      cancelAnimationFrame(CompositionState.rafId);
      CompositionState.rafId = null;
    }
    clearOverlay();
  } else {
    // Activate or switch overlay
    CompositionState.isActive = true;
    CompositionState.currentOverlay = overlayType;
    initializeCompositionCanvas();
    if (!CompositionState.rafId) {
      renderLoop();
    }
  }
}

/**
 * Set safe area platform
 */
export function setSafeAreaPlatform(platform) {
  CompositionState.safeAreaPlatform = platform;
  if (CompositionState.isActive && CompositionState.currentOverlay === 'safe-area') {
    renderCompositionOverlay();
  }
}

/**
 * Set aspect ratio
 */
export function setAspectRatio(ratio) {
  CompositionState.aspectRatio = ratio;
  if (CompositionState.isActive && CompositionState.currentOverlay === 'aspect-ratio') {
    renderCompositionOverlay();
  }
}

/**
 * Update canvas dimensions
 */
export function updateCompositionCanvasDimensions(width, height) {
  CompositionState.canvasWidth = width;
  CompositionState.canvasHeight = height;
  if (CompositionState.overlayCanvas) {
    CompositionState.overlayCanvas.width = width;
    CompositionState.overlayCanvas.height = height;
    // Re-initialize to ensure proper scaling
    initializeCompositionCanvas();
  }
  if (CompositionState.isActive) {
    renderCompositionOverlay();
  }
}

/**
 * Set rotation angle
 * @param {number} angle - Rotation angle in degrees (0-360)
 */
export function setCompositionRotation(angle) {
  CompositionState.rotation = angle % 360;
  if (CompositionState.rotation < 0) {
    CompositionState.rotation += 360;
  }
  if (CompositionState.isActive) {
    renderCompositionOverlay();
  }
}

/**
 * Get current overlay state
 */
export function getCompositionOverlayState() {
  return {
    isActive: CompositionState.isActive,
    currentOverlay: CompositionState.currentOverlay,
    safeAreaPlatform: CompositionState.safeAreaPlatform,
    aspectRatio: CompositionState.aspectRatio,
    rotation: CompositionState.rotation,
  };
}

/**
 * Initialize composition overlays system
 */
export function initCompositionOverlays() {
  // Canvas will be initialized when overlay is first activated
  // This function is called from main.js during initialization
}


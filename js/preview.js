/**
 * Preview Module
 * Handles canvas rendering and preview updates
 */

import { presets, glowColors, IMAGE_TYPES, colorPalette } from './config.js';
import { getSelectedColor, getSelectedColorKey } from './color-picker.js';
import { applyBackgroundPattern, backgroundPatterns } from './background-patterns.js';
import { isGridOverlayVisible, updateGridOverlayDimensions } from './grid-overlay.js';

let currentImageType = IMAGE_TYPES.OG;
let currentPreset = 'hero';

// Zoom state
let currentZoomLevel = 'fit'; // 'fit', 0.5-3.0 (0.1 increments)
let panX = 0;
let panY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;

/**
 * Set current image type
 * @param {Object} imageType - Image type from IMAGE_TYPES
 */
export function setImageType(imageType) {
  currentImageType = imageType;
}

/**
 * Set current preset
 * @param {string} preset - Preset key
 */
export function setPreset(preset) {
  currentPreset = preset;
}

/**
 * Create divider element
 * @param {number} y - Y position
 * @param {number} width - Divider width
 * @param {string} color - Divider color
 * @param {number} strokeWidth - Stroke width
 * @returns {HTMLElement} Divider element
 */
function createDivider(y, width, color, strokeWidth) {
  const divider = document.createElement('div');
  divider.style.cssText = `
    position: absolute;
    left: 50%;
    top: ${y}px;
    transform: translateX(-50%);
    width: ${width}px;
    height: ${strokeWidth}px;
    background: ${color};
    box-shadow: 0 0 10px ${color}80;
    z-index: 6;
  `;
  return divider;
}

/**
 * Get hue value from hex color for CSS filter
 * Improved accuracy for CSS filter colorization
 * @param {string} hex - Hex color (e.g., '#00ffff')
 * @returns {number} Hue value in degrees
 */
function getHueFromColor(hex) {
  // Ensure hex is a string
  if (typeof hex !== 'string') {
    console.warn('getHueFromColor: Expected string, got:', typeof hex, hex);
    return 180; // Default to cyan hue
  }

  // Remove # if present and handle 3-digit hex
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  // Validate hex string length
  if (hex.length !== 6) {
    console.warn('getHueFromColor: Invalid hex length:', hex);
    return 180; // Default to cyan hue
  }

  // Convert to RGB (0-255)
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Normalize to 0-1
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      hue = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      hue = (bNorm - rNorm) / delta + 2;
    } else {
      hue = (rNorm - gNorm) / delta + 4;
    }
  }

  // Convert to degrees and normalize
  hue = hue * 60;
  if (hue < 0) {
    hue += 360;
  }

  // Round to nearest integer for better filter accuracy
  return Math.round(hue);
}

/**
 * Apply logo positioning
 * @param {HTMLElement} logo - Logo element
 * @param {string} position - Position key
 * @param {number} size - Logo size
 */
function applyLogoPosition(logo, position, size) {
  logo.style.width = `${size}px`;
  logo.style.height = `${size}px`;
  logo.style.opacity = '1'; // Reset opacity

  switch (position) {
    case 'top-left':
      logo.style.top = '40px';
      logo.style.left = '40px';
      logo.style.right = 'auto';
      logo.style.bottom = 'auto';
      logo.style.transform = 'none';
      break;
    case 'top-center':
      logo.style.top = '40px';
      logo.style.left = '50%';
      logo.style.right = 'auto';
      logo.style.bottom = 'auto';
      logo.style.transform = 'translateX(-50%)';
      break;
    case 'top-right':
      logo.style.top = '40px';
      logo.style.right = '40px';
      logo.style.left = 'auto';
      logo.style.bottom = 'auto';
      logo.style.transform = 'none';
      break;
    case 'center-left':
      logo.style.top = '50%';
      logo.style.left = '40px';
      logo.style.right = 'auto';
      logo.style.bottom = 'auto';
      logo.style.transform = 'translateY(-50%)';
      break;
    case 'center':
      logo.style.top = '50%';
      logo.style.left = '50%';
      logo.style.right = 'auto';
      logo.style.bottom = 'auto';
      logo.style.transform = 'translate(-50%, -50%)';
      logo.style.opacity = '0.3';
      break;
    case 'center-right':
      logo.style.top = '50%';
      logo.style.right = '40px';
      logo.style.left = 'auto';
      logo.style.bottom = 'auto';
      logo.style.transform = 'translateY(-50%)';
      break;
    case 'bottom-left':
      logo.style.bottom = '40px';
      logo.style.left = '40px';
      logo.style.right = 'auto';
      logo.style.top = 'auto';
      logo.style.transform = 'none';
      break;
    case 'bottom-center':
      logo.style.bottom = '40px';
      logo.style.left = '50%';
      logo.style.right = 'auto';
      logo.style.top = 'auto';
      logo.style.transform = 'translateX(-50%)';
      break;
    case 'bottom-right':
      logo.style.bottom = '40px';
      logo.style.right = '40px';
      logo.style.left = 'auto';
      logo.style.top = 'auto';
      logo.style.transform = 'none';
      break;
  }
}

/**
 * Create background effects
 * @param {HTMLElement} container - Canvas container
 * @param {Object} preset - Preset configuration
 * @param {string} titleColor - Title color
 * @param {string} subtitleColor - Subtitle color
 */
function createBackgroundEffects(container, preset, titleColor, subtitleColor) {
  if (preset.hasBlobs) {
    const blob1 = document.createElement('div');
    blob1.style.cssText = `
      position: absolute;
      width: 65%;
      height: 65%;
      top: -15%;
      left: -10%;
      background: radial-gradient(circle at 30% 30%, ${titleColor}40 0%, transparent 65%),
                  radial-gradient(circle at 80% 70%, ${subtitleColor}40 0%, transparent 70%);
      filter: blur(90px);
      opacity: 0.45;
      pointer-events: none;
    `;
    container.appendChild(blob1);

    if (currentImageType === IMAGE_TYPES.TWITTER) {
      const blob2 = document.createElement('div');
      blob2.style.cssText = `
        position: absolute;
        width: 55%;
        height: 55%;
        bottom: -20%;
        right: -5%;
        background: radial-gradient(circle at 20% 50%, ${titleColor}40 0%, transparent 60%),
                    radial-gradient(circle at 70% 30%, ${subtitleColor}40 0%, transparent 70%);
        filter: blur(90px);
        opacity: 0.45;
        pointer-events: none;
      `;
      container.appendChild(blob2);
    }
  }

  if (preset.hasParticles) {
    const particleCount = currentPreset === 'cyberpunk'
      ? (currentImageType === IMAGE_TYPES.OG ? 30 : 35)
      : (currentImageType === IMAGE_TYPES.OG ? 20 : 25);

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const x = Math.random() * currentImageType.width;
      const y = Math.random() * currentImageType.height;
      const size = Math.random() * 3 + 1;
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: ${titleColor};
        border-radius: 50%;
        box-shadow: 0 0 10px ${titleColor}80;
        pointer-events: none;
      `;
      container.appendChild(particle);
    }
  }

  if (preset.hasGrid) {
    const grid = document.createElement('div');
    grid.style.cssText = `
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(${titleColor}20 1px, transparent 1px),
        linear-gradient(90deg, ${titleColor}20 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
    `;
    container.appendChild(grid);
  }

  if (preset.hasWaves) {
    const waveCount = currentImageType === IMAGE_TYPES.OG ? 3 : 4;
    for (let i = 0; i < waveCount; i++) {
      const wave = document.createElement('div');
      const spacing = currentImageType === IMAGE_TYPES.OG ? 100 : 120;
      wave.style.cssText = `
        position: absolute;
        bottom: ${i * spacing}px;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, ${titleColor}40, transparent);
        opacity: 0.6;
        pointer-events: none;
      `;
      container.appendChild(wave);
    }
  }

  if (preset.hasMatrix) {
    const lineCount = currentImageType === IMAGE_TYPES.OG ? 15 : 18;
    const spacing = currentImageType === IMAGE_TYPES.OG ? 80 : 67;
    for (let i = 0; i < lineCount; i++) {
      const line = document.createElement('div');
      line.style.cssText = `
        position: absolute;
        left: ${i * spacing}px;
        top: -100px;
        width: 2px;
        height: ${currentImageType === IMAGE_TYPES.OG ? 200 : 250}px;
        background: linear-gradient(180deg, ${titleColor}80, transparent);
        animation: matrixFall ${3 + Math.random() * 2}s linear infinite;
        pointer-events: none;
      `;
      container.appendChild(line);
    }
  }
}

/**
 * Update preview canvas
 * @param {Object} state - Current generator state
 */
export function updatePreview(state) {
  const {
    title,
    subtitle,
    slogan,
    logoPosition,
    logoSize,
    logoColor,
    titleSize,
    subtitleSize,
    sloganSize,
    titleGlow,
    subtitleGlow,
    sloganGlow,
    dividerAboveTitle,
    dividerBelowTitle,
    dividerAboveSubtitle,
    dividerBelowSubtitle,
    dividerAboveSlogan,
    dividerBelowSlogan,
    dividerWidth,
    titleDividerWidth,
    subtitleDividerWidth,
    sloganDividerWidth,
    titleDividerColor,
    subtitleDividerColor,
    sloganDividerColor,
    sloganOffsetX,
    sloganOffsetY,
    backgroundPattern,
    patternOpacity,
    patternSize,
    patternRotation,
    patternBlendMode,
    patternOffsetX,
    patternOffsetY,
    patternSpacing,
    patternDensity,
    patternBlur,
    patternScale,
    patternRepeat,
    patternIntensity,
  } = state;

  const canvasWrapper = document.getElementById('canvasWrapper');
  if (!canvasWrapper) return;

  const preset = presets[currentPreset];
  const titleColor = getSelectedColor('titleColorPicker');
  const subtitleColor = getSelectedColor('subtitleColorPicker');
  const sloganColor = getSelectedColor('sloganColorPicker');
  const dividerColor = getSelectedColor('dividerColorPicker');
  // Use individual divider colors if available, otherwise fall back to shared divider color
  const titleDividerColorValue = titleDividerColor ? getSelectedColor('titleDividerColorPicker') : dividerColor;
  const subtitleDividerColorValue = subtitleDividerColor ? getSelectedColor('subtitleDividerColorPicker') : dividerColor;
  const sloganDividerColorValue = sloganDividerColor ? getSelectedColor('sloganDividerColorPicker') : dividerColor;
  // Use individual divider widths if available, otherwise fall back to shared divider width
  const titleDividerWidthValue = (titleDividerWidth !== undefined && titleDividerWidth !== null) ? titleDividerWidth : dividerWidth;
  const subtitleDividerWidthValue = (subtitleDividerWidth !== undefined && subtitleDividerWidth !== null) ? subtitleDividerWidth : dividerWidth;
  const sloganDividerWidthValue = (sloganDividerWidth !== undefined && sloganDividerWidth !== null) ? sloganDividerWidth : dividerWidth;

  const titleColorKey = getSelectedColorKey('titleColorPicker');
  const subtitleColorKey = getSelectedColorKey('subtitleColorPicker');
  const sloganColorKey = getSelectedColorKey('sloganColorPicker');

  // Check if grid overlay is visible before clearing
  const gridWasVisible = isGridOverlayVisible();

  // CRITICAL: Preserve container dimensions to prevent CLS during rebuild
  const container = document.getElementById('canvasContainer');

  // CRITICAL: Preserve container's current size by setting explicit min-height
  // This prevents the container from collapsing when canvas content is cleared
  if (container) {
    const currentHeight = container.offsetHeight;
    const currentWidth = container.offsetWidth;
    // Temporarily set explicit dimensions to prevent collapse
    container.style.setProperty('min-height', `${currentHeight}px`, 'important');
    container.style.setProperty('min-width', `${currentWidth}px`, 'important');
  }

  // Set dimensions BEFORE clearing to prevent layout shift
  const canvasClass = currentImageType === IMAGE_TYPES.OG ? 'og-canvas' : 'twitter-canvas';
  canvasWrapper.className = `${canvasClass} preset-${currentPreset}`;

  // CRITICAL: Set full dimensions with !important BEFORE clearing innerHTML to prevent CLS
  // Also preserve current transform to prevent visual jump
  const currentTransform = canvasWrapper.style.transform || '';
  canvasWrapper.style.setProperty('width', `${currentImageType.width}px`, 'important');
  canvasWrapper.style.setProperty('height', `${currentImageType.height}px`, 'important');
  canvasWrapper.style.setProperty('max-width', 'none', 'important');
  canvasWrapper.style.setProperty('max-height', 'none', 'important');
  canvasWrapper.style.setProperty('min-width', `${currentImageType.width}px`, 'important');
  canvasWrapper.style.setProperty('min-height', `${currentImageType.height}px`, 'important');
  canvasWrapper.style.setProperty('box-sizing', 'content-box', 'important');
  canvasWrapper.style.setProperty('flex-shrink', '0', 'important');
  canvasWrapper.style.setProperty('flex-grow', '0', 'important');
  canvasWrapper.style.setProperty('overflow', 'visible', 'important');
  // Keep current transform temporarily to prevent visual jump
  if (currentTransform) {
    canvasWrapper.style.setProperty('transform', currentTransform, 'important');
  }

  // Now clear and rebuild - dimensions are already set to prevent CLS
  canvasWrapper.innerHTML = '';

  // Restore container min dimensions after a brief delay (will be reset by scaleCanvasForPreview)
  if (container) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Reset min dimensions - aspect-ratio will handle sizing
        container.style.removeProperty('min-height');
        container.style.removeProperty('min-width');
      });
    });
  }

  // Apply background pattern or preset background
  // Validate that backgroundPattern is a non-empty string
  const hasPattern = state.backgroundPattern &&
                     typeof state.backgroundPattern === 'string' &&
                     state.backgroundPattern.trim() !== '';

  // Debug logging
  if (hasPattern) {
    console.log('[updatePreview] Applying pattern:', state.backgroundPattern, 'State:', {
      patternOpacity,
      patternSize,
      patternColor: state.patternColor,
      hasPattern
    });
  } else {
    console.log('[updatePreview] No pattern, using preset. backgroundPattern value:', state.backgroundPattern);
  }

  if (hasPattern) {
    // Clear preset background styles first - use removeProperty for better clearing
    canvasWrapper.style.removeProperty('background');
    canvasWrapper.style.removeProperty('background-image');
    canvasWrapper.style.removeProperty('background-size');
    canvasWrapper.style.removeProperty('background-position');
    canvasWrapper.style.removeProperty('background-repeat');
    canvasWrapper.style.removeProperty('mix-blend-mode');
    canvasWrapper.style.removeProperty('filter');

    // Get pattern color - use pattern color picker if available, otherwise fall back to title color
    let patternColorHex = titleColor || '#00ffff'; // Fallback to cyan if titleColor is also unavailable
    try {
      const patternColorFromPicker = getSelectedColor('patternColorPicker');
      if (patternColorFromPicker) {
        patternColorHex = patternColorFromPicker;
      }
    } catch (e) {
      // Color picker not initialized yet, use title color or cyan fallback
      if (!patternColorHex || patternColorHex === '') {
        patternColorHex = '#00ffff'; // Ensure we always have a valid color
      }
    }

    // Final safety check - ensure we have a valid hex color
    if (!patternColorHex || patternColorHex === '' || !patternColorHex.startsWith('#')) {
      patternColorHex = '#00ffff'; // Default to cyan
    }

    // Get pattern customization options
    // Apply intensity to opacity (intensity is 0-200%, so 100% = no change)
    const intensityMultiplier = patternIntensity !== undefined ? patternIntensity / 100 : 1;
    const baseOpacity = (patternOpacity !== undefined ? patternOpacity : 20) / 100;
    const adjustedOpacity = Math.min(1, baseOpacity * intensityMultiplier);

    const patternOptions = {
      opacity: adjustedOpacity,
      size: patternSize !== undefined ? patternSize : 50,
      rotation: patternRotation !== undefined ? patternRotation : 0,
      blendMode: patternBlendMode || 'normal',
      offsetX: patternOffsetX !== undefined ? patternOffsetX : 0,
      offsetY: patternOffsetY !== undefined ? patternOffsetY : 0,
      spacing: patternSpacing !== undefined ? patternSpacing : 0,
      density: patternDensity !== undefined ? patternDensity : 1,
      blur: patternBlur !== undefined ? patternBlur : 0,
      scale: patternScale !== undefined ? patternScale / 100 : 1,
      repeat: patternRepeat || 'repeat',
      intensity: patternIntensity !== undefined ? patternIntensity : 100,
    };

    // Validate pattern key exists before applying
    // Double-check that we have a valid pattern key (defensive programming)
    const patternKey = state.backgroundPattern && typeof state.backgroundPattern === 'string'
      ? state.backgroundPattern.trim()
      : '';

    if (patternKey && patternKey !== '' && backgroundPatterns[patternKey]) {
      // Apply the pattern (this will set background, backgroundImage, backgroundSize)
      applyBackgroundPattern(canvasWrapper, patternKey, patternColorHex, patternOptions);
    } else {
      console.warn('[updatePreview] Invalid pattern key, cannot apply pattern:', {
        patternKey,
        statePattern: state.backgroundPattern,
        patternExists: patternKey ? !!backgroundPatterns[patternKey] : false,
        availablePatterns: Object.keys(backgroundPatterns).slice(0, 5)
      });
      // Fall back to preset background if pattern is invalid
      canvasWrapper.style.background = preset.bg || '#0a0a0a';
    }
  } else {
    // Use preset background - clear pattern styles first
    canvasWrapper.style.backgroundImage = '';
    canvasWrapper.style.transform = '';
    canvasWrapper.style.background = preset.bg || '#0a0a0a';
    canvasWrapper.style.backgroundSize = '';
    canvasWrapper.style.backgroundPosition = '';
    canvasWrapper.style.backgroundRepeat = '';
    canvasWrapper.style.mixBlendMode = '';
    canvasWrapper.style.filter = '';
    if (preset.backgroundSize) {
      canvasWrapper.style.backgroundSize = preset.backgroundSize;
    }
  }

  if (preset.border) {
    canvasWrapper.style.border = preset.border;
  } else {
    canvasWrapper.style.border = 'none';
  }

  // Update CSS variable for matrix animation
  document.documentElement.style.setProperty('--canvas-height', `${currentImageType.height}px`);

  // Background effects
  createBackgroundEffects(canvasWrapper, preset, titleColor, subtitleColor);

  // Logo
  if (logoPosition !== 'hidden') {
    // Use CSS Masking for accurate colorization (100% color fidelity)
    // This is superior to CSS filters: more accurate, better performance, direct hex support
    const logoContainer = document.createElement('div');
    logoContainer.style.cssText = 'position: absolute; z-index: 10;';

    // Use custom uploaded logo if available, otherwise use default white logo
    // Logo is in root directory, HTML is in generate/ folder
    const logoUrl = window.customLogoUrl || '../logo-white.svg';

    // Get logo color hex value
    let logoColorHex = '#ffffff'; // Default to white
    if (logoColor && typeof logoColor === 'string') {
      const colorObj = colorPalette[logoColor];
      if (colorObj) {
        logoColorHex = colorObj.hex || (typeof colorObj === 'string' ? colorObj : '#ffffff');
      }
    }

    // Apply CSS Masking technique:
    // 1. Set background-color to the target hex color (100% accurate)
    // 2. Use mask-image with the SVG to create a stencil effect
    // 3. The background color shows through only where the mask is opaque
    logoContainer.className = 'logo-masked'; // Add class for export identification
    logoContainer.dataset.logoUrl = logoUrl; // Store logo URL for export
    logoContainer.dataset.logoColor = logoColorHex; // Store color for export
    logoContainer.dataset.layer = 'logo'; // Add layer identifier for visibility toggle
    logoContainer.style.backgroundColor = logoColorHex;
    logoContainer.style.webkitMaskImage = `url(${logoUrl})`;
    logoContainer.style.maskImage = `url(${logoUrl})`;
    logoContainer.style.webkitMaskSize = 'contain';
    logoContainer.style.maskSize = 'contain';
    logoContainer.style.webkitMaskRepeat = 'no-repeat';
    logoContainer.style.maskRepeat = 'no-repeat';
    logoContainer.style.webkitMaskPosition = 'center';
    logoContainer.style.maskPosition = 'center';

    // For uploaded logos that might be PNG/JPEG (not SVG), use luminance mode
    // This interprets white pixels as opaque and black as transparent
    if (logoUrl && (logoUrl.includes('.png') || logoUrl.includes('.jpg') || logoUrl.includes('.jpeg'))) {
      logoContainer.style.webkitMaskMode = 'luminance';
      logoContainer.style.maskMode = 'luminance';
    }
    // For SVG files, alpha mode is default (works with transparent backgrounds)

    // Apply positioning and sizing
    applyLogoPosition(logoContainer, logoPosition, logoSize);

    // Append to DOM
    canvasWrapper.appendChild(logoContainer);
  }

  // Calculate positions with alignment offsets
  const centerY = currentImageType.height / 2;
  const centerX = currentImageType.width / 2;
  const titleOffsetX = state.titleOffsetX || 0;
  const titleOffsetY = state.titleOffsetY || 0;
  const subtitleOffsetX = state.subtitleOffsetX || 0;
  const subtitleOffsetY = state.subtitleOffsetY || 0;
  const sloganOffsetXValue = state.sloganOffsetX || 0;
  const sloganOffsetYValue = state.sloganOffsetY || 0;

  let titleY = centerY - (currentImageType === IMAGE_TYPES.OG ? 40 : 45) + titleOffsetY;
  let titleX = centerX + titleOffsetX;
  let subtitleY = centerY + (currentImageType === IMAGE_TYPES.OG ? 80 : 90) + subtitleOffsetY;
  let subtitleX = centerX + subtitleOffsetX;
  let sloganX = centerX + sloganOffsetXValue;
  let sloganY = centerY + (currentImageType === IMAGE_TYPES.OG ? 140 : 150) + sloganOffsetYValue;

  // Title
  const titleEl = document.createElement('div');
  titleEl.dataset.layer = 'title'; // Add layer identifier for visibility toggle
  titleEl.textContent = title || 'Logi-Ink';
  const titleGlowStyle =
    titleGlow && glowColors[titleColorKey]
      ? `0 0 30px ${titleColor}80, 0 0 60px ${titleColor}40, 0 0 90px ${glowColors[titleColorKey]}`
      : '';
  titleEl.style.cssText = `
    position: absolute;
    top: ${titleY}px;
    left: ${titleX}px;
    transform: translate(-50%, -50%);
    font-family: 'Orbitron', sans-serif;
    font-size: ${titleSize}px;
    font-weight: 900;
    color: ${titleColor};
    text-shadow: ${titleGlowStyle};
    text-transform: uppercase;
    letter-spacing: 4px;
    text-align: center;
    z-index: 5;
    max-width: 1000px;
    padding: 0 ${currentImageType === IMAGE_TYPES.OG ? 40 : 45}px;
  `;
  canvasWrapper.appendChild(titleEl);

  // Dividers for title
  if (dividerAboveTitle) {
    const divider = createDivider(titleY - (currentImageType === IMAGE_TYPES.OG ? 30 : 35), 400, titleDividerColorValue, titleDividerWidthValue);
    divider.dataset.layer = 'title'; // Add layer identifier for visibility toggle
    canvasWrapper.appendChild(divider);
  }
  if (dividerBelowTitle) {
    const divider = createDivider(titleY + (currentImageType === IMAGE_TYPES.OG ? 30 : 35), 400, titleDividerColorValue, titleDividerWidthValue);
    divider.dataset.layer = 'title'; // Add layer identifier for visibility toggle
    canvasWrapper.appendChild(divider);
  }

  // Subtitle
  const subtitleEl = document.createElement('div');
  subtitleEl.dataset.layer = 'subtitle'; // Add layer identifier for visibility toggle
  subtitleEl.textContent = subtitle || 'Digital Innovation & Creative Solutions';
  const subtitleGlowStyle =
    subtitleGlow && glowColors[subtitleColorKey]
      ? `0 0 20px ${subtitleColor}60, 0 0 40px ${glowColors[subtitleColorKey]}`
      : '';
  subtitleEl.style.cssText = `
    position: absolute;
    top: ${subtitleY}px;
    left: ${subtitleX}px;
    transform: translateX(-50%);
    font-family: 'Rajdhani', sans-serif;
    font-size: ${subtitleSize}px;
    font-weight: 400;
    color: ${subtitleColor};
    text-shadow: ${subtitleGlowStyle};
    text-align: center;
    z-index: 5;
    max-width: 900px;
    padding: 0 ${currentImageType === IMAGE_TYPES.OG ? 40 : 45}px;
  `;
  canvasWrapper.appendChild(subtitleEl);

  // Dividers for subtitle
  if (dividerAboveSubtitle) {
    const divider = createDivider(subtitleY - (currentImageType === IMAGE_TYPES.OG ? 20 : 25), 350, subtitleDividerColorValue, subtitleDividerWidthValue);
    divider.dataset.layer = 'subtitle'; // Add layer identifier for visibility toggle
    canvasWrapper.appendChild(divider);
  }
  if (dividerBelowSubtitle) {
    const divider = createDivider(subtitleY + (currentImageType === IMAGE_TYPES.OG ? 20 : 25), 350, subtitleDividerColorValue, subtitleDividerWidthValue);
    divider.dataset.layer = 'subtitle'; // Add layer identifier for visibility toggle
    canvasWrapper.appendChild(divider);
  }

  // Slogan
  if (slogan) {
    const sloganEl = document.createElement('div');
    sloganEl.dataset.layer = 'slogan'; // Add layer identifier for visibility toggle
    sloganEl.textContent = slogan;
    const sloganGlowStyle =
      sloganGlow && glowColors[sloganColorKey]
        ? `0 0 15px ${sloganColor}50, 0 0 30px ${glowColors[sloganColorKey]}`
        : '';
    sloganEl.style.cssText = `
      position: absolute;
      top: ${sloganY}px;
      left: ${sloganX}px;
      transform: translateX(-50%);
      font-family: 'Rajdhani', sans-serif;
      font-size: ${sloganSize}px;
      font-weight: 300;
      color: ${sloganColor};
      text-shadow: ${sloganGlowStyle};
      text-align: center;
      z-index: 5;
      max-width: 800px;
      padding: 0 ${currentImageType === IMAGE_TYPES.OG ? 40 : 45}px;
      font-style: italic;
    `;
    canvasWrapper.appendChild(sloganEl);

    // Dividers for slogan
    if (dividerAboveSlogan) {
      const divider = createDivider(sloganY - (currentImageType === IMAGE_TYPES.OG ? 15 : 20), 300, sloganDividerColorValue, sloganDividerWidthValue);
      divider.dataset.layer = 'slogan'; // Add layer identifier for visibility toggle
      canvasWrapper.appendChild(divider);
    }
    if (dividerBelowSlogan) {
      const divider = createDivider(sloganY + (currentImageType === IMAGE_TYPES.OG ? 15 : 20), 300, sloganDividerColorValue, sloganDividerWidthValue);
      divider.dataset.layer = 'slogan'; // Add layer identifier for visibility toggle
      canvasWrapper.appendChild(divider);
    }
  }

  // Scale canvas to fit 16:9 preview container - use requestAnimationFrame for better synchronization
  // This prevents CLS by ensuring scaling happens in sync with the browser's paint cycle
  // Use triple RAF to ensure all DOM updates and layout calculations are complete
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Triple RAF ensures DOM is fully updated, painted, and layout is stable before scaling
        scaleCanvasForPreview(canvasWrapper);

        // Restore grid overlay if it was visible before the update
        if (gridWasVisible) {
          updateGridOverlayDimensions(currentImageType.width, currentImageType.height);
        }

        // Apply layer visibility after rendering
        // Note: applyLayerVisibility is defined in main.js and will be called via global scope
        if (window.applyLayerVisibility) {
          window.applyLayerVisibility();
        }
      });
    });
  });
}

/**
 * Scale canvas to fit 16:9 preview container
 * @param {HTMLElement} canvasWrapper - Canvas wrapper element
 */
export function scaleCanvasForPreview(canvasWrapper) {
  if (!canvasWrapper) return;

  // Use consistent container lookup (same as setZoomLevel)
  const container = document.getElementById('canvasContainer');
  if (!container) return;

  // Check if we're in the preview column
  const previewColumn = container.closest('.preview-column');
  if (!previewColumn) {
    // Not in preview column, remove any scaling
    canvasWrapper.style.setProperty('transform', '', 'important');
    canvasWrapper.style.setProperty('width', `${currentImageType.width}px`, 'important');
    canvasWrapper.style.setProperty('height', `${currentImageType.height}px`, 'important');
    canvasWrapper.style.setProperty('max-width', 'none', 'important');
    canvasWrapper.style.setProperty('max-height', 'none', 'important');
    return;
  }

  // CRITICAL: Ensure canvas maintains full dimensions for export
  // The DOM element must be full size, only visually scaled
  canvasWrapper.style.setProperty('width', `${currentImageType.width}px`, 'important');
  canvasWrapper.style.setProperty('height', `${currentImageType.height}px`, 'important');
  canvasWrapper.style.setProperty('max-width', 'none', 'important');
  canvasWrapper.style.setProperty('max-height', 'none', 'important');
  canvasWrapper.style.setProperty('min-width', `${currentImageType.width}px`, 'important');
  canvasWrapper.style.setProperty('min-height', `${currentImageType.height}px`, 'important');
  canvasWrapper.style.setProperty('box-sizing', 'content-box', 'important');
  canvasWrapper.style.setProperty('flex-shrink', '0', 'important');
  canvasWrapper.style.setProperty('flex-grow', '0', 'important');
  canvasWrapper.style.setProperty('overflow', 'visible', 'important');

  // CRITICAL: Force layout calculation and ensure container maintains stable size
  // This prevents CLS by ensuring container dimensions are stable before calculating scale
  void container.offsetHeight;
  void container.offsetWidth;

  // Get container dimensions (accounting for padding: 0.75rem = 12px)
  const containerRect = container.getBoundingClientRect();

  // Ensure container has dimensions
  if (containerRect.width === 0 || containerRect.height === 0) {
    // Container not ready, try again with requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      scaleCanvasForPreview(canvasWrapper);
    });
    return;
  }

  // CRITICAL: Ensure container maintains its aspect-ratio-based size during scaling
  // This prevents the container from shifting when canvas content changes
  const expectedHeight = containerRect.width / (16 / 9);
  if (Math.abs(containerRect.height - expectedHeight) > 1) {
    // Container height doesn't match aspect ratio - force recalculation
    container.style.setProperty('height', `${expectedHeight}px`, 'important');
  }

  const padding = 24; // 12px * 2 (0.75rem padding on each side)
  const containerWidth = containerRect.width - padding;
  const containerHeight = containerRect.height - padding;

  // Get canvas dimensions (should be full size)
  const canvasWidth = currentImageType.width;
  const canvasHeight = currentImageType.height;

  let scale;
  // Always use top-left origin for consistency
  const transformOrigin = '0 0';

  // Handle manual zoom levels
  if (currentZoomLevel === 'fit') {
    // Calculate scale to fit both width and height (use the smaller scale to ensure it fits)
    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    scale = Math.min(scaleX, scaleY);
    // Only scale down, never scale up
    if (scale > 1) {
      scale = 1;
    }
    // Reset pan when fitting
    panX = 0;
    panY = 0;
  } else {
    // Manual zoom level (0.5-3.0 in 0.1 increments)
    scale = currentZoomLevel;
  }

  // Apply scale and pan transform
  if (scale > 0 && isFinite(scale)) {
    // Calculate center offset to position scaled canvas in center of container
    // Account for container padding (0.75rem = 12px)
    const padding = 12; // 0.75rem in pixels
    const scaledWidth = canvasWidth * scale;
    const scaledHeight = canvasHeight * scale;
    const centerOffsetX = (containerWidth - scaledWidth) / 2 + padding;
    const centerOffsetY = (containerHeight - scaledHeight) / 2 + padding;

    // For 'fit' mode, just use center offset (panX = 0)
    // For zoom modes, add pan offset to center offset
    const adjustedPanX = centerOffsetX + panX;
    const adjustedPanY = centerOffsetY + panY;

    const transform = `translate(${adjustedPanX}px, ${adjustedPanY}px) scale(${scale})`;
    canvasWrapper.style.setProperty('transform', transform, 'important');
    canvasWrapper.style.setProperty('transform-origin', transformOrigin, 'important');

    // Enable panning cursor when zoomed in
    if (currentZoomLevel !== 'fit') {
      canvasWrapper.style.cursor = isPanning ? 'grabbing' : 'grab';
      container.style.overflow = 'hidden'; // Enable scrolling/panning
    } else {
      canvasWrapper.style.cursor = '';
      container.style.overflow = 'visible';
    }
  } else {
    canvasWrapper.style.setProperty('transform', '', 'important');
  }
}

/**
 * Set zoom level
 * @param {string|number} level - Zoom level: 'fit', or 0.5-3.0 (0.1 increments)
 */
export function setZoomLevel(level) {
  const canvasWrapper = document.getElementById('canvasWrapper');
  const container = document.getElementById('canvasContainer');

  if (!canvasWrapper || !container) {
    console.warn('setZoomLevel: canvasWrapper or container not found');
    return;
  }

  // Get current container dimensions for calculations
  const containerRect = container.getBoundingClientRect();
  const padding = 24;
  const containerWidth = containerRect.width - padding;
  const containerHeight = containerRect.height - padding;
  const canvasWidth = currentImageType.width;
  const canvasHeight = currentImageType.height;

  // If zooming in/out, preserve the center point of the visible area
  if (level !== 'fit' && currentZoomLevel !== level) {
    // Calculate the center point of the visible container
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    if (currentZoomLevel === 'fit') {
      // When switching from 'fit' to a zoom level, preserve what's at the center
      // In 'fit' mode, the canvas is scaled to fit, so we need to calculate
      // which canvas point is currently at the container center
      const fitScaleX = containerWidth / canvasWidth;
      const fitScaleY = containerHeight / canvasHeight;
      const fitScale = Math.min(fitScaleX, fitScaleY, 1); // Don't scale up

      // In 'fit' mode with panX=0, the canvas is centered
      // The center of the canvas maps to the center of the container
      const canvasCenterX = canvasWidth / 2;
      const canvasCenterY = canvasHeight / 2;

      // Calculate new pan to keep canvas center at container center
      const newScale = typeof level === 'number' ? level : 1;
      const newScaledWidth = canvasWidth * newScale;
      const newScaledHeight = canvasHeight * newScale;
      const newCenterOffsetX = (containerWidth - newScaledWidth) / 2;
      const newCenterOffsetY = (containerHeight - newScaledHeight) / 2;

      // To keep canvas center at container center:
      // centerX = newCenterOffsetX + newPanX + canvasCenterX * newScale
      // So: newPanX = centerX - newCenterOffsetX - canvasCenterX * newScale
      let newPanX = centerX - newCenterOffsetX - canvasCenterX * newScale;
      let newPanY = centerY - newCenterOffsetY - canvasCenterY * newScale;

      // Constrain pan to valid bounds
      const maxPanX = Math.max(0, (newScaledWidth - containerWidth) / 2);
      const maxPanY = Math.max(0, (newScaledHeight - containerHeight) / 2);
      newPanX = Math.max(-maxPanX, Math.min(maxPanX, newPanX));
      newPanY = Math.max(-maxPanY, Math.min(maxPanY, newPanY));

      panX = newPanX;
      panY = newPanY;
    } else {
      // Calculate the center point of the visible container
      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;

      // Current transform: translate(centerOffset + panX, centerOffset + panY) scale(oldScale)
      // A point at container center (centerX, centerY) maps to canvas coordinates:
      // canvasX = (centerX - centerOffset - panX) / oldScale
      const oldScale = typeof currentZoomLevel === 'number' ? currentZoomLevel : 1;
      const oldScaledWidth = canvasWidth * oldScale;
      const oldScaledHeight = canvasHeight * oldScale;
      const oldCenterOffsetX = (containerWidth - oldScaledWidth) / 2;
      const oldCenterOffsetY = (containerHeight - oldScaledHeight) / 2;

      // Calculate the canvas point that's currently at the viewport center
      // With transform: translate(centerOffset + panX, centerOffset + panY) scale(scale)
      // A container point (cx, cy) maps to canvas: (cx - centerOffset - panX) / scale
      const canvasX = (centerX - oldCenterOffsetX - panX) / oldScale;
      const canvasY = (centerY - oldCenterOffsetY - panY) / oldScale;

      // Calculate new pan to keep the same canvas point at the center
      const newScale = typeof level === 'number' ? level : 1;
      const newScaledWidth = canvasWidth * newScale;
      const newScaledHeight = canvasHeight * newScale;
      const newCenterOffsetX = (containerWidth - newScaledWidth) / 2;
      const newCenterOffsetY = (containerHeight - newScaledHeight) / 2;

      // For new transform to map canvasX to centerX:
      // centerX = newCenterOffsetX + newPanX + canvasX * newScale
      // Solving for newPanX: newPanX = centerX - newCenterOffsetX - canvasX * newScale
      let newPanX = centerX - newCenterOffsetX - canvasX * newScale;
      let newPanY = centerY - newCenterOffsetY - canvasY * newScale;

      // Constrain pan to valid bounds before updating
      const maxPanX = Math.max(0, (newScaledWidth - containerWidth) / 2);
      const maxPanY = Math.max(0, (newScaledHeight - containerHeight) / 2);
      newPanX = Math.max(-maxPanX, Math.min(maxPanX, newPanX));
      newPanY = Math.max(-maxPanY, Math.min(maxPanY, newPanY));

      // Update pan
      panX = newPanX;
      panY = newPanY;
    }
  } else if (level === 'fit') {
    // Reset pan when fitting
    panX = 0;
    panY = 0;
  }

  // Update zoom level
  currentZoomLevel = level;

  // Apply the zoom
  if (canvasWrapper) {
    scaleCanvasForPreview(canvasWrapper);
    // Update grid and rulers if they're visible
    if (isGridOverlayVisible()) {
      updateGridOverlayDimensions(currentImageType.width, currentImageType.height);
    }
  }
}

/**
 * Get current zoom level
 * @returns {string|number} Current zoom level
 */
export function getZoomLevel() {
  return currentZoomLevel;
}

/**
 * Cycle to next zoom level
 * @returns {string|number} New zoom level
 */
export function cycleZoomLevel() {
  // More granular zoom levels with smaller increments (0.1 steps from 0.5 to 3.0)
  const levels = [
    'fit',
    0.5, 0.6, 0.7, 0.8, 0.9,
    1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9,
    2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9,
    3.0
  ];
  const currentIndex = levels.indexOf(currentZoomLevel);
  const nextIndex = (currentIndex + 1) % levels.length;
  const newLevel = levels[nextIndex];
  setZoomLevel(newLevel);
  return newLevel;
}

/**
 * Set pan position
 * @param {number} x - X pan offset
 * @param {number} y - Y pan offset
 */
export function setPan(x, y) {
  panX = x;
  panY = y;
  const canvasWrapper = document.getElementById('canvasWrapper');
  if (canvasWrapper) {
    scaleCanvasForPreview(canvasWrapper);
  }
}

/**
 * Get pan position
 * @returns {Object} Pan position {x, y}
 */
export function getPan() {
  return { x: panX, y: panY };
}



/**
 * Main Module
 * Initializes the generator and handles events
 */

import { IMAGE_TYPES, presets, colorPalette } from './config.js';

/**
 * Get a random color key from the color palette
 * Excludes text colors (text-secondary, text-muted) for better visibility
 * @returns {string} Random color key
 */
function getRandomColorKey() {
  const colorKeys = Object.keys(colorPalette).filter(
    key => !key.startsWith('text-') && key !== 'white'
  );
  const randomIndex = Math.floor(Math.random() * colorKeys.length);
  return colorKeys[randomIndex];
}
import { createColorPicker, getSelectedColorKey, setSelectedColor } from './color-picker.js';
import {
  updatePreview,
  setImageType,
  setPreset,
  scaleCanvasForPreview,
  cycleZoomLevel,
  getZoomLevel,
  setZoomLevel,
  setPan,
  getPan,
} from './preview.js';
import { exportImage } from './export.js';
import { loadHtml2Canvas } from './export.js';
import {
  toggleGridOverlay,
  updateGridOverlayDimensions,
  isGridOverlayVisible,
} from './grid-overlay.js';
import {
  backgroundPatterns,
  applyBackgroundPattern,
  patternDefaults,
} from './background-patterns.js';
import {
  savePreset,
  loadPreset,
  deletePreset,
  getSavedPresets,
  presetExists,
} from './preset-storage.js';
import {
  addToHistory,
  undo,
  redo,
  canUndo,
  canRedo,
  initHistory,
  getHistory,
  getStateAt,
  setHistoryIndex,
  getHistoryIndex,
} from './history.js';
import { getAllTemplates, applyTemplate } from './templates.js';
import { initPatternPreview } from './pattern-preview-tooltip.js';
import { initCustomPatternDropdown } from './custom-pattern-dropdown.js';
import { initCustomTemplateDropdown } from './custom-template-dropdown.js';
import { initCustomExportQualityDropdown } from './custom-export-quality-dropdown.js';
import { initCustomLogoPositionDropdown } from './custom-logo-position-dropdown.js';
import {
  initCustomLogoColorDropdown,
  setSelectedColor as setLogoColor,
  getSelectedColorKey as getLogoColorKey,
} from './custom-logo-color-dropdown.js';
import {
  showPopoutPreview,
  hidePopoutPreview,
  togglePopoutPreview,
  syncPopoutPreview,
  isPopoutOpenState,
} from './preview-popout.js';
import { initTabs } from './tabs.js';
import { initPatternSettingsTooltips } from './pattern-settings-tooltip.js';
import { createCustomPresetDropdown } from './custom-preset-dropdown.js';
import { showToast } from './utils/toast.js';
import { initButtonTooltips } from './button-tooltips.js';
import { initRulerGuides } from './ruler-guides.js';
import {
  initCompositionOverlays,
  toggleCompositionOverlay,
  setSafeAreaPlatform,
  setAspectRatio,
  setCompositionRotation,
  updateCompositionCanvasDimensions,
  getCompositionOverlayState,
} from './composition-overlays.js';

// Export for preview.js
window.updateCompositionCanvasDimensions = updateCompositionCanvasDimensions;

// State
let currentImageType = IMAGE_TYPES.OG;
let currentState = {
  title: 'Logi-Ink',
  subtitle: 'Digital Innovation & Creative Solutions',
  slogan: 'Transforming Ideas Into Reality',
  logoX: 40,
  logoY: 40,
  logoSize: 120,
  logoColor: 'cyan',
  titleSize: 72,
  subtitleSize: 28,
  sloganSize: 20,
  logoGlow: false,
  titleGlow: false,
  subtitleGlow: false,
  sloganGlow: false,
  dividerAboveTitle: false,
  dividerBelowTitle: false,
  dividerAboveSubtitle: false,
  dividerBelowSubtitle: false,
  dividerAboveSlogan: false,
  dividerBelowSlogan: false,
  dividerWidth: 2,
  titleDividerWidth: 2,
  subtitleDividerWidth: 2,
  sloganDividerWidth: 2,
  titleDividerColor: 'cyan',
  subtitleDividerColor: 'cyan',
  sloganDividerColor: 'cyan',
  titleDividerGlow: false,
  subtitleDividerGlow: false,
  sloganDividerGlow: false,
  titleDividerGap: 30,
  subtitleDividerGap: 20,
  sloganDividerGap: 15,
  dividerAboveTitleX: null,
  dividerAboveTitleY: null,
  dividerBelowTitleX: null,
  dividerBelowTitleY: null,
  dividerAboveSubtitleX: null,
  dividerAboveSubtitleY: null,
  dividerBelowSubtitleX: null,
  dividerBelowSubtitleY: null,
  dividerAboveSloganX: null,
  dividerAboveSloganY: null,
  dividerBelowSloganX: null,
  dividerBelowSloganY: null,
  titleX: 600,
  titleY: 315,
  subtitleX: 600,
  subtitleY: 395,
  sloganX: 600,
  sloganY: 455,
  backgroundPattern: '',
  patternColor: '',
  patternOpacity: 20,
  patternSize: 50,
  patternRotation: 0,
  patternBlendMode: 'normal',
  patternOffsetX: 0,
  patternOffsetY: 0,
  patternSpacing: 0,
  patternDensity: 1,
  patternBlur: 0,
  patternScale: 100,
  patternRepeat: 'repeat',
  patternIntensity: 100,
  exportQuality: 2,
};

// DOM Elements
let titleInput, subtitleInput, sloganInput;
let titleSizeSlider, titleSizeValue, subtitleSizeSlider, subtitleSizeValue;
let sloganSizeSlider, sloganSizeValue, logoSizeSlider, logoSizeValue;
let logoXSlider, logoXValue, logoYSlider, logoYValue;
let logoGlow, titleGlow, subtitleGlow, sloganGlow;
let dividerAboveTitle, dividerBelowTitle, dividerAboveSubtitle, dividerBelowSubtitle;
let dividerAboveSlogan, dividerBelowSlogan;
let dividerWidthSlider, dividerWidthValue;
let titleDividerWidthSlider, titleDividerWidthValue;
let subtitleDividerWidthSlider, subtitleDividerWidthValue;
let sloganDividerWidthSlider, sloganDividerWidthValue;
let titleDividerGlow, subtitleDividerGlow, sloganDividerGlow;
let titleDividerGapSlider, titleDividerGapValue;
let subtitleDividerGapSlider, subtitleDividerGapValue;
let sloganDividerGapSlider, sloganDividerGapValue;
let dividerAboveTitleXSlider, dividerAboveTitleXValue, dividerAboveTitleYSlider, dividerAboveTitleYValue;
let dividerBelowTitleXSlider, dividerBelowTitleXValue, dividerBelowTitleYSlider, dividerBelowTitleYValue;
let dividerAboveSubtitleXSlider, dividerAboveSubtitleXValue, dividerAboveSubtitleYSlider, dividerAboveSubtitleYValue;
let dividerBelowSubtitleXSlider, dividerBelowSubtitleXValue, dividerBelowSubtitleYSlider, dividerBelowSubtitleYValue;
let dividerAboveSloganXSlider, dividerAboveSloganXValue, dividerAboveSloganYSlider, dividerAboveSloganYValue;
let dividerBelowSloganXSlider, dividerBelowSloganXValue, dividerBelowSloganYSlider, dividerBelowSloganYValue;
let exportBtn, copyBtn, randomBtn, undoBtn, redoBtn, gridToggleBtn, popoutBtn;
let copyClipboardBtn, fullscreenBtn;
let rulerToggleBtn, historyTimelineBtn, closeHistoryBtn;
let contrastToggleBtn, transparencyCheckerBtn, layerVisibilityBtn, closeLayerVisibilityBtn;
let compositionOverlaysBtn, closeCompositionOverlaysBtn;
let safeAreaPlatformSelect, aspectRatioSelect;
let exportQualitySelect;
let hardRefreshBtn;
let randomizeBtn, resetBtn, logoUploadBtn, logoUploadInput;
let customLogoUrl = null; // Store uploaded logo URL - exported to preview.js
let titleXSlider, titleXValue, titleYSlider, titleYValue;
let subtitleXSlider, subtitleXValue, subtitleYSlider, subtitleYValue;
let sloganXSlider, sloganXValue, sloganYSlider, sloganYValue;
let resetTitlePosBtn, resetSubtitlePosBtn, resetSloganPosBtn;
let templateSelect, backgroundPatternSelect;
let patternCustomization, patternColorPicker;
let patternOpacitySlider, patternOpacityValue;
let patternSizeSlider, patternSizeValue;
let patternRotationSlider, patternRotationValue;
let patternBlendModeSelect;
let patternOffsetXSlider, patternOffsetXValue;
let patternOffsetYSlider, patternOffsetYValue;
let patternSpacingSlider, patternSpacingValue;
let patternDensitySlider, patternDensityValue;
let patternBlurSlider, patternBlurValue;
let patternScaleSlider, patternScaleValue;
let patternRepeatSelect;
let patternIntensitySlider, patternIntensityValue;
let patternSettingsToggle, patternSettingsContent;
let presetNameInput, savePresetBtn, loadPresetBtn, deletePresetBtn, savedPresetsSelect;
let customPresetDropdown = null;

/**
 * Initialize DOM references
 */
function initDOMElements() {
  titleInput = document.getElementById('title');
  subtitleInput = document.getElementById('subtitle');
  sloganInput = document.getElementById('slogan');
  logoXSlider = document.getElementById('logoX');
  logoXValue = document.getElementById('logoXValue');
  logoYSlider = document.getElementById('logoY');
  logoYValue = document.getElementById('logoYValue');
  titleSizeSlider = document.getElementById('titleSize');
  titleSizeValue = document.getElementById('titleSizeValue');
  subtitleSizeSlider = document.getElementById('subtitleSize');
  subtitleSizeValue = document.getElementById('subtitleSizeValue');
  sloganSizeSlider = document.getElementById('sloganSize');
  sloganSizeValue = document.getElementById('sloganSizeValue');
  logoSizeSlider = document.getElementById('logoSize');
  logoSizeValue = document.getElementById('logoSizeValue');
  logoGlow = document.getElementById('logoGlow');
  titleGlow = document.getElementById('titleGlow');
  subtitleGlow = document.getElementById('subtitleGlow');
  sloganGlow = document.getElementById('sloganGlow');
  dividerAboveTitle = document.getElementById('dividerAboveTitle');
  dividerBelowTitle = document.getElementById('dividerBelowTitle');
  dividerAboveSubtitle = document.getElementById('dividerAboveSubtitle');
  dividerBelowSubtitle = document.getElementById('dividerBelowSubtitle');
  dividerAboveSlogan = document.getElementById('dividerAboveSlogan');
  dividerBelowSlogan = document.getElementById('dividerBelowSlogan');
  dividerWidthSlider = document.getElementById('dividerWidth');
  dividerWidthValue = document.getElementById('dividerWidthValue');
  titleDividerWidthSlider = document.getElementById('titleDividerWidth');
  titleDividerWidthValue = document.getElementById('titleDividerWidthValue');
  subtitleDividerWidthSlider = document.getElementById('subtitleDividerWidth');
  subtitleDividerWidthValue = document.getElementById('subtitleDividerWidthValue');
  sloganDividerWidthSlider = document.getElementById('sloganDividerWidth');
  sloganDividerWidthValue = document.getElementById('sloganDividerWidthValue');
  titleDividerGlow = document.getElementById('titleDividerGlow');
  subtitleDividerGlow = document.getElementById('subtitleDividerGlow');
  sloganDividerGlow = document.getElementById('sloganDividerGlow');
  titleDividerGapSlider = document.getElementById('titleDividerGap');
  titleDividerGapValue = document.getElementById('titleDividerGapValue');
  subtitleDividerGapSlider = document.getElementById('subtitleDividerGap');
  subtitleDividerGapValue = document.getElementById('subtitleDividerGapValue');
  sloganDividerGapSlider = document.getElementById('sloganDividerGap');
  sloganDividerGapValue = document.getElementById('sloganDividerGapValue');
  dividerAboveTitleXSlider = document.getElementById('dividerAboveTitleX');
  dividerAboveTitleXValue = document.getElementById('dividerAboveTitleXValue');
  dividerAboveTitleYSlider = document.getElementById('dividerAboveTitleY');
  dividerAboveTitleYValue = document.getElementById('dividerAboveTitleYValue');
  dividerBelowTitleXSlider = document.getElementById('dividerBelowTitleX');
  dividerBelowTitleXValue = document.getElementById('dividerBelowTitleXValue');
  dividerBelowTitleYSlider = document.getElementById('dividerBelowTitleY');
  dividerBelowTitleYValue = document.getElementById('dividerBelowTitleYValue');
  dividerAboveSubtitleXSlider = document.getElementById('dividerAboveSubtitleX');
  dividerAboveSubtitleXValue = document.getElementById('dividerAboveSubtitleXValue');
  dividerAboveSubtitleYSlider = document.getElementById('dividerAboveSubtitleY');
  dividerAboveSubtitleYValue = document.getElementById('dividerAboveSubtitleYValue');
  dividerBelowSubtitleXSlider = document.getElementById('dividerBelowSubtitleX');
  dividerBelowSubtitleXValue = document.getElementById('dividerBelowSubtitleXValue');
  dividerBelowSubtitleYSlider = document.getElementById('dividerBelowSubtitleY');
  dividerBelowSubtitleYValue = document.getElementById('dividerBelowSubtitleYValue');
  dividerAboveSloganXSlider = document.getElementById('dividerAboveSloganX');
  dividerAboveSloganXValue = document.getElementById('dividerAboveSloganXValue');
  dividerAboveSloganYSlider = document.getElementById('dividerAboveSloganY');
  dividerAboveSloganYValue = document.getElementById('dividerAboveSloganYValue');
  dividerBelowSloganXSlider = document.getElementById('dividerBelowSloganX');
  dividerBelowSloganXValue = document.getElementById('dividerBelowSloganXValue');
  dividerBelowSloganYSlider = document.getElementById('dividerBelowSloganY');
  dividerBelowSloganYValue = document.getElementById('dividerBelowSloganYValue');
  exportBtn = document.getElementById('exportBtn');
  copyBtn = document.getElementById('copyBtn');
  randomBtn = document.getElementById('randomBtn');
  undoBtn = document.getElementById('undoBtn');
  redoBtn = document.getElementById('redoBtn');
  gridToggleBtn = document.getElementById('gridToggleBtn');
  popoutBtn = document.getElementById('popoutBtn');
  copyClipboardBtn = document.getElementById('copyClipboardBtn');
  fullscreenBtn = document.getElementById('fullscreenBtn');
  rulerToggleBtn = document.getElementById('rulerToggleBtn');
  historyTimelineBtn = document.getElementById('historyTimelineBtn');
  contrastToggleBtn = document.getElementById('contrastToggleBtn');
  transparencyCheckerBtn = document.getElementById('transparencyCheckerBtn');
  layerVisibilityBtn = document.getElementById('layerVisibilityBtn');
  closeHistoryBtn = document.getElementById('closeHistoryBtn');
  closeLayerVisibilityBtn = document.getElementById('closeLayerVisibilityBtn');
  compositionOverlaysBtn = document.getElementById('compositionOverlaysBtn');
  closeCompositionOverlaysBtn = document.getElementById('closeCompositionOverlaysBtn');
  safeAreaPlatformSelect = document.getElementById('safeAreaPlatform');
  aspectRatioSelect = document.getElementById('aspectRatioSelect');
  exportQualitySelect = document.getElementById('exportQuality');
  randomizeBtn = document.getElementById('randomizeBtn');
  resetBtn = document.getElementById('resetBtn');
  hardRefreshBtn = document.getElementById('hardRefreshBtn');
  logoUploadBtn = document.getElementById('logoUploadBtn');
  logoUploadInput = document.getElementById('logoUpload');
  titleXSlider = document.getElementById('titleX');
  titleXValue = document.getElementById('titleXValue');
  titleYSlider = document.getElementById('titleY');
  titleYValue = document.getElementById('titleYValue');
  subtitleXSlider = document.getElementById('subtitleX');
  subtitleXValue = document.getElementById('subtitleXValue');
  subtitleYSlider = document.getElementById('subtitleY');
  subtitleYValue = document.getElementById('subtitleYValue');
  sloganXSlider = document.getElementById('sloganX');
  sloganXValue = document.getElementById('sloganXValue');
  sloganYSlider = document.getElementById('sloganY');
  sloganYValue = document.getElementById('sloganYValue');
  resetTitlePosBtn = document.getElementById('resetTitlePos');
  resetSubtitlePosBtn = document.getElementById('resetSubtitlePos');
  resetSloganPosBtn = document.getElementById('resetSloganPos');
  templateSelect = document.getElementById('templateSelect');
  backgroundPatternSelect = document.getElementById('backgroundPattern');
  patternCustomization = document.getElementById('patternCustomization');
  patternSettingsToggle = document.getElementById('patternSettingsToggle');
  patternSettingsContent = document.getElementById('patternSettingsContent');
  patternColorPicker = document.getElementById('patternColorPicker');
  patternOpacitySlider = document.getElementById('patternOpacity');
  patternOpacityValue = document.getElementById('patternOpacityValue');
  patternSizeSlider = document.getElementById('patternSize');
  patternSizeValue = document.getElementById('patternSizeValue');
  patternRotationSlider = document.getElementById('patternRotation');
  patternRotationValue = document.getElementById('patternRotationValue');
  patternBlendModeSelect = document.getElementById('patternBlendMode');
  patternOffsetXSlider = document.getElementById('patternOffsetX');
  patternOffsetXValue = document.getElementById('patternOffsetXValue');
  patternOffsetYSlider = document.getElementById('patternOffsetY');
  patternOffsetYValue = document.getElementById('patternOffsetYValue');
  patternSpacingSlider = document.getElementById('patternSpacing');
  patternSpacingValue = document.getElementById('patternSpacingValue');
  patternDensitySlider = document.getElementById('patternDensity');
  patternDensityValue = document.getElementById('patternDensityValue');
  patternBlurSlider = document.getElementById('patternBlur');
  patternBlurValue = document.getElementById('patternBlurValue');
  patternScaleSlider = document.getElementById('patternScale');
  patternScaleValue = document.getElementById('patternScaleValue');
  patternRepeatSelect = document.getElementById('patternRepeat');
  patternIntensitySlider = document.getElementById('patternIntensity');
  patternIntensityValue = document.getElementById('patternIntensityValue');
  presetNameInput = document.getElementById('presetName');
  savePresetBtn = document.getElementById('savePresetBtn');
  loadPresetBtn = document.getElementById('loadPresetBtn');
  deletePresetBtn = document.getElementById('deletePresetBtn');
  savedPresetsSelect = document.getElementById('savedPresets');
}

/**
 * Sync slider with number input
 */
function syncSliderInput(slider, input, updateFn) {
  slider.addEventListener('input', e => {
    input.value = e.target.value;
    if (updateFn) updateFn();
  });
  input.addEventListener('input', e => {
    slider.value = e.target.value;
    if (updateFn) updateFn();
  });
}

/**
 * Sync slider with number input (debounced version for position/size sliders)
 * Uses debounced update to prevent CLS during rapid slider changes
 * Note: The debouncing is handled by the updateFn callback, not here
 */
function syncSliderInputDebounced(slider, input, updateFn) {
  slider.addEventListener('input', e => {
    input.value = e.target.value;
    if (updateFn) updateFn();
  });
  input.addEventListener('input', e => {
    slider.value = e.target.value;
    if (updateFn) updateFn();
  });
}

/**
 * Update slider and input value synchronously
 * This ensures both the slider position and input display value are updated
 * Does NOT trigger events to avoid multiple updateState() calls
 */
function setSliderValue(slider, input, value) {
  if (slider) {
    slider.value = value;
  }
  if (input) {
    input.value = value;
  }
}

// Debounce timer for slider updates to prevent excessive CLS
let updateStateDebounceTimer = null;
let pendingUpdateState = false;
let lastUpdateTime = 0;
const MIN_UPDATE_INTERVAL = 50; // Minimum 50ms between updates (~20fps max)

/**
 * Debounced update state for slider inputs (prevents CLS during rapid changes)
 * Uses both debouncing and throttling to ensure smooth updates without excessive CLS
 */
function debouncedUpdateState(skipHistory = false) {
  // Clear existing timer
  if (updateStateDebounceTimer) {
    clearTimeout(updateStateDebounceTimer);
  }

  // Mark that we have a pending update
  pendingUpdateState = true;

  // Throttle: Ensure minimum time between updates
  const now = performance.now();
  const timeSinceLastUpdate = now - lastUpdateTime;
  const delay = Math.max(0, MIN_UPDATE_INTERVAL - timeSinceLastUpdate);

  // Debounce slider updates to reduce CLS
  updateStateDebounceTimer = setTimeout(() => {
    lastUpdateTime = performance.now();
    updateState(skipHistory);
    pendingUpdateState = false;
    updateStateDebounceTimer = null;
  }, delay);
}

/**
 * Update state from inputs
 */
function updateState(skipHistory = false) {
  if (!titleInput || !subtitleInput) {
    // DOM not ready yet
    return;
  }

  currentState = {
    imageType: currentImageType === IMAGE_TYPES.OG ? 'og' : 'twitter', // Store image type
    title: titleInput.value || '',
    subtitle: subtitleInput.value || '',
    slogan: sloganInput ? sloganInput.value : '',
    logoX: logoXValue ? parseInt(logoXValue.value) || 40 : 40,
    logoY: logoYValue ? parseInt(logoYValue.value) || 40 : 40,
    logoSize: logoSizeValue ? parseInt(logoSizeValue.value) || 120 : 120,
    logoColor: currentState.logoColor || getLogoColorKey() || 'cyan', // Preserve existing logoColor if set
    logoGlow: logoGlow ? logoGlow.checked : false,
    titleColor: getSelectedColorKey('titleColorPicker') || 'cyan',
    subtitleColor: getSelectedColorKey('subtitleColorPicker') || 'text-secondary',
    sloganColor: getSelectedColorKey('sloganColorPicker') || 'magenta',
    titleSize: titleSizeValue ? parseInt(titleSizeValue.value) || 72 : 72,
    subtitleSize: subtitleSizeValue ? parseInt(subtitleSizeValue.value) || 28 : 28,
    sloganSize: sloganSizeValue ? parseInt(sloganSizeValue.value) || 20 : 20,
    titleGlow: titleGlow ? titleGlow.checked : false,
    subtitleGlow: subtitleGlow ? subtitleGlow.checked : false,
    sloganGlow: sloganGlow ? sloganGlow.checked : false,
    dividerAboveTitle: dividerAboveTitle ? dividerAboveTitle.checked : false,
    dividerBelowTitle: dividerBelowTitle ? dividerBelowTitle.checked : false,
    dividerAboveSubtitle: dividerAboveSubtitle ? dividerAboveSubtitle.checked : false,
    dividerBelowSubtitle: dividerBelowSubtitle ? dividerBelowSubtitle.checked : false,
    dividerAboveSlogan: dividerAboveSlogan ? dividerAboveSlogan.checked : false,
    dividerBelowSlogan: dividerBelowSlogan ? dividerBelowSlogan.checked : false,
    dividerWidth: dividerWidthValue ? parseInt(dividerWidthValue.value) || 2 : 2,
    titleDividerWidth: titleDividerWidthValue ? parseInt(titleDividerWidthValue.value) || 2 : 2,
    subtitleDividerWidth: subtitleDividerWidthValue
      ? parseInt(subtitleDividerWidthValue.value) || 2
      : 2,
    sloganDividerWidth: sloganDividerWidthValue ? parseInt(sloganDividerWidthValue.value) || 2 : 2,
    titleDividerColor: getSelectedColorKey('titleDividerColorPicker') || 'cyan',
    subtitleDividerColor: getSelectedColorKey('subtitleDividerColorPicker') || 'cyan',
    sloganDividerColor: getSelectedColorKey('sloganDividerColorPicker') || 'cyan',
    titleDividerGlow: titleDividerGlow ? titleDividerGlow.checked : false,
    subtitleDividerGlow: subtitleDividerGlow ? subtitleDividerGlow.checked : false,
    sloganDividerGlow: sloganDividerGlow ? sloganDividerGlow.checked : false,
    titleDividerGap: titleDividerGapValue ? parseInt(titleDividerGapValue.value) || 30 : 30,
    subtitleDividerGap: subtitleDividerGapValue ? parseInt(subtitleDividerGapValue.value) || 20 : 20,
    sloganDividerGap: sloganDividerGapValue ? parseInt(sloganDividerGapValue.value) || 15 : 15,
    dividerAboveTitleX: dividerAboveTitleXValue ? (dividerAboveTitleXValue.value === '' ? null : parseInt(dividerAboveTitleXValue.value)) : null,
    dividerAboveTitleY: dividerAboveTitleYValue ? (dividerAboveTitleYValue.value === '' ? null : parseInt(dividerAboveTitleYValue.value)) : null,
    dividerBelowTitleX: dividerBelowTitleXValue ? (dividerBelowTitleXValue.value === '' ? null : parseInt(dividerBelowTitleXValue.value)) : null,
    dividerBelowTitleY: dividerBelowTitleYValue ? (dividerBelowTitleYValue.value === '' ? null : parseInt(dividerBelowTitleYValue.value)) : null,
    dividerAboveSubtitleX: dividerAboveSubtitleXValue ? (dividerAboveSubtitleXValue.value === '' ? null : parseInt(dividerAboveSubtitleXValue.value)) : null,
    dividerAboveSubtitleY: dividerAboveSubtitleYValue ? (dividerAboveSubtitleYValue.value === '' ? null : parseInt(dividerAboveSubtitleYValue.value)) : null,
    dividerBelowSubtitleX: dividerBelowSubtitleXValue ? (dividerBelowSubtitleXValue.value === '' ? null : parseInt(dividerBelowSubtitleXValue.value)) : null,
    dividerBelowSubtitleY: dividerBelowSubtitleYValue ? (dividerBelowSubtitleYValue.value === '' ? null : parseInt(dividerBelowSubtitleYValue.value)) : null,
    dividerAboveSloganX: dividerAboveSloganXValue ? (dividerAboveSloganXValue.value === '' ? null : parseInt(dividerAboveSloganXValue.value)) : null,
    dividerAboveSloganY: dividerAboveSloganYValue ? (dividerAboveSloganYValue.value === '' ? null : parseInt(dividerAboveSloganYValue.value)) : null,
    dividerBelowSloganX: dividerBelowSloganXValue ? (dividerBelowSloganXValue.value === '' ? null : parseInt(dividerBelowSloganXValue.value)) : null,
    dividerBelowSloganY: dividerBelowSloganYValue ? (dividerBelowSloganYValue.value === '' ? null : parseInt(dividerBelowSloganYValue.value)) : null,
    titleX: titleXValue ? parseInt(titleXValue.value) || 600 : 600,
    titleY: titleYValue ? parseInt(titleYValue.value) || 315 : 315,
    subtitleX: subtitleXValue ? parseInt(subtitleXValue.value) || 600 : 600,
    subtitleY: subtitleYValue ? parseInt(subtitleYValue.value) || 395 : 395,
    sloganX: sloganXValue ? parseInt(sloganXValue.value) || 600 : 600,
    sloganY: sloganYValue ? parseInt(sloganYValue.value) || 455 : 455,
    backgroundPattern: backgroundPatternSelect ? backgroundPatternSelect.value || '' : '',
    patternColor: patternColorPicker ? getSelectedColorKey('patternColorPicker') : '',
    patternOpacity: patternOpacityValue ? parseInt(patternOpacityValue.value) || 20 : 20,
    patternSize: patternSizeValue ? parseInt(patternSizeValue.value) || 50 : 50,
    patternRotation: patternRotationValue ? parseInt(patternRotationValue.value) || 0 : 0,
    patternBlendMode: patternBlendModeSelect ? patternBlendModeSelect.value || 'normal' : 'normal',
    patternOffsetX: patternOffsetXValue ? parseInt(patternOffsetXValue.value) || 0 : 0,
    patternOffsetY: patternOffsetYValue ? parseInt(patternOffsetYValue.value) || 0 : 0,
    patternSpacing: patternSpacingValue ? parseInt(patternSpacingValue.value) || 0 : 0,
    patternDensity: patternDensityValue ? parseInt(patternDensityValue.value) || 1 : 1,
    patternBlur: patternBlurValue ? parseInt(patternBlurValue.value) || 0 : 0,
    patternScale: patternScaleValue ? parseInt(patternScaleValue.value) || 100 : 100,
    patternRepeat: patternRepeatSelect ? patternRepeatSelect.value || 'repeat' : 'repeat',
    patternIntensity: patternIntensityValue ? parseInt(patternIntensityValue.value) || 100 : 100,
    exportQuality: exportQualitySelect ? parseInt(exportQualitySelect.value) || 2 : 2,
  };

  if (!skipHistory) {
    addToHistory(currentState);
    updateUndoRedoButtons();
  }

  updatePreview(currentState);

  // Sync pop-out preview if open
  setTimeout(() => {
    syncPopoutPreview();
  }, 10);

  // Sync column heights after preview update
  setTimeout(syncColumnHeights, 50);
}

/**
 * Apply state to UI
 */
function applyStateToUI(state) {
  titleInput.value = state.title || '';
  subtitleInput.value = state.subtitle || '';
  sloganInput.value = state.slogan || '';
  if (logoXValue) logoXValue.value = state.logoX !== undefined ? state.logoX : 40;
  if (logoXSlider) logoXSlider.value = state.logoX !== undefined ? state.logoX : 40;
  if (logoYValue) logoYValue.value = state.logoY !== undefined ? state.logoY : 40;
  if (logoYSlider) logoYSlider.value = state.logoY !== undefined ? state.logoY : 40;
  if (logoSizeValue) logoSizeValue.value = state.logoSize || 120;
  if (logoSizeSlider) logoSizeSlider.value = state.logoSize || 120;
  if (logoGlow) logoGlow.checked = state.logoGlow || false;
  if (titleSizeValue) titleSizeValue.value = state.titleSize || 72;
  if (titleSizeSlider) titleSizeSlider.value = state.titleSize || 72;
  if (subtitleSizeValue) subtitleSizeValue.value = state.subtitleSize || 28;
  if (subtitleSizeSlider) subtitleSizeSlider.value = state.subtitleSize || 28;
  if (sloganSizeValue) sloganSizeValue.value = state.sloganSize || 20;
  if (sloganSizeSlider) sloganSizeSlider.value = state.sloganSize || 20;
  if (titleGlow) titleGlow.checked = state.titleGlow || false;
  if (subtitleGlow) subtitleGlow.checked = state.subtitleGlow || false;
  if (sloganGlow) sloganGlow.checked = state.sloganGlow || false;
  if (dividerAboveTitle) dividerAboveTitle.checked = state.dividerAboveTitle || false;
  if (dividerBelowTitle) dividerBelowTitle.checked = state.dividerBelowTitle || false;
  if (dividerAboveSubtitle) dividerAboveSubtitle.checked = state.dividerAboveSubtitle || false;
  if (dividerBelowSubtitle) dividerBelowSubtitle.checked = state.dividerBelowSubtitle || false;
  if (dividerAboveSlogan) dividerAboveSlogan.checked = state.dividerAboveSlogan || false;
  if (dividerBelowSlogan) dividerBelowSlogan.checked = state.dividerBelowSlogan || false;
  if (dividerWidthValue) dividerWidthValue.value = state.dividerWidth || 2;
  if (dividerWidthSlider) dividerWidthSlider.value = state.dividerWidth || 2;
  if (titleDividerWidthValue) {
    titleDividerWidthValue.value = state.titleDividerWidth || 2;
    titleDividerWidthSlider.value = state.titleDividerWidth || 2;
  }
  if (subtitleDividerWidthValue) {
    subtitleDividerWidthValue.value = state.subtitleDividerWidth || 2;
    subtitleDividerWidthSlider.value = state.subtitleDividerWidth || 2;
  }
  if (sloganDividerWidthValue) {
    sloganDividerWidthValue.value = state.sloganDividerWidth || 2;
    sloganDividerWidthSlider.value = state.sloganDividerWidth || 2;
  }
  if (titleDividerGlow) titleDividerGlow.checked = state.titleDividerGlow || false;
  if (subtitleDividerGlow) subtitleDividerGlow.checked = state.subtitleDividerGlow || false;
  if (sloganDividerGlow) sloganDividerGlow.checked = state.sloganDividerGlow || false;
  if (titleDividerGapValue) {
    titleDividerGapValue.value = state.titleDividerGap !== undefined ? state.titleDividerGap : 30;
    if (titleDividerGapSlider) titleDividerGapSlider.value = state.titleDividerGap !== undefined ? state.titleDividerGap : 30;
  }
  if (subtitleDividerGapValue) {
    subtitleDividerGapValue.value = state.subtitleDividerGap !== undefined ? state.subtitleDividerGap : 20;
    if (subtitleDividerGapSlider) subtitleDividerGapSlider.value = state.subtitleDividerGap !== undefined ? state.subtitleDividerGap : 20;
  }
  if (sloganDividerGapValue) {
    sloganDividerGapValue.value = state.sloganDividerGap !== undefined ? state.sloganDividerGap : 15;
    if (sloganDividerGapSlider) sloganDividerGapSlider.value = state.sloganDividerGap !== undefined ? state.sloganDividerGap : 15;
  }
  if (dividerAboveTitleXValue) dividerAboveTitleXValue.value = state.dividerAboveTitleX !== null && state.dividerAboveTitleX !== undefined ? state.dividerAboveTitleX : '';
  if (dividerAboveTitleXSlider) dividerAboveTitleXSlider.value = state.dividerAboveTitleX !== null && state.dividerAboveTitleX !== undefined ? state.dividerAboveTitleX : '';
  if (dividerAboveTitleYValue) dividerAboveTitleYValue.value = state.dividerAboveTitleY !== null && state.dividerAboveTitleY !== undefined ? state.dividerAboveTitleY : '';
  if (dividerAboveTitleYSlider) dividerAboveTitleYSlider.value = state.dividerAboveTitleY !== null && state.dividerAboveTitleY !== undefined ? state.dividerAboveTitleY : '';
  if (dividerBelowTitleXValue) dividerBelowTitleXValue.value = state.dividerBelowTitleX !== null && state.dividerBelowTitleX !== undefined ? state.dividerBelowTitleX : '';
  if (dividerBelowTitleXSlider) dividerBelowTitleXSlider.value = state.dividerBelowTitleX !== null && state.dividerBelowTitleX !== undefined ? state.dividerBelowTitleX : '';
  if (dividerBelowTitleYValue) dividerBelowTitleYValue.value = state.dividerBelowTitleY !== null && state.dividerBelowTitleY !== undefined ? state.dividerBelowTitleY : '';
  if (dividerBelowTitleYSlider) dividerBelowTitleYSlider.value = state.dividerBelowTitleY !== null && state.dividerBelowTitleY !== undefined ? state.dividerBelowTitleY : '';
  if (dividerAboveSubtitleXValue) dividerAboveSubtitleXValue.value = state.dividerAboveSubtitleX !== null && state.dividerAboveSubtitleX !== undefined ? state.dividerAboveSubtitleX : '';
  if (dividerAboveSubtitleXSlider) dividerAboveSubtitleXSlider.value = state.dividerAboveSubtitleX !== null && state.dividerAboveSubtitleX !== undefined ? state.dividerAboveSubtitleX : '';
  if (dividerAboveSubtitleYValue) dividerAboveSubtitleYValue.value = state.dividerAboveSubtitleY !== null && state.dividerAboveSubtitleY !== undefined ? state.dividerAboveSubtitleY : '';
  if (dividerAboveSubtitleYSlider) dividerAboveSubtitleYSlider.value = state.dividerAboveSubtitleY !== null && state.dividerAboveSubtitleY !== undefined ? state.dividerAboveSubtitleY : '';
  if (dividerBelowSubtitleXValue) dividerBelowSubtitleXValue.value = state.dividerBelowSubtitleX !== null && state.dividerBelowSubtitleX !== undefined ? state.dividerBelowSubtitleX : '';
  if (dividerBelowSubtitleXSlider) dividerBelowSubtitleXSlider.value = state.dividerBelowSubtitleX !== null && state.dividerBelowSubtitleX !== undefined ? state.dividerBelowSubtitleX : '';
  if (dividerBelowSubtitleYValue) dividerBelowSubtitleYValue.value = state.dividerBelowSubtitleY !== null && state.dividerBelowSubtitleY !== undefined ? state.dividerBelowSubtitleY : '';
  if (dividerBelowSubtitleYSlider) dividerBelowSubtitleYSlider.value = state.dividerBelowSubtitleY !== null && state.dividerBelowSubtitleY !== undefined ? state.dividerBelowSubtitleY : '';
  if (dividerAboveSloganXValue) dividerAboveSloganXValue.value = state.dividerAboveSloganX !== null && state.dividerAboveSloganX !== undefined ? state.dividerAboveSloganX : '';
  if (dividerAboveSloganXSlider) dividerAboveSloganXSlider.value = state.dividerAboveSloganX !== null && state.dividerAboveSloganX !== undefined ? state.dividerAboveSloganX : '';
  if (dividerAboveSloganYValue) dividerAboveSloganYValue.value = state.dividerAboveSloganY !== null && state.dividerAboveSloganY !== undefined ? state.dividerAboveSloganY : '';
  if (dividerAboveSloganYSlider) dividerAboveSloganYSlider.value = state.dividerAboveSloganY !== null && state.dividerAboveSloganY !== undefined ? state.dividerAboveSloganY : '';
  if (dividerBelowSloganXValue) dividerBelowSloganXValue.value = state.dividerBelowSloganX !== null && state.dividerBelowSloganX !== undefined ? state.dividerBelowSloganX : '';
  if (dividerBelowSloganXSlider) dividerBelowSloganXSlider.value = state.dividerBelowSloganX !== null && state.dividerBelowSloganX !== undefined ? state.dividerBelowSloganX : '';
  if (dividerBelowSloganYValue) dividerBelowSloganYValue.value = state.dividerBelowSloganY !== null && state.dividerBelowSloganY !== undefined ? state.dividerBelowSloganY : '';
  if (dividerBelowSloganYSlider) dividerBelowSloganYSlider.value = state.dividerBelowSloganY !== null && state.dividerBelowSloganY !== undefined ? state.dividerBelowSloganY : '';
  // Handle migration from offset to absolute positions
  if (titleXValue && titleXSlider) {
  if (state.titleX !== undefined) {
    titleXValue.value = state.titleX;
    titleXSlider.value = state.titleX;
  } else if (state.titleOffsetX !== undefined) {
    // Migrate old offset to absolute position (center + offset)
    const centerX = IMAGE_TYPES.OG.width / 2;
    const centerY = IMAGE_TYPES.OG.height / 2;
    titleXValue.value = centerX + state.titleOffsetX;
    titleXSlider.value = centerX + state.titleOffsetX;
  } else {
    titleXValue.value = 600;
    titleXSlider.value = 600;
    }
  }
  
  if (titleYValue && titleYSlider) {
  if (state.titleY !== undefined) {
    titleYValue.value = state.titleY;
    titleYSlider.value = state.titleY;
  } else if (state.titleOffsetY !== undefined) {
    const centerY = IMAGE_TYPES.OG.height / 2;
    titleYValue.value = centerY - 40 + state.titleOffsetY;
    titleYSlider.value = centerY - 40 + state.titleOffsetY;
  } else {
    titleYValue.value = 315;
    titleYSlider.value = 315;
    }
  }
  
  if (subtitleXValue && subtitleXSlider) {
  if (state.subtitleX !== undefined) {
    subtitleXValue.value = state.subtitleX;
    subtitleXSlider.value = state.subtitleX;
  } else if (state.subtitleOffsetX !== undefined) {
    const centerX = IMAGE_TYPES.OG.width / 2;
    subtitleXValue.value = centerX + state.subtitleOffsetX;
    subtitleXSlider.value = centerX + state.subtitleOffsetX;
  } else {
    subtitleXValue.value = 600;
    subtitleXSlider.value = 600;
    }
  }
  
  if (subtitleYValue && subtitleYSlider) {
  if (state.subtitleY !== undefined) {
    subtitleYValue.value = state.subtitleY;
    subtitleYSlider.value = state.subtitleY;
  } else if (state.subtitleOffsetY !== undefined) {
    const centerY = IMAGE_TYPES.OG.height / 2;
    subtitleYValue.value = centerY + 80 + state.subtitleOffsetY;
    subtitleYSlider.value = centerY + 80 + state.subtitleOffsetY;
  } else {
    subtitleYValue.value = 395;
    subtitleYSlider.value = 395;
    }
  }
  
  if (sloganXValue && sloganXSlider) {
    if (state.sloganX !== undefined) {
      sloganXValue.value = state.sloganX;
      sloganXSlider.value = state.sloganX;
    } else if (state.sloganOffsetX !== undefined) {
      const centerX = IMAGE_TYPES.OG.width / 2;
      sloganXValue.value = centerX + state.sloganOffsetX;
      sloganXSlider.value = centerX + state.sloganOffsetX;
    } else {
      sloganXValue.value = 600;
      sloganXSlider.value = 600;
    }
  }
  
  if (sloganYValue && sloganYSlider) {
    if (state.sloganY !== undefined) {
      sloganYValue.value = state.sloganY;
      sloganYSlider.value = state.sloganY;
    } else if (state.sloganOffsetY !== undefined) {
      const centerY = IMAGE_TYPES.OG.height / 2;
      sloganYValue.value = centerY + 140 + state.sloganOffsetY;
      sloganYSlider.value = centerY + 140 + state.sloganOffsetY;
    } else {
      sloganYValue.value = 455;
      sloganYSlider.value = 455;
    }
  }
  
  // Handle logo position migration
  if (state.logoX === undefined && state.logoY === undefined && state.logoPosition) {
    // Migrate old logoPosition to X/Y coordinates
    const logoPos = state.logoPosition;
    let x = 40, y = 40;
    if (logoPos === 'top-center') { x = IMAGE_TYPES.OG.width / 2; y = 40; }
    else if (logoPos === 'top-right') { x = IMAGE_TYPES.OG.width - 40; y = 40; }
    else if (logoPos === 'center-left') { x = 40; y = IMAGE_TYPES.OG.height / 2; }
    else if (logoPos === 'center') { x = IMAGE_TYPES.OG.width / 2; y = IMAGE_TYPES.OG.height / 2; }
    else if (logoPos === 'center-right') { x = IMAGE_TYPES.OG.width - 40; y = IMAGE_TYPES.OG.height / 2; }
    else if (logoPos === 'bottom-left') { x = 40; y = IMAGE_TYPES.OG.height - 40; }
    else if (logoPos === 'bottom-center') { x = IMAGE_TYPES.OG.width / 2; y = IMAGE_TYPES.OG.height - 40; }
    else if (logoPos === 'bottom-right') { x = IMAGE_TYPES.OG.width - 40; y = IMAGE_TYPES.OG.height - 40; }
    else if (logoPos === 'hidden') { x = -1000; y = -1000; } // Hide off-screen
    
    if (logoXValue) logoXValue.value = x;
    if (logoXSlider) logoXSlider.value = x;
    if (logoYValue) logoYValue.value = y;
    if (logoYSlider) logoYSlider.value = y;
  }
  backgroundPatternSelect.value = state.backgroundPattern || '';
  if (patternCustomization) {
    patternCustomization.style.display = state.backgroundPattern ? 'block' : 'none';
  }
  if (patternOpacityValue) {
    patternOpacityValue.value = state.patternOpacity !== undefined ? state.patternOpacity : 20;
    patternOpacitySlider.value = state.patternOpacity !== undefined ? state.patternOpacity : 20;
  }
  if (patternSizeValue) {
    patternSizeValue.value = state.patternSize !== undefined ? state.patternSize : 50;
    patternSizeSlider.value = state.patternSize !== undefined ? state.patternSize : 50;
  }
  if (patternRotationValue) {
    patternRotationValue.value = state.patternRotation !== undefined ? state.patternRotation : 0;
    patternRotationSlider.value = state.patternRotation !== undefined ? state.patternRotation : 0;
  }
  if (patternBlendModeSelect) {
    patternBlendModeSelect.value = state.patternBlendMode || 'normal';
  }
  if (patternOffsetXValue) {
    patternOffsetXValue.value = state.patternOffsetX !== undefined ? state.patternOffsetX : 0;
    patternOffsetXSlider.value = state.patternOffsetX !== undefined ? state.patternOffsetX : 0;
  }
  if (patternOffsetYValue) {
    patternOffsetYValue.value = state.patternOffsetY !== undefined ? state.patternOffsetY : 0;
    patternOffsetYSlider.value = state.patternOffsetY !== undefined ? state.patternOffsetY : 0;
  }
  if (patternSpacingValue) {
    patternSpacingValue.value = state.patternSpacing !== undefined ? state.patternSpacing : 0;
    patternSpacingSlider.value = state.patternSpacing !== undefined ? state.patternSpacing : 0;
  }
  if (patternDensityValue) {
    patternDensityValue.value = state.patternDensity !== undefined ? state.patternDensity : 1;
    patternDensitySlider.value = state.patternDensity !== undefined ? state.patternDensity : 1;
  }
  if (patternBlurValue) {
    patternBlurValue.value = state.patternBlur !== undefined ? state.patternBlur : 0;
    patternBlurSlider.value = state.patternBlur !== undefined ? state.patternBlur : 0;
  }
  if (patternScaleValue) {
    patternScaleValue.value = state.patternScale !== undefined ? state.patternScale : 100;
    patternScaleSlider.value = state.patternScale !== undefined ? state.patternScale : 100;
  }
  if (patternRepeatSelect) {
    patternRepeatSelect.value = state.patternRepeat || 'repeat';
  }
  if (patternIntensityValue) {
    patternIntensityValue.value =
      state.patternIntensity !== undefined ? state.patternIntensity : 100;
    patternIntensitySlider.value =
      state.patternIntensity !== undefined ? state.patternIntensity : 100;
  }
  exportQualitySelect.value = state.exportQuality || 2;

  // Apply colors (use setTimeout to ensure color pickers are initialized)
  setTimeout(() => {
    if (state.logoColor) setLogoColor(state.logoColor);
    if (state.titleColor) setSelectedColor('titleColorPicker', state.titleColor);
    if (state.subtitleColor) setSelectedColor('subtitleColorPicker', state.subtitleColor);
    if (state.sloganColor) setSelectedColor('sloganColorPicker', state.sloganColor);
    if (state.dividerColor) setSelectedColor('dividerColorPicker', state.dividerColor);
    if (state.titleDividerColor)
      setSelectedColor('titleDividerColorPicker', state.titleDividerColor);
    if (state.subtitleDividerColor)
      setSelectedColor('subtitleDividerColorPicker', state.subtitleDividerColor);
    if (state.sloganDividerColor)
      setSelectedColor('sloganDividerColorPicker', state.sloganDividerColor);
    if (state.patternColor) setSelectedColor('patternColorPicker', state.patternColor);
  }, 0);
}

/**
 * Update undo/redo button states
 */
function updateUndoRedoButtons() {
  if (undoBtn) {
    undoBtn.disabled = !canUndo();
    undoBtn.style.opacity = canUndo() ? '1' : '0.5';
  }
  if (redoBtn) {
    redoBtn.disabled = !canRedo();
    redoBtn.style.opacity = canRedo() ? '1' : '0.5';
  }
}

/**
 * Populate template select
 */
function populateTemplates() {
  if (!templateSelect) return;
  templateSelect.innerHTML = '<option value="">Select a template...</option>';
  Object.entries(getAllTemplates()).forEach(([key, template]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = `${template.name} - ${template.description}`;
    templateSelect.appendChild(option);
  });
}

/**
 * Populate background patterns
 */
function populateBackgroundPatterns() {
  if (!backgroundPatternSelect) return;
  backgroundPatternSelect.innerHTML = '<option value="">None (Use Preset Background)</option>';
  Object.entries(backgroundPatterns).forEach(([key, pattern]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = pattern.name;
    option.dataset.patternKey = key;
    backgroundPatternSelect.appendChild(option);
  });
}

/**
 * Populate saved presets
 */
function populateSavedPresets() {
  if (!savedPresetsSelect) return;
  const saved = getSavedPresets();
  savedPresetsSelect.innerHTML = '<option value="">Select a saved preset...</option>';
  saved.forEach(preset => {
    const option = document.createElement('option');
    option.value = preset.name;
    option.textContent = `${preset.name} (${new Date(preset.updatedAt).toLocaleDateString()})`;
    savedPresetsSelect.appendChild(option);
  });

  // Update custom dropdown if it exists
  if (customPresetDropdown && customPresetDropdown.update) {
    customPresetDropdown.update();
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Size controls - use debounced updates to prevent CLS during rapid slider changes
  if (titleSizeSlider && titleSizeValue) {
    syncSliderInputDebounced(titleSizeSlider, titleSizeValue, () => debouncedUpdateState());
  }
  if (subtitleSizeSlider && subtitleSizeValue) {
    syncSliderInputDebounced(subtitleSizeSlider, subtitleSizeValue, () => debouncedUpdateState());
  }
  if (sloganSizeSlider && sloganSizeValue) {
    syncSliderInputDebounced(sloganSizeSlider, sloganSizeValue, () => debouncedUpdateState());
  }
  if (logoSizeSlider && logoSizeValue) {
    syncSliderInputDebounced(logoSizeSlider, logoSizeValue, () => debouncedUpdateState());
  }
  if (logoXSlider && logoXValue) {
    syncSliderInputDebounced(logoXSlider, logoXValue, () => debouncedUpdateState());
  }
  if (logoYSlider && logoYValue) {
    syncSliderInputDebounced(logoYSlider, logoYValue, () => debouncedUpdateState());
  }
  if (dividerWidthSlider && dividerWidthValue) {
    syncSliderInputDebounced(dividerWidthSlider, dividerWidthValue, () => debouncedUpdateState());
  }
  if (titleDividerWidthSlider && titleDividerWidthValue) {
    syncSliderInputDebounced(titleDividerWidthSlider, titleDividerWidthValue, () => debouncedUpdateState());
  }
  if (subtitleDividerWidthSlider && subtitleDividerWidthValue) {
    syncSliderInputDebounced(subtitleDividerWidthSlider, subtitleDividerWidthValue, () => debouncedUpdateState());
  }
  if (sloganDividerWidthSlider && sloganDividerWidthValue) {
    syncSliderInputDebounced(sloganDividerWidthSlider, sloganDividerWidthValue, () => debouncedUpdateState());
  }

  // Divider glow controls
  if (titleDividerGlow) {
    titleDividerGlow.addEventListener('change', () => updateState());
  }
  if (subtitleDividerGlow) {
    subtitleDividerGlow.addEventListener('change', () => updateState());
  }
  if (sloganDividerGlow) {
    sloganDividerGlow.addEventListener('change', () => updateState());
  }

  // Divider gap controls
  if (titleDividerGapSlider && titleDividerGapValue) {
    syncSliderInputDebounced(titleDividerGapSlider, titleDividerGapValue, () => debouncedUpdateState());
  }
  if (subtitleDividerGapSlider && subtitleDividerGapValue) {
    syncSliderInputDebounced(subtitleDividerGapSlider, subtitleDividerGapValue, () => debouncedUpdateState());
  }
  if (sloganDividerGapSlider && sloganDividerGapValue) {
    syncSliderInputDebounced(sloganDividerGapSlider, sloganDividerGapValue, () => debouncedUpdateState());
  }

  // Divider position controls
  if (dividerAboveTitleXSlider && dividerAboveTitleXValue) {
    syncSliderInputDebounced(dividerAboveTitleXSlider, dividerAboveTitleXValue, () => debouncedUpdateState());
  }
  if (dividerAboveTitleYSlider && dividerAboveTitleYValue) {
    syncSliderInputDebounced(dividerAboveTitleYSlider, dividerAboveTitleYValue, () => debouncedUpdateState());
  }
  if (dividerBelowTitleXSlider && dividerBelowTitleXValue) {
    syncSliderInputDebounced(dividerBelowTitleXSlider, dividerBelowTitleXValue, () => debouncedUpdateState());
  }
  if (dividerBelowTitleYSlider && dividerBelowTitleYValue) {
    syncSliderInputDebounced(dividerBelowTitleYSlider, dividerBelowTitleYValue, () => debouncedUpdateState());
  }
  if (dividerAboveSubtitleXSlider && dividerAboveSubtitleXValue) {
    syncSliderInputDebounced(dividerAboveSubtitleXSlider, dividerAboveSubtitleXValue, () => debouncedUpdateState());
  }
  if (dividerAboveSubtitleYSlider && dividerAboveSubtitleYValue) {
    syncSliderInputDebounced(dividerAboveSubtitleYSlider, dividerAboveSubtitleYValue, () => debouncedUpdateState());
  }
  if (dividerBelowSubtitleXSlider && dividerBelowSubtitleXValue) {
    syncSliderInputDebounced(dividerBelowSubtitleXSlider, dividerBelowSubtitleXValue, () => debouncedUpdateState());
  }
  if (dividerBelowSubtitleYSlider && dividerBelowSubtitleYValue) {
    syncSliderInputDebounced(dividerBelowSubtitleYSlider, dividerBelowSubtitleYValue, () => debouncedUpdateState());
  }
  if (dividerAboveSloganXSlider && dividerAboveSloganXValue) {
    syncSliderInputDebounced(dividerAboveSloganXSlider, dividerAboveSloganXValue, () => debouncedUpdateState());
  }
  if (dividerAboveSloganYSlider && dividerAboveSloganYValue) {
    syncSliderInputDebounced(dividerAboveSloganYSlider, dividerAboveSloganYValue, () => debouncedUpdateState());
  }
  if (dividerBelowSloganXSlider && dividerBelowSloganXValue) {
    syncSliderInputDebounced(dividerBelowSloganXSlider, dividerBelowSloganXValue, () => debouncedUpdateState());
  }
  if (dividerBelowSloganYSlider && dividerBelowSloganYValue) {
    syncSliderInputDebounced(dividerBelowSloganYSlider, dividerBelowSloganYValue, () => debouncedUpdateState());
  }

  // Text alignment controls - use debounced updates to prevent CLS during rapid slider changes
  if (titleXSlider && titleXValue) {
    syncSliderInputDebounced(titleXSlider, titleXValue, () => debouncedUpdateState());
  }
  if (titleYSlider && titleYValue) {
    syncSliderInputDebounced(titleYSlider, titleYValue, () => debouncedUpdateState());
  }
  if (subtitleXSlider && subtitleXValue) {
    syncSliderInputDebounced(subtitleXSlider, subtitleXValue, () => debouncedUpdateState());
  }
  if (subtitleYSlider && subtitleYValue) {
    syncSliderInputDebounced(subtitleYSlider, subtitleYValue, () => debouncedUpdateState());
  }
  if (sloganXSlider && sloganXValue) {
    syncSliderInputDebounced(sloganXSlider, sloganXValue, () => debouncedUpdateState());
  }
  if (sloganYSlider && sloganYValue) {
    syncSliderInputDebounced(sloganYSlider, sloganYValue, () => debouncedUpdateState());
  }

  // Pattern customization controls - use debounced updates to prevent CLS during rapid slider changes
  if (patternOpacitySlider && patternOpacityValue) {
    syncSliderInputDebounced(patternOpacitySlider, patternOpacityValue, () => debouncedUpdateState());
  }
  if (patternSizeSlider && patternSizeValue) {
    syncSliderInputDebounced(patternSizeSlider, patternSizeValue, () => debouncedUpdateState());
  }
  if (patternRotationSlider && patternRotationValue) {
    syncSliderInputDebounced(patternRotationSlider, patternRotationValue, () => debouncedUpdateState());
  }
  if (patternBlendModeSelect) {
    patternBlendModeSelect.addEventListener('change', () => updateState());
  }
  if (patternOffsetXSlider && patternOffsetXValue) {
    syncSliderInputDebounced(patternOffsetXSlider, patternOffsetXValue, () => debouncedUpdateState());
  }
  if (patternOffsetYSlider && patternOffsetYValue) {
    syncSliderInputDebounced(patternOffsetYSlider, patternOffsetYValue, () => debouncedUpdateState());
  }
  if (patternSpacingSlider && patternSpacingValue) {
    syncSliderInputDebounced(patternSpacingSlider, patternSpacingValue, () => debouncedUpdateState());
  }
  if (patternDensitySlider && patternDensityValue) {
    syncSliderInputDebounced(patternDensitySlider, patternDensityValue, () => debouncedUpdateState());
  }
  if (patternBlurSlider && patternBlurValue) {
    syncSliderInputDebounced(patternBlurSlider, patternBlurValue, () => debouncedUpdateState());
  }
  if (patternScaleSlider && patternScaleValue) {
    syncSliderInputDebounced(patternScaleSlider, patternScaleValue, () => debouncedUpdateState());
  }
  if (patternRepeatSelect) {
    patternRepeatSelect.addEventListener('change', () => updateState());
  }
  if (patternIntensitySlider && patternIntensityValue) {
    syncSliderInputDebounced(patternIntensitySlider, patternIntensityValue, () => debouncedUpdateState());
  }

  // Pattern settings toggle
  if (patternSettingsToggle && patternSettingsContent) {
    patternSettingsToggle.addEventListener('click', () => {
      const isExpanded = patternSettingsToggle.getAttribute('aria-expanded') === 'true';
      const newExpanded = !isExpanded;

      patternSettingsToggle.setAttribute('aria-expanded', newExpanded);

      if (newExpanded) {
        // Expanding: Show content and animate height
        patternSettingsContent.style.display = 'block';
        // Remove collapsed class first
        patternSettingsContent.classList.remove('collapsed');
        // Set max-height to 0 and opacity to 0 initially
        patternSettingsContent.style.maxHeight = '0';
        patternSettingsContent.style.opacity = '0';
        // Force reflow to ensure initial state is applied
        void patternSettingsContent.offsetHeight;
        // Get the full height
        const fullHeight = patternSettingsContent.scrollHeight;
        // Now animate to full height and fade in
        patternSettingsContent.style.maxHeight = `${fullHeight}px`;
        patternSettingsContent.style.opacity = '1';
        // After transition, remove max-height constraint to allow natural sizing
        setTimeout(() => {
          if (!patternSettingsContent.classList.contains('collapsed')) {
            patternSettingsContent.style.maxHeight = 'none';
          }
        }, 300);
      } else {
        // Collapsing: Animate height to 0, then hide
        // Get current height first
        const currentHeight = patternSettingsContent.scrollHeight;
        // Set max-height to current height
        patternSettingsContent.style.maxHeight = `${currentHeight}px`;
        // Force reflow
        void patternSettingsContent.offsetHeight;
        // Add collapsed class and animate
        patternSettingsContent.classList.add('collapsed');
        patternSettingsContent.style.opacity = '0';
        // Hide after transition
        setTimeout(() => {
          if (patternSettingsContent.classList.contains('collapsed')) {
            patternSettingsContent.style.display = 'none';
          }
        }, 300);
      }
    });
  }

  // Reset position buttons
  if (resetTitlePosBtn && titleXSlider && titleXValue && titleYSlider && titleYValue) {
    resetTitlePosBtn.addEventListener('click', () => {
      titleXSlider.value = 600;
      titleXValue.value = 600;
      titleYSlider.value = 315;
      titleYValue.value = 315;
      updateState();
    });
  }

  if (
    resetSubtitlePosBtn &&
    subtitleXSlider &&
    subtitleXValue &&
    subtitleYSlider &&
    subtitleYValue
  ) {
    resetSubtitlePosBtn.addEventListener('click', () => {
      subtitleXSlider.value = 600;
      subtitleXValue.value = 600;
      subtitleYSlider.value = 395;
      subtitleYValue.value = 395;
      updateState();
    });
  }
  if (resetSloganPosBtn && sloganXSlider && sloganXValue && sloganYSlider && sloganYValue) {
    resetSloganPosBtn.addEventListener('click', () => {
      sloganXSlider.value = 600;
      sloganXValue.value = 600;
      sloganYSlider.value = 455;
      sloganYValue.value = 455;
      updateState();
    });
  }

  // Text inputs
  [titleInput, subtitleInput, sloganInput].forEach(input => {
    if (input) {
      input.addEventListener('input', () => updateState());
    }
  });

  // Logo X/Y position sliders are handled above with syncSliderInputDebounced

  // Checkboxes
  [
    logoGlow,
    titleGlow,
    subtitleGlow,
    sloganGlow,
    dividerAboveTitle,
    dividerBelowTitle,
    dividerAboveSubtitle,
    dividerBelowSubtitle,
    dividerAboveSlogan,
    dividerBelowSlogan,
  ].forEach(checkbox => {
    if (checkbox) {
      checkbox.addEventListener('change', () => updateState());
    }
  });

  // Preset buttons
  document.querySelectorAll('.preset-btn[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      document
        .querySelectorAll('.preset-btn[data-preset]')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setPreset(btn.dataset.preset);
      updateState();
    });
  });

  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentImageType = btn.dataset.mode === 'og' ? IMAGE_TYPES.OG : IMAGE_TYPES.TWITTER;
      setImageType(currentImageType);
      updateGridOverlayDimensions(currentImageType.width, currentImageType.height);
      updateCompositionCanvasDimensions(currentImageType.width, currentImageType.height);

      // Update default sizes based on image type
      if (currentImageType === IMAGE_TYPES.OG) {
        titleSizeSlider.value = 72;
        titleSizeValue.value = 72;
        subtitleSizeSlider.value = 28;
        subtitleSizeValue.value = 28;
        logoSizeSlider.value = 120;
        logoSizeValue.value = 120;
      } else {
        titleSizeSlider.value = 76;
        titleSizeValue.value = 76;
        subtitleSizeSlider.value = 30;
        subtitleSizeValue.value = 30;
        logoSizeSlider.value = 130;
        logoSizeValue.value = 130;
      }

      updateState();
    });
  });

  // Pop-out preview toggle
  if (popoutBtn) {
    popoutBtn.addEventListener('click', () => {
      togglePopoutPreview();
      // Update button text based on state
      if (isPopoutOpenState()) {
        popoutBtn.textContent = '🔳 Close Pop-out';
        popoutBtn.title = 'Close Pop-out Preview';
      } else {
        popoutBtn.textContent = '⧉';
        popoutBtn.title = 'Pop-out Preview (New Window)';
      }
    });
  }

  // Grid overlay toggle
  if (gridToggleBtn) {
    gridToggleBtn.addEventListener('click', () => {
      const canvasWrapper = document.getElementById('canvasWrapper');
      if (canvasWrapper) {
        const isVisible = toggleGridOverlay(
          canvasWrapper,
          currentImageType.width,
          currentImageType.height
        );
        gridToggleBtn.classList.toggle('active', isVisible);
      }
    });
  }

  // Copy to Clipboard - Improved version using same logic as export
  if (copyClipboardBtn) {
    copyClipboardBtn.addEventListener('click', async () => {
      const canvasWrapper = document.getElementById('canvasWrapper');
      if (!canvasWrapper) return;

      if (!navigator.clipboard || !window.ClipboardItem) {
        showToast('Clipboard API not supported in this browser', 'error');
        return;
      }

      // Store button state (preserve HTML including unicode character)
      const originalButtonHTML = copyClipboardBtn.innerHTML;
      const originalDisabled = copyClipboardBtn.disabled;
      copyClipboardBtn.innerHTML = 'Copying...';
      copyClipboardBtn.disabled = true;

      // Store original styles to restore later
      let originalStyles = {
        width: canvasWrapper.style.width,
        height: canvasWrapper.style.height,
        transform: canvasWrapper.style.transform,
        transformOrigin: canvasWrapper.style.transformOrigin,
        maxWidth: canvasWrapper.style.maxWidth,
        maxHeight: canvasWrapper.style.maxHeight,
        minWidth: canvasWrapper.style.minWidth,
        minHeight: canvasWrapper.style.minHeight,
        boxSizing: canvasWrapper.style.boxSizing,
        flexShrink: canvasWrapper.style.flexShrink,
        flexGrow: canvasWrapper.style.flexGrow,
        overflow: canvasWrapper.style.overflow,
      };

      try {
        // Import the convertMaskedLogoToImage function from export.js
        const exportModule = await import('./export.js');
        const convertMaskedLogoToImage = exportModule.convertMaskedLogoToImage;

        // CRITICAL: Remove all transforms and scaling for copy
        canvasWrapper.style.setProperty('width', `${currentImageType.width}px`, 'important');
        canvasWrapper.style.setProperty('height', `${currentImageType.height}px`, 'important');
        canvasWrapper.style.setProperty('transform', 'none', 'important');
        canvasWrapper.style.setProperty('transform-origin', 'top left', 'important');
        canvasWrapper.style.setProperty('max-width', 'none', 'important');
        canvasWrapper.style.setProperty('max-height', 'none', 'important');
        canvasWrapper.style.setProperty('min-width', `${currentImageType.width}px`, 'important');
        canvasWrapper.style.setProperty('min-height', `${currentImageType.height}px`, 'important');
        canvasWrapper.style.setProperty('box-sizing', 'border-box', 'important');
        canvasWrapper.style.setProperty('flex-shrink', '0', 'important');
        canvasWrapper.style.setProperty('flex-grow', '0', 'important');
        canvasWrapper.style.setProperty('overflow', 'visible', 'important');
        canvasWrapper.style.setProperty('position', 'relative', 'important');

        // Convert masked logos to images (same as export)
        const logoContainers = canvasWrapper.querySelectorAll('.logo-masked');
        const replacements = [];

        for (const container of logoContainers) {
          const convertedImg = await convertMaskedLogoToImage(container);
          if (convertedImg) {
            replacements.push({ original: container });
            const img = document.createElement('img');
            img.src = convertedImg.src;
            img.style.cssText = container.style.cssText;
            img.style.maskImage = 'none';
            img.style.webkitMaskImage = 'none';
            img.style.backgroundColor = 'transparent';
            container.parentNode.insertBefore(img, container);
            container.style.display = 'none';
            replacements[replacements.length - 1].replacement = img;
          }
        }

        // Get computed styles for background
        const computedStyle = window.getComputedStyle(canvasWrapper);
        const backgroundProps = {
          backgroundImage: computedStyle.backgroundImage,
          backgroundSize: computedStyle.backgroundSize,
          backgroundPosition: computedStyle.backgroundPosition,
          backgroundRepeat: computedStyle.backgroundRepeat,
          backgroundColor: computedStyle.backgroundColor,
          background: computedStyle.background,
        };

        // Pre-process canvas-based backgrounds
        if (
          backgroundProps.backgroundImage &&
          backgroundProps.backgroundImage !== 'none' &&
          backgroundProps.backgroundImage.includes('data:image')
        ) {
          const dataUrlMatches = backgroundProps.backgroundImage.match(
            /url\(['"]?(data:image\/[^'"]+)['"]?\)/g
          );
          if (dataUrlMatches && dataUrlMatches.length > 0) {
            const imagePromises = dataUrlMatches.map(match => {
              const dataUrl = match.replace(/url\(['"]?/, '').replace(/['"]?\)/, '');
              return new Promise(resolve => {
                const img = new Image();
                img.onload = () => resolve(dataUrl);
                img.onerror = () => resolve(dataUrl);
                img.src = dataUrl;
              });
            });
            await Promise.all(imagePromises);
            canvasWrapper.style.setProperty(
              'background-image',
              backgroundProps.backgroundImage,
              'important'
            );
          }
        }

        // Pre-load external background images
        const bgImageUrls = [];
        if (backgroundProps.backgroundImage && backgroundProps.backgroundImage !== 'none') {
          const urlMatches = backgroundProps.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/g);
          if (urlMatches) {
            urlMatches.forEach(match => {
              const url = match.replace(/url\(['"]?/, '').replace(/['"]?\)/, '');
              if (url && !url.startsWith('data:')) {
                bgImageUrls.push(url);
              }
            });
          }
        }

        if (bgImageUrls.length > 0) {
          await Promise.all(
            bgImageUrls.map(url => {
              return new Promise(resolve => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = resolve;
                img.onerror = resolve;
                img.src = url;
              });
            })
          );
        }

        // Wait for DOM to settle
        await new Promise(resolve => setTimeout(resolve, 150));

        const html2canvas = await loadHtml2Canvas();

        // Use same options as export for consistency
        const canvas = await html2canvas(canvasWrapper, {
          width: currentImageType.width,
          height: currentImageType.height,
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          logging: false,
          allowTaint: true,
          removeContainer: false,
          windowWidth: currentImageType.width,
          windowHeight: currentImageType.height,
          x: 0,
          y: 0,
          // Ensure background images are captured
          onclone: (clonedDoc, clonedWindow) => {
            const clonedWrapper = clonedDoc.getElementById('canvasWrapper');
            if (clonedWrapper && backgroundProps) {
              clonedWrapper.style.setProperty('background-attachment', 'scroll', 'important');
              clonedWrapper.style.setProperty('background-clip', 'border-box', 'important');
              clonedWrapper.style.setProperty('background-origin', 'padding-box', 'important');

              if (backgroundProps.backgroundImage && backgroundProps.backgroundImage !== 'none') {
                clonedWrapper.style.setProperty(
                  'background-image',
                  backgroundProps.backgroundImage,
                  'important'
                );
              }
              if (backgroundProps.backgroundSize && backgroundProps.backgroundSize !== 'auto') {
                clonedWrapper.style.setProperty(
                  'background-size',
                  backgroundProps.backgroundSize,
                  'important'
                );
              }
              if (backgroundProps.backgroundPosition) {
                clonedWrapper.style.setProperty(
                  'background-position',
                  backgroundProps.backgroundPosition,
                  'important'
                );
              }
              if (backgroundProps.backgroundRepeat) {
                clonedWrapper.style.setProperty(
                  'background-repeat',
                  backgroundProps.backgroundRepeat,
                  'important'
                );
              }
              if (
                backgroundProps.backgroundColor &&
                backgroundProps.backgroundColor !== 'rgba(0, 0, 0, 0)'
              ) {
                clonedWrapper.style.setProperty(
                  'background-color',
                  backgroundProps.backgroundColor,
                  'important'
                );
              }
            }
          },
        });

        // Create final canvas with exact dimensions to avoid positioning issues
        const scale = 2; // Match the scale used in html2canvas
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = currentImageType.width * scale;
        finalCanvas.height = currentImageType.height * scale;
        const ctx = finalCanvas.getContext('2d');

        // Draw the captured canvas to the final canvas at exact size
        // This ensures no extra space or positioning issues
        ctx.drawImage(
          canvas,
          0,
          0,
          currentImageType.width * scale,
          currentImageType.height * scale
        );

        // Copy to clipboard
        finalCanvas.toBlob(async blob => {
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            showToast('Image copied to clipboard!', 'success');
          } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            showToast('Failed to copy to clipboard', 'error');
          } finally {
            // Restore original container styles
            if (canvasContainer && originalContainerStyles) {
              Object.keys(originalContainerStyles).forEach(key => {
                const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                if (originalContainerStyles[key]) {
                  canvasContainer.style.setProperty(
                    cssKey,
                    originalContainerStyles[key],
                    'important'
                  );
                } else {
                  canvasContainer.style.removeProperty(cssKey);
                }
              });
            }

            // Restore original styles
            Object.keys(originalStyles).forEach(key => {
              const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
              if (originalStyles[key]) {
                canvasWrapper.style.setProperty(cssKey, originalStyles[key], 'important');
              } else {
                canvasWrapper.style.removeProperty(cssKey);
              }
            });

            // Restore masked logo containers
            replacements.forEach(({ original, replacement }) => {
              if (replacement && replacement.parentNode) {
                replacement.parentNode.removeChild(replacement);
              }
              if (original) {
                original.style.display = '';
              }
            });

            // Restore button state
            copyClipboardBtn.innerHTML = originalButtonHTML;
            copyClipboardBtn.disabled = originalDisabled;
          }
        }, 'image/png');
      } catch (err) {
        console.error('Error copying to clipboard:', err);
        showToast('Failed to copy to clipboard', 'error');

        // Restore original styles on error
        canvasWrapper.style.width = originalStyles.width || '';
        canvasWrapper.style.height = originalStyles.height || '';
        canvasWrapper.style.transform = originalStyles.transform || '';
        canvasWrapper.style.transformOrigin = originalStyles.transformOrigin || '';
        canvasWrapper.style.maxWidth = originalStyles.maxWidth || '';
        canvasWrapper.style.maxHeight = originalStyles.maxHeight || '';
        canvasWrapper.style.minWidth = originalStyles.minWidth || '';
        canvasWrapper.style.minHeight = originalStyles.minHeight || '';
        canvasWrapper.style.boxSizing = originalStyles.boxSizing || '';
        canvasWrapper.style.flexShrink = originalStyles.flexShrink || '';
        canvasWrapper.style.flexGrow = originalStyles.flexGrow || '';
        canvasWrapper.style.overflow = originalStyles.overflow || '';

        // Restore button state
        copyClipboardBtn.innerHTML = originalButtonHTML;
        copyClipboardBtn.disabled = originalDisabled;
      }
    });
  }

  // Fullscreen toggle
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      const canvasContainer = document.getElementById('canvasContainer');
      if (!canvasContainer) return;

      if (!document.fullscreenElement) {
        canvasContainer
          .requestFullscreen()
          .then(() => {
            fullscreenBtn.textContent = '⛶';
            fullscreenBtn.title = 'Exit Fullscreen';
          })
          .catch(err => {
            console.error('Error entering fullscreen:', err);
            showToast('Failed to enter fullscreen', 'error');
          });
      } else {
        document
          .exitFullscreen()
          .then(() => {
            fullscreenBtn.textContent = '⛶';
            fullscreenBtn.title = 'Toggle Fullscreen';
          })
          .catch(err => {
            console.error('Error exiting fullscreen:', err);
          });
      }
    });

    // Update button state when fullscreen changes
    document.addEventListener('fullscreenchange', () => {
      if (fullscreenBtn) {
        if (document.fullscreenElement) {
          fullscreenBtn.textContent = '⛶';
          fullscreenBtn.title = 'Exit Fullscreen';
        } else {
          fullscreenBtn.textContent = '⛶';
          fullscreenBtn.title = 'Toggle Fullscreen';
        }
      }
    });
  }

  // Ruler/Guides system - now handled by ruler-guides.js module

  // Zoom Toggle Button
  const fullscreenZoomBtn = document.getElementById('fullscreenZoomBtn');
  if (fullscreenZoomBtn) {
      const zoomIndicator = document.getElementById('zoomIndicator');
      const canvasWrapper = document.getElementById('canvasWrapper');
      const canvasContainer = document.getElementById('canvasContainer');

      // Make zoom button always visible (not just in fullscreen)
      fullscreenZoomBtn.style.display = 'block';

      const updateZoomUI = () => {
        const level = getZoomLevel();
        let displayText = '';
        if (level === 'fit') {
          displayText = 'Fit';
          if (zoomIndicator) zoomIndicator.style.display = 'none';
        } else {
          displayText = `${Math.round(level * 100)}%`;
          if (zoomIndicator) {
            zoomIndicator.textContent = displayText;
            zoomIndicator.style.display = 'block';
          }
        }
        fullscreenZoomBtn.title = `Zoom: ${displayText}`;
      };

      const handleZoomClick = () => {
        cycleZoomLevel();
        updateZoomUI();

        // Update grid and rulers if visible
        const canvasWrapper = document.getElementById('canvasWrapper');
        if (canvasWrapper && isGridOverlayVisible()) {
          updateGridOverlayDimensions(currentImageType.width, currentImageType.height);
        }
      };

      // Attach zoom functionality to fullscreenZoomBtn
      fullscreenZoomBtn.addEventListener('click', handleZoomClick);

      // Make zoom indicator clickable to reset to 'fit'
      if (zoomIndicator) {
        zoomIndicator.style.cursor = 'pointer';
        zoomIndicator.title = 'Click to reset zoom to Fit';
        zoomIndicator.addEventListener('click', () => {
          setZoomLevel('fit');
          updateZoomUI();

          // Update grid and rulers if visible
          const canvasWrapper = document.getElementById('canvasWrapper');
          if (canvasWrapper && isGridOverlayVisible()) {
            updateGridOverlayDimensions(currentImageType.width, currentImageType.height);
          }
        });
      }

      // Pan functionality when zoomed in
      if (canvasWrapper && canvasContainer) {
        let isPanning = false;
        let panStartX = 0;
        let panStartY = 0;
        let initialPanX = 0;
        let initialPanY = 0;
        let touchIdentifier = null;

        const getEventPoint = e => {
          if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
          }
          return { x: e.clientX, y: e.clientY };
        };

        const startPan = e => {
          const level = getZoomLevel();
          if (level === 'fit') return; // No panning when fit to container

          // For touch events, only handle single touch
          if (e.touches) {
            if (e.touches.length !== 1) return;
            touchIdentifier = e.touches[0].identifier;
          }

          e.preventDefault();
          e.stopPropagation();

          const currentPan = getPan();
          initialPanX = currentPan.x;
          initialPanY = currentPan.y;

          const containerRect = canvasContainer.getBoundingClientRect();
          const point = getEventPoint(e);

          // Calculate point relative to container
          panStartX = point.x - containerRect.left;
          panStartY = point.y - containerRect.top;

          isPanning = true;
          canvasWrapper.style.cursor = 'grabbing';
          canvasWrapper.style.userSelect = 'none';
        };

        const doPan = e => {
          if (!isPanning) return;

          // For touch events, match the touch identifier
          if (e.touches) {
            const touch = Array.from(e.touches).find(t => t.identifier === touchIdentifier);
            if (!touch) return;
          }

          e.preventDefault();
          e.stopPropagation();

          const containerRect = canvasContainer.getBoundingClientRect();
          const point = getEventPoint(e);

          // Calculate current point relative to container
          const currentX = point.x - containerRect.left;
          const currentY = point.y - containerRect.top;

          // Calculate delta from start position
          const deltaX = currentX - panStartX;
          const deltaY = currentY - panStartY;

          // Apply delta to initial pan position
          let newPanX = initialPanX + deltaX;
          let newPanY = initialPanY + deltaY;

          // Constrain panning to prevent moving too far
          const level = getZoomLevel();
          const canvasWidth = currentImageType.width;
          const canvasHeight = currentImageType.height;
          const padding = 24;
          const containerWidth = containerRect.width - padding;
          const containerHeight = containerRect.height - padding;

          const scaledWidth = canvasWidth * level;
          const scaledHeight = canvasHeight * level;

          // Calculate bounds: center offset + pan limits
          const centerOffsetX = (containerWidth - scaledWidth) / 2;
          const centerOffsetY = (containerHeight - scaledHeight) / 2;

          // Maximum pan is when edges align with container edges
          const maxPanX = Math.max(0, (scaledWidth - containerWidth) / 2);
          const maxPanY = Math.max(0, (scaledHeight - containerHeight) / 2);

          // Constrain pan within bounds
          newPanX = Math.max(-maxPanX, Math.min(maxPanX, newPanX));
          newPanY = Math.max(-maxPanY, Math.min(maxPanY, newPanY));

          setPan(newPanX, newPanY);
        };

        const endPan = e => {
          if (!isPanning) return;

          // For touch events, only end if it's the same touch
          if (e.touches) {
            const touch = Array.from(e.touches).find(t => t.identifier === touchIdentifier);
            if (touch) return; // Still touching, don't end
          }

          isPanning = false;
          touchIdentifier = null;
          const level = getZoomLevel();
          canvasWrapper.style.cursor = level === 'fit' ? '' : 'grab';
          canvasWrapper.style.userSelect = '';
        };

        // Mouse events
        canvasWrapper.addEventListener('mousedown', startPan);
        document.addEventListener('mousemove', doPan);
        document.addEventListener('mouseup', endPan);
        canvasWrapper.addEventListener('mouseleave', endPan);

        // Touch events
        canvasWrapper.addEventListener('touchstart', startPan, { passive: false });
        document.addEventListener('touchmove', doPan, { passive: false });
        document.addEventListener('touchend', endPan);
        document.addEventListener('touchcancel', endPan);
      }

      // Initialize zoom UI
      updateZoomUI();
    }

  // Contrast / Invert Colors Toggle
  if (contrastToggleBtn) {
      let isContrastInverted = false;
      const canvasContainer = document.getElementById('canvasContainer');

      contrastToggleBtn.addEventListener('click', () => {
        if (canvasContainer) {
          isContrastInverted = !isContrastInverted;

          if (isContrastInverted) {
            // Apply invert filter for contrast testing
            canvasContainer.style.filter = 'invert(1)';
            canvasContainer.style.transition = 'filter 0.3s ease';
          } else {
            // Remove filter
            canvasContainer.style.filter = '';
          }

          contrastToggleBtn.classList.toggle('active', isContrastInverted);
        }
      });
    }

  if (transparencyCheckerBtn) {
      let isTransparencyCheckerActive = false;
      const canvasContainer = document.querySelector('.canvas-container');

      transparencyCheckerBtn.addEventListener('click', () => {
        if (canvasContainer) {
          isTransparencyCheckerActive = !isTransparencyCheckerActive;

          if (isTransparencyCheckerActive) {
            // Add transparency checkerboard class
            canvasContainer.classList.add('transparency-checker');
          } else {
            // Remove transparency checkerboard class
            canvasContainer.classList.remove('transparency-checker');
          }

          transparencyCheckerBtn.classList.toggle('active', isTransparencyCheckerActive);
        }
      });
    }

  // Layer Visibility Toggle
  if (layerVisibilityBtn) {
      const layerVisibilityPanel = document.getElementById('layerVisibilityPanel');
      const layerVisibilityHeader = layerVisibilityPanel?.querySelector('.layer-visibility-header');
      let isLayerVisibilityPanelOpen = false;
      let isDragging = false;
      let dragOffset = { x: 0, y: 0 };
      let panelPosition = { x: null, y: null };

      // Load saved position from localStorage
      const savedPosition = localStorage.getItem('layerVisibilityPanelPosition');
      if (savedPosition && layerVisibilityPanel) {
        try {
          const pos = JSON.parse(savedPosition);
          panelPosition = pos;
          layerVisibilityPanel.style.left = `${pos.x}px`;
          layerVisibilityPanel.style.top = `${pos.y}px`;
          layerVisibilityPanel.style.transform = 'none';
        } catch (e) {
          console.warn('Failed to load layer visibility panel position:', e);
        }
      }

      // Drag functionality
      if (layerVisibilityHeader && layerVisibilityPanel) {
        layerVisibilityHeader.addEventListener('mousedown', e => {
        // Prevent dragging if clicking the close button
        if (e.target.id === 'closeLayerVisibilityBtn' || e.target.closest('#closeLayerVisibilityBtn')) {
            return;
          }

          isDragging = true;
          layerVisibilityHeader.classList.add('dragging');

          const rect = layerVisibilityPanel.getBoundingClientRect();
          dragOffset.x = e.clientX - rect.left;
          dragOffset.y = e.clientY - rect.top;

          e.preventDefault();
        });

        document.addEventListener('mousemove', e => {
          if (isDragging && layerVisibilityPanel) {
            const x = e.clientX - dragOffset.x;
            const y = e.clientY - dragOffset.y;

            // Constrain to viewport bounds
            const maxX = window.innerWidth - layerVisibilityPanel.offsetWidth;
            const maxY = window.innerHeight - layerVisibilityPanel.offsetHeight;

            const constrainedX = Math.max(0, Math.min(x, maxX));
            const constrainedY = Math.max(0, Math.min(y, maxY));

            layerVisibilityPanel.style.left = `${constrainedX}px`;
            layerVisibilityPanel.style.top = `${constrainedY}px`;
            layerVisibilityPanel.style.transform = 'none';

            // Save position
            panelPosition = { x: constrainedX, y: constrainedY };
            localStorage.setItem('layerVisibilityPanelPosition', JSON.stringify(panelPosition));
          }
        });

        document.addEventListener('mouseup', () => {
          if (isDragging) {
            isDragging = false;
            if (layerVisibilityHeader) {
              layerVisibilityHeader.classList.remove('dragging');
            }
          }
        });
      }

      layerVisibilityBtn.addEventListener('click', () => {
        if (layerVisibilityPanel) {
          isLayerVisibilityPanelOpen = !isLayerVisibilityPanelOpen;
          layerVisibilityPanel.style.display = isLayerVisibilityPanelOpen ? 'flex' : 'none';
          layerVisibilityBtn.classList.toggle('active', isLayerVisibilityPanelOpen);

          // Restore position if saved, otherwise center
          if (isLayerVisibilityPanelOpen) {
            if (panelPosition.x !== null && panelPosition.y !== null) {
              layerVisibilityPanel.style.left = `${panelPosition.x}px`;
              layerVisibilityPanel.style.top = `${panelPosition.y}px`;
              layerVisibilityPanel.style.transform = 'none';
            } else {
              // Center on first open
              layerVisibilityPanel.style.left = '50%';
              layerVisibilityPanel.style.top = '50%';
              layerVisibilityPanel.style.transform = 'translate(-50%, -50%)';
            }
          }
        }
      });

      if (closeLayerVisibilityBtn) {
        closeLayerVisibilityBtn.addEventListener('click', () => {
          if (layerVisibilityPanel) {
            layerVisibilityPanel.style.display = 'none';
            isLayerVisibilityPanelOpen = false;
            layerVisibilityBtn.classList.remove('active');
          }
        });
      }

      // Layer visibility checkboxes
      const layerCheckboxes = {
        logo: document.getElementById('layerVisibilityLogo'),
        title: document.getElementById('layerVisibilityTitle'),
        subtitle: document.getElementById('layerVisibilitySubtitle'),
        slogan: document.getElementById('layerVisibilitySlogan'),
        pattern: document.getElementById('layerVisibilityPattern'),
      };

      // Apply visibility when checkboxes change
      Object.entries(layerCheckboxes).forEach(([layerName, checkbox]) => {
        if (checkbox) {
          checkbox.addEventListener('change', () => {
            applyLayerVisibility();
          });
        }
      });
    }

  // History Timeline
  if (historyTimelineBtn) {
    historyTimelineBtn.addEventListener('click', () => {
      const historyTimeline = document.getElementById('historyTimeline');
      if (historyTimeline) {
        const isVisible = historyTimeline.style.display !== 'none' && historyTimeline.style.display !== '';
        historyTimeline.style.display = isVisible ? 'none' : 'flex';
        historyTimelineBtn.classList.toggle('active', !isVisible);

        if (!isVisible) {
          // Center or restore position
          const savedPosition = localStorage.getItem('historyTimelinePosition');
          if (savedPosition) {
            try {
              const pos = JSON.parse(savedPosition);
              historyTimeline.style.left = `${pos.x}px`;
              historyTimeline.style.top = `${pos.y}px`;
              historyTimeline.style.transform = 'none';
            } catch (e) {
              // Center if position load fails
              historyTimeline.style.left = '50%';
              historyTimeline.style.top = '50%';
              historyTimeline.style.transform = 'translate(-50%, -50%)';
            }
          } else {
            historyTimeline.style.left = '50%';
            historyTimeline.style.top = '50%';
            historyTimeline.style.transform = 'translate(-50%, -50%)';
          }
          updateHistoryTimeline();
        }
      }
    });
  }

  if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener('click', () => {
      const historyTimeline = document.getElementById('historyTimeline');
      if (historyTimeline) {
        historyTimeline.style.display = 'none';
        if (historyTimelineBtn) {
          historyTimelineBtn.classList.remove('active');
        }
      }
    });
  }

  // Make History Timeline draggable
  const historyTimeline = document.getElementById('historyTimeline');
  const historyTimelineHeader = historyTimeline?.querySelector('.history-timeline-header');
  if (historyTimelineHeader && historyTimeline) {
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let panelPosition = { x: null, y: null };

    // Load saved position from localStorage
    const savedPosition = localStorage.getItem('historyTimelinePosition');
    if (savedPosition) {
      try {
        const pos = JSON.parse(savedPosition);
        panelPosition = pos;
        historyTimeline.style.left = `${pos.x}px`;
        historyTimeline.style.top = `${pos.y}px`;
        historyTimeline.style.transform = 'none';
      } catch (e) {
        console.warn('Failed to load history timeline position:', e);
      }
    }

    historyTimelineHeader.addEventListener('mousedown', e => {
      // Prevent dragging if clicking the close button
      if (e.target.id === 'closeHistoryBtn' || e.target.closest('#closeHistoryBtn')) {
        return;
      }

      isDragging = true;
      historyTimelineHeader.classList.add('dragging');

      const rect = historyTimeline.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;

      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (isDragging && historyTimeline) {
        const x = e.clientX - dragOffset.x;
        const y = e.clientY - dragOffset.y;

        // Constrain to viewport bounds
        const maxX = window.innerWidth - historyTimeline.offsetWidth;
        const maxY = window.innerHeight - historyTimeline.offsetHeight;

        const constrainedX = Math.max(0, Math.min(x, maxX));
        const constrainedY = Math.max(0, Math.min(y, maxY));

        historyTimeline.style.left = `${constrainedX}px`;
        historyTimeline.style.top = `${constrainedY}px`;
        historyTimeline.style.transform = 'none';

        // Save position
        panelPosition = { x: constrainedX, y: constrainedY };
        localStorage.setItem('historyTimelinePosition', JSON.stringify(panelPosition));
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        if (historyTimelineHeader) {
          historyTimelineHeader.classList.remove('dragging');
        }
      }
    });
  }

  // Composition Overlays Panel
  let isCompositionOverlaysPanelOpen = false;
  const compositionOverlaysPanel = document.getElementById('compositionOverlaysPanel');
  const compositionOverlaysHeader = compositionOverlaysPanel
    ? compositionOverlaysPanel.querySelector('.composition-overlays-header')
    : null;

  // Drag functionality for composition overlays panel
  if (compositionOverlaysPanel && compositionOverlaysHeader) {
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let panelPosition = { x: null, y: null };

    // Load saved position from localStorage
    const savedPosition = localStorage.getItem('compositionOverlaysPanelPosition');
    if (savedPosition && compositionOverlaysPanel) {
      try {
        const pos = JSON.parse(savedPosition);
        panelPosition = pos;
        compositionOverlaysPanel.style.left = `${pos.x}px`;
        compositionOverlaysPanel.style.top = `${pos.y}px`;
        compositionOverlaysPanel.style.transform = 'none';
      } catch (e) {
        console.warn('Failed to load composition overlays panel position:', e);
      }
    }

    // Drag functionality
    compositionOverlaysHeader.addEventListener('mousedown', e => {
      // Don't start dragging if clicking on the close button
      if (e.target.closest('.preset-btn')) {
        return;
      }

      isDragging = true;
      compositionOverlaysHeader.classList.add('dragging');

      const rect = compositionOverlaysPanel.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;

      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (isDragging && compositionOverlaysPanel) {
        const x = e.clientX - dragOffset.x;
        const y = e.clientY - dragOffset.y;

        // Constrain to viewport bounds
        const maxX = window.innerWidth - compositionOverlaysPanel.offsetWidth;
        const maxY = window.innerHeight - compositionOverlaysPanel.offsetHeight;

        const constrainedX = Math.max(0, Math.min(x, maxX));
        const constrainedY = Math.max(0, Math.min(y, maxY));

        compositionOverlaysPanel.style.left = `${constrainedX}px`;
        compositionOverlaysPanel.style.top = `${constrainedY}px`;
        compositionOverlaysPanel.style.transform = 'none';

        // Save position
        panelPosition = { x: constrainedX, y: constrainedY };
        localStorage.setItem('compositionOverlaysPanelPosition', JSON.stringify(panelPosition));
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        if (compositionOverlaysHeader) {
          compositionOverlaysHeader.classList.remove('dragging');
        }
      }
    });

    if (compositionOverlaysBtn) {
      compositionOverlaysBtn.addEventListener('click', () => {
        if (compositionOverlaysPanel) {
          isCompositionOverlaysPanelOpen = !isCompositionOverlaysPanelOpen;
          compositionOverlaysPanel.style.display = isCompositionOverlaysPanelOpen ? 'flex' : 'none';
          compositionOverlaysBtn.classList.toggle('active', isCompositionOverlaysPanelOpen);

          // Restore position if saved, otherwise center
          if (isCompositionOverlaysPanelOpen) {
            if (panelPosition.x !== null && panelPosition.y !== null) {
              compositionOverlaysPanel.style.left = `${panelPosition.x}px`;
              compositionOverlaysPanel.style.top = `${panelPosition.y}px`;
              compositionOverlaysPanel.style.transform = 'none';
            } else {
              // Center on first open
              compositionOverlaysPanel.style.left = '50%';
              compositionOverlaysPanel.style.top = '50%';
              compositionOverlaysPanel.style.transform = 'translate(-50%, -50%)';
            }
          }
        }
      });
    }

    if (closeCompositionOverlaysBtn) {
      closeCompositionOverlaysBtn.addEventListener('click', () => {
        if (compositionOverlaysPanel) {
          compositionOverlaysPanel.style.display = 'none';
          isCompositionOverlaysPanelOpen = false;
          if (compositionOverlaysBtn) {
            compositionOverlaysBtn.classList.remove('active');
          }
        }
      });
    }
  } else {
    // Fallback if header not found
    if (compositionOverlaysBtn) {
      compositionOverlaysBtn.addEventListener('click', () => {
        if (compositionOverlaysPanel) {
          isCompositionOverlaysPanelOpen = !isCompositionOverlaysPanelOpen;
          compositionOverlaysPanel.style.display = isCompositionOverlaysPanelOpen ? 'flex' : 'none';
          compositionOverlaysBtn.classList.toggle('active', isCompositionOverlaysPanelOpen);
        }
      });
    }

    if (closeCompositionOverlaysBtn) {
      closeCompositionOverlaysBtn.addEventListener('click', () => {
        if (compositionOverlaysPanel) {
          compositionOverlaysPanel.style.display = 'none';
          isCompositionOverlaysPanelOpen = false;
          if (compositionOverlaysBtn) {
            compositionOverlaysBtn.classList.remove('active');
          }
        }
      });
    }
  }

  // Overlay toggle buttons
  const overlayButtons = document.querySelectorAll('.overlay-btn[data-overlay]');
  overlayButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const overlayType = btn.dataset.overlay;
      toggleCompositionOverlay(overlayType);

      // Update button active state
      overlayButtons.forEach(b => b.classList.remove('active'));
      const state = getCompositionOverlayState();
      if (state.isActive && state.currentOverlay === overlayType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  });

  // Update button states when overlay changes
  function updateOverlayButtonStates() {
    const state = getCompositionOverlayState();
    overlayButtons.forEach(btn => {
      const overlayType = btn.dataset.overlay;
      if (state.isActive && state.currentOverlay === overlayType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Periodically update button states (in case overlay is toggled elsewhere)
  setInterval(updateOverlayButtonStates, 100);

  // Safe area platform selector
  if (safeAreaPlatformSelect) {
    safeAreaPlatformSelect.addEventListener('change', (e) => {
      setSafeAreaPlatform(e.target.value);
    });
  }

  // Aspect ratio selector
  if (aspectRatioSelect) {
    aspectRatioSelect.addEventListener('change', (e) => {
      setAspectRatio(e.target.value);
    });
  }

  // Rotation controls
  const overlayRotationSlider = document.getElementById('overlayRotation');
  const overlayRotationValue = document.getElementById('overlayRotationValue');

  function updateRotation(value) {
    const angle = parseFloat(value) || 0;
    setCompositionRotation(angle);
    if (overlayRotationSlider) overlayRotationSlider.value = angle;
    if (overlayRotationValue) overlayRotationValue.value = angle;
  }

  if (overlayRotationSlider) {
    overlayRotationSlider.addEventListener('input', (e) => {
      updateRotation(e.target.value);
    });
  }

  if (overlayRotationValue) {
    overlayRotationValue.addEventListener('input', (e) => {
      updateRotation(e.target.value);
    });
  }

  async function updateHistoryTimeline() {
    const historyTimelineContent = document.getElementById('historyTimelineContent');
    if (!historyTimelineContent) return;

    const history = getHistory();
    historyTimelineContent.innerHTML = '';

    if (history.length === 0) {
      historyTimelineContent.innerHTML =
        '<p style="color: #b0b0b0; text-align: center; padding: 1rem;">No history available</p>';
      return;
    }

    // Show history in reverse order (newest first)
    const reversedHistory = [...history].reverse();
    const currentHistoryIndex = getHistoryIndex();

    // Show loading state
    historyTimelineContent.innerHTML = '<p style="color: #b0b0b0; text-align: center; padding: 1rem;">Generating previews...</p>';

    // Generate thumbnails sequentially to avoid overwhelming the browser
    // and to ensure each state is properly rendered
    const thumbnails = [];
    for (let reverseIndex = 0; reverseIndex < reversedHistory.length; reverseIndex++) {
      const state = reversedHistory[reverseIndex];
      const actualIndex = history.length - 1 - reverseIndex;
      try {
        console.log(`Generating thumbnail ${reverseIndex + 1}/${reversedHistory.length} for index ${actualIndex}`);
        const thumbnail = await generateHistoryThumbnail(state, actualIndex);
        thumbnails.push(thumbnail);
        console.log(`Thumbnail ${reverseIndex + 1} generated:`, thumbnail ? 'Success' : 'Failed');
      } catch (err) {
        console.error(`Error generating thumbnail for index ${actualIndex}:`, err);
        thumbnails.push(null);
      }
    }

    console.log('Generated thumbnails:', thumbnails.filter(t => t !== null).length, 'out of', thumbnails.length);

    // Clear loading state
    historyTimelineContent.innerHTML = '';

    reversedHistory.forEach((state, reverseIndex) => {
      const actualIndex = history.length - 1 - reverseIndex;
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      if (actualIndex === currentHistoryIndex) {
        historyItem.classList.add('active');
      }

      // Get thumbnail or fallback to text preview
      const thumbnail = thumbnails[reverseIndex];
      const previewText = state.title ? state.title.substring(0, 10) : 'Empty';
      const previewColor = state.titleColor || '#00ffff';

      let previewHTML = '';
      if (thumbnail) {
        console.log(`Thumbnail for index ${actualIndex}:`, thumbnail.substring(0, 50) + '...');
        previewHTML = `<img src="${thumbnail}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" onerror="console.error('Failed to load thumbnail for index ${actualIndex}'); this.parentElement.innerHTML='<div style=\\'background: ${previewColor}; color: #0a0a0a; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: bold; padding: 0.25rem; width: 100%; height: 100%;\\'>${previewText}</div>';" />`;
      } else {
        console.warn(`No thumbnail for index ${actualIndex}, using fallback`);
        // Fallback to text preview if thumbnail generation failed
        previewHTML = `<div style="background: ${previewColor}; color: #0a0a0a; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: bold; padding: 0.25rem; width: 100%; height: 100%;">${previewText}</div>`;
      }

      historyItem.innerHTML = `
        <div class="history-item-preview">
          ${previewHTML}
        </div>
        <div class="history-item-info">
          <span class="history-item-index">#${actualIndex + 1}</span>
          <span class="history-item-time">State ${actualIndex + 1}</span>
        </div>
      `;

      historyItem.addEventListener('click', () => {
        const state = getStateAt(actualIndex);
        if (!state) {
          console.error('History state not found at index:', actualIndex);
          return;
        }

        console.log('Restoring history state at index:', actualIndex, state);
        setHistoryIndex(actualIndex);

        // Restore image type if stored in state
        if (state.imageType) {
          const imageType = state.imageType === 'twitter' ? IMAGE_TYPES.TWITTER : IMAGE_TYPES.OG;
          if (imageType !== currentImageType) {
            currentImageType = imageType;
            setImageType(currentImageType);
            updateGridOverlayDimensions(currentImageType.width, currentImageType.height);
            updateCompositionCanvasDimensions(currentImageType.width, currentImageType.height);

            // Update mode button active state
            document.querySelectorAll('.mode-btn').forEach(btn => {
              btn.classList.remove('active');
              if ((imageType === IMAGE_TYPES.OG && btn.dataset.mode === 'og') ||
                (imageType === IMAGE_TYPES.TWITTER && btn.dataset.mode === 'twitter')) {
                btn.classList.add('active');
              }
            });
          }
        }

        // Apply state to UI (this sets all input values)
        // This includes setting colors via setTimeout(0)
          applyStateToUI(state);

        // Wait for color pickers to be applied, then update state and preview
        // applyStateToUI uses setTimeout(0) for colors, so we need to wait for that
        // Use requestAnimationFrame to ensure DOM is ready, then setTimeout for async operations
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              // Force a reflow to ensure DOM updates are complete
              void document.body.offsetHeight;

              // Verify colors were applied by checking color pickers
              // If not, apply them again
              if (state.titleColor && getSelectedColorKey('titleColorPicker') !== state.titleColor) {
                setSelectedColor('titleColorPicker', state.titleColor);
              }
              if (state.subtitleColor && getSelectedColorKey('subtitleColorPicker') !== state.subtitleColor) {
                setSelectedColor('subtitleColorPicker', state.subtitleColor);
              }
              if (state.sloganColor && getSelectedColorKey('sloganColorPicker') !== state.sloganColor) {
                setSelectedColor('sloganColorPicker', state.sloganColor);
              }
              if (state.logoColor && getLogoColorKey() !== state.logoColor) {
                setLogoColor(state.logoColor);
              }

              // Small delay to ensure color picker updates are processed
              setTimeout(() => {
                console.log('Updating state and preview from restored history state');
                // Now update state from UI (which will read all the values we just set)
                // This ensures everything is in sync and calls updatePreview
          updateState(true); // Skip history to avoid duplicate entry

                // Update undo/redo buttons
                updateUndoRedoButtons();

                // Update timeline to reflect new active state
                updateHistoryTimeline();

                console.log('History state restoration complete');
              }, 50);
            }, 100); // Wait for initial color application
          });
        });

        // Close timeline modal
          const historyTimeline = document.getElementById('historyTimeline');
          if (historyTimeline) {
            historyTimeline.style.display = 'none';
            if (historyTimelineBtn) {
              historyTimelineBtn.classList.remove('active');
          }
        }
      });

      historyTimelineContent.appendChild(historyItem);
    });
  }

  // Thumbnail cache to avoid regenerating thumbnails
  const thumbnailCache = new Map();

  async function generateHistoryThumbnail(state, index) {
    // Check cache first
    const cacheKey = `thumb_${index}`;
    if (thumbnailCache.has(cacheKey)) {
      return thumbnailCache.get(cacheKey);
    }

    // Store current state outside try block for error handling
    let currentStateBackup = null;
    let currentImageTypeBackup = null;

    try {
      const canvasWrapper = document.getElementById('canvasWrapper');
      if (!canvasWrapper) {
        console.warn('Canvas wrapper not found for thumbnail generation');
        return null;
      }

      // Store current state
      currentStateBackup = JSON.parse(JSON.stringify(currentState));
      currentImageTypeBackup = currentImageType;

      // Temporarily apply the history state
      if (state.imageType) {
        const imageType = state.imageType === 'twitter' ? IMAGE_TYPES.TWITTER : IMAGE_TYPES.OG;
        if (imageType !== currentImageType) {
          currentImageType = imageType;
          setImageType(currentImageType);
        }
      }

      applyStateToUI(state);

      // Wait for color pickers to be applied
      await new Promise(resolve => {
        setTimeout(() => {
          // Verify colors were applied
          if (state.titleColor && getSelectedColorKey('titleColorPicker') !== state.titleColor) {
            setSelectedColor('titleColorPicker', state.titleColor);
          }
          if (state.subtitleColor && getSelectedColorKey('subtitleColorPicker') !== state.subtitleColor) {
            setSelectedColor('subtitleColorPicker', state.subtitleColor);
          }
          if (state.sloganColor && getSelectedColorKey('sloganColorPicker') !== state.sloganColor) {
            setSelectedColor('sloganColorPicker', state.sloganColor);
          }
          if (state.logoColor && getLogoColorKey() !== state.logoColor) {
            setLogoColor(state.logoColor);
          }
          resolve();
        }, 100);
      });

      // Update currentState from the history state for preview rendering
      // Don't call updateState() as it reads from UI and might add to history
      // Instead, directly call updatePreview with the state
      currentState = JSON.parse(JSON.stringify(state));
      updatePreview(currentState);

      // Wait for preview to render (updatePreview uses requestAnimationFrame)
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setTimeout(resolve, 300); // Give preview time to fully render
            });
          });
        });
      });

      // Generate thumbnail using html-to-image (loaded via loadHtml2Canvas)
      const htmlToImage = await loadHtml2Canvas();
      if (!htmlToImage || typeof htmlToImage.toCanvas !== 'function') {
        console.error('html-to-image library not loaded correctly');
        throw new Error('html-to-image library not available');
      }

      // Ensure canvas wrapper has correct dimensions for capture
      // html-to-image needs explicit width/height to capture the full element
      const thumbnailWidth = currentImageType.width;
      const thumbnailHeight = currentImageType.height;

      // Temporarily set explicit dimensions on canvas wrapper for capture
      const originalWidth = canvasWrapper.style.width;
      const originalHeight = canvasWrapper.style.height;
      const originalTransform = canvasWrapper.style.transform;
      canvasWrapper.style.width = `${thumbnailWidth}px`;
      canvasWrapper.style.height = `${thumbnailHeight}px`;
      canvasWrapper.style.transform = 'none'; // Remove any scaling transforms

      const thumbnailCanvas = await htmlToImage.toCanvas(canvasWrapper, {
        width: thumbnailWidth, // Base width
        height: thumbnailHeight, // Base height
        pixelRatio: 0.2, // Small scale for thumbnails (20% of original)
        useCORS: true,
        backgroundColor: null,
        cacheBust: false,
      });

      // Restore original dimensions and transform
      canvasWrapper.style.width = originalWidth;
      canvasWrapper.style.height = originalHeight;
      canvasWrapper.style.transform = originalTransform;

      // Convert to data URL
      const thumbnailDataUrl = thumbnailCanvas.toDataURL('image/png', 0.8);

      // Restore original state
      currentState = currentStateBackup;
      currentImageType = currentImageTypeBackup;
      applyStateToUI(currentStateBackup);
      if (currentImageTypeBackup !== currentImageType) {
        setImageType(currentImageTypeBackup);
      }
      // Don't call updateState() here - just call updatePreview directly to avoid any history issues
      updatePreview(currentStateBackup);

      // Cache the thumbnail
      thumbnailCache.set(cacheKey, thumbnailDataUrl);

      return thumbnailDataUrl;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      // Restore original state on error
      if (currentStateBackup && currentImageTypeBackup !== null) {
        currentState = JSON.parse(JSON.stringify(currentStateBackup));
        currentImageType = currentImageTypeBackup;
        applyStateToUI(currentStateBackup);
        if (currentImageTypeBackup !== currentImageType) {
          setImageType(currentImageTypeBackup);
        }
        updateState(true);
      }
      return null;
    }
  }

  // Background pattern
  if (backgroundPatternSelect) {
    // Store the pattern key in a variable that persists across updateState() calls
    let pendingPatternKey = null;

    backgroundPatternSelect.addEventListener('change', () => {
      const patternSelected = backgroundPatternSelect.value !== '';

      // CRITICAL: Capture the pattern key IMMEDIATELY and store it
      // This ensures it's available even if updateState() runs before defaults are applied
      pendingPatternKey = patternSelected ? backgroundPatternSelect.value.trim() : '';

      // Restore controls below dropdown when pattern is selected (in case they were hidden)
      // This ensures settings are visible after pattern selection
      // Access the function from the custom dropdown if it exists
      const customDropdown = window.customPatternDropdown || null;
      if (customDropdown && typeof customDropdown.toggleControlsBelowDropdown === 'function') {
        customDropdown.toggleControlsBelowDropdown(false);
      }

      // Make container visible FIRST to ensure DOM is ready
      if (patternCustomization) {
        patternCustomization.style.display = patternSelected ? 'block' : 'none';

        // Pattern Settings section stays collapsed by default (user can expand manually if needed)
        // Removed auto-expand behavior to keep it collapsed by default
      }

      // Apply pattern-specific defaults when a pattern is selected
      if (patternSelected && pendingPatternKey) {
        // Double-check the value is set correctly
        if (!pendingPatternKey || pendingPatternKey === '') {
          console.warn('[Pattern Selection] Pattern key is empty, cannot apply defaults');
          pendingPatternKey = null;
          updateState();
          return;
        }

        const defaults = patternDefaults[pendingPatternKey];

        if (defaults) {
          // Force a synchronous reflow to ensure the container is fully rendered
          // This ensures the color picker DOM is accessible
          if (patternCustomization) {
            patternCustomization.offsetHeight; // Force reflow
          }

          // Apply a random color from the palette to make it more engaging
          // Do this AFTER making container visible and forcing reflow
          try {
            const randomColor = getRandomColorKey();
            setSelectedColor('patternColorPicker', randomColor);
          } catch (e) {
            // Color picker might not be ready yet, try to set it anyway
            try {
              const randomColor = getRandomColorKey();
              setSelectedColor('patternColorPicker', randomColor);
            } catch (e2) {
              // If it still fails, fall back to cyan
              try {
                setSelectedColor('patternColorPicker', 'cyan');
              } catch (e3) {
                // If it still fails, the color will fall back to titleColor in preview.js
              }
            }
          }

          // Apply defaults to UI inputs - use setSliderValue to ensure UI updates properly
          setSliderValue(patternOpacitySlider, patternOpacityValue, defaults.opacity);
          setSliderValue(patternSizeSlider, patternSizeValue, defaults.size);
          setSliderValue(patternRotationSlider, patternRotationValue, defaults.rotation);
          setSliderValue(patternOffsetXSlider, patternOffsetXValue, defaults.offsetX);
          setSliderValue(patternOffsetYSlider, patternOffsetYValue, defaults.offsetY);
          setSliderValue(patternSpacingSlider, patternSpacingValue, defaults.spacing);
          setSliderValue(patternDensitySlider, patternDensityValue, defaults.density);
          setSliderValue(patternBlurSlider, patternBlurValue, defaults.blur);
          setSliderValue(patternScaleSlider, patternScaleValue, defaults.scale);
          setSliderValue(patternIntensitySlider, patternIntensityValue, defaults.intensity);

          // Update dropdown selects
          if (patternBlendModeSelect) {
            patternBlendModeSelect.value = defaults.blendMode;
          }
          if (patternRepeatSelect) {
            patternRepeatSelect.value = defaults.repeat;
          }

          // Force another synchronous reflow after setting all values
          // This ensures the browser has processed all the .value assignments
          void patternCustomization?.offsetHeight;

          // CRITICAL: Ensure the select value matches pendingPatternKey
          // This guarantees updateState() will read the correct value
          // Double-check and correct if needed
          if (backgroundPatternSelect.value !== pendingPatternKey) {
            console.warn('[Pattern Selection] Select value mismatch, correcting:', {
              expected: pendingPatternKey,
              actual: backgroundPatternSelect.value,
            });
            backgroundPatternSelect.value = pendingPatternKey;
          }

          // Update visual indicators for non-applicable settings
          updatePatternSettingAvailability(pendingPatternKey);

          // Initialize tooltips for pattern settings (if not already initialized)
          // Use a small delay to ensure DOM is ready
          setTimeout(() => {
            initPatternSettingsTooltips();
          }, 50);

          // CRITICAL: Update currentState with defaults to ensure state and UI are in sync
          // This ensures that when updateState() is called, it reads the correct values
          currentState.backgroundPattern = pendingPatternKey;
          currentState.patternOpacity = defaults.opacity;
          currentState.patternSize = defaults.size;
          currentState.patternRotation = defaults.rotation;
          currentState.patternBlendMode = defaults.blendMode;
          currentState.patternOffsetX = defaults.offsetX;
          currentState.patternOffsetY = defaults.offsetY;
          currentState.patternSpacing = defaults.spacing;
          currentState.patternDensity = defaults.density;
          currentState.patternBlur = defaults.blur;
          currentState.patternScale = defaults.scale;
          currentState.patternRepeat = defaults.repeat;
          currentState.patternIntensity = defaults.intensity;

          // Ensure pattern color is also in state
          try {
            const patternColorKey = getSelectedColorKey('patternColorPicker');
            if (patternColorKey) {
              currentState.patternColor = patternColorKey;
            }
          } catch (e) {
            // Fallback handled in preview.js
          }
        } else {
          console.warn('[Pattern Selection] No defaults found for pattern:', pendingPatternKey);
        }
      } else {
        // Reset all settings availability when no pattern is selected
        updatePatternSettingAvailability('');
        // Clear pending pattern key
        pendingPatternKey = '';
        // Clear pattern from state
        currentState.backgroundPattern = '';
      }

      // Call updateState() SYNCHRONOUSLY after applying defaults
      // pendingPatternKey is already set, and we've verified backgroundPatternSelect.value matches it
      // updateState() will read backgroundPatternSelect.value which is guaranteed to be correct
      // The state is already updated with defaults, so this will sync everything
      updateState();

      // Clear pending pattern key after updateState() has used it
      pendingPatternKey = null;
    });
  }

  // Initialize custom dropdown with hover previews (called from init() after setupEventListeners)
  // initCustomPatternDropdown();
  // initCustomExportQualityDropdown();

  // Logo X/Y position sliders are handled above with syncSliderInputDebounced

  // Initialize custom logo color dropdown
  initCustomLogoColorDropdown((colorKey, colorValue) => {
    // Update state when color is selected
    // Directly update state and preview without calling getLogoColorKey() again
    currentState.logoColor = colorKey;
    updateState(true); // Skip history to avoid duplicate entries
  });

  // Template select
  if (templateSelect) {
    templateSelect.addEventListener('change', () => {
      const templateKey = templateSelect.value;
      if (templateKey) {
        const templateState = applyTemplate(templateKey);
        if (templateState) {
          // Apply preset
          if (templateState.preset) {
            setPreset(templateState.preset);
            document.querySelector(`[data-preset="${templateState.preset}"]`)?.click();
          }

          // Merge template state with current state
          const mergedState = { ...currentState, ...templateState };
          applyStateToUI(mergedState);
          updateState(true); // Skip history for template load
        }
      }
    });
  }

  // Undo/Redo
  undoBtn.addEventListener('click', () => {
    const previousState = undo();
    if (previousState) {
      applyStateToUI(previousState);
      currentState = previousState;
      updatePreview(currentState);
      updateUndoRedoButtons();
    }
  });

  redoBtn.addEventListener('click', () => {
    const nextState = redo();
    if (nextState) {
      applyStateToUI(nextState);
      currentState = nextState;
      updatePreview(currentState);
      updateUndoRedoButtons();
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undoBtn.click();
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      redoBtn.click();
    }
  });

  // Save/Load presets
  savePresetBtn.addEventListener('click', () => {
    const name = presetNameInput.value.trim();
    if (!name) {
      showToast('Please enter a preset name', 'error');
      return;
    }

    // Update current state with colors before saving
    updateState(true);

    // Get current colors
    const stateWithColors = {
      ...currentState,
      titleColor: getSelectedColorKey('titleColorPicker'),
      subtitleColor: getSelectedColorKey('subtitleColorPicker'),
      sloganColor: getSelectedColorKey('sloganColorPicker'),
      dividerColor: getSelectedColorKey('dividerColorPicker'),
      titleDividerColor: getSelectedColorKey('titleDividerColorPicker'),
      subtitleDividerColor: getSelectedColorKey('subtitleDividerColorPicker'),
      sloganDividerColor: getSelectedColorKey('sloganDividerColorPicker'),
    };

    if (savePreset(name, stateWithColors)) {
      showToast(`Preset "${name}" saved successfully!`, 'success');
      populateSavedPresets();
      presetNameInput.value = '';
    } else {
      showToast('Error saving preset', 'error');
    }
  });

  loadPresetBtn.addEventListener('click', () => {
    const name = customPresetDropdown ? customPresetDropdown.getValue() : savedPresetsSelect.value;
    if (!name) {
      showToast('Please select a preset to load', 'error');
      return;
    }

    const savedState = loadPreset(name);
    if (savedState) {
      applyStateToUI(savedState);
      currentState = savedState;
      updateState(true);
      showToast(`Preset "${name}" loaded successfully!`, 'success');
    } else {
      showToast('Error loading preset', 'error');
    }
  });

  deletePresetBtn.addEventListener('click', () => {
    const name = customPresetDropdown ? customPresetDropdown.getValue() : savedPresetsSelect.value;
    if (!name) {
      showToast('Please select a preset to delete', 'error');
      return;
    }

    if (confirm(`Are you sure you want to delete preset "${name}"?`)) {
      if (deletePreset(name)) {
        populateSavedPresets();
        if (customPresetDropdown && customPresetDropdown.setValue) {
          customPresetDropdown.setValue('');
        } else if (savedPresetsSelect) {
          savedPresetsSelect.value = '';
        }
        // Show toast after DOM updates to ensure it's visible
        setTimeout(() => {
          showToast(`Preset "${name}" deleted successfully!`, 'success');
        }, 100);
      } else {
        showToast('Error deleting preset', 'error');
      }
    }
  });

  // Random button
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      // Random preset
      const presetKeys = Object.keys(presets);
      const randomPreset = presetKeys[Math.floor(Math.random() * presetKeys.length)];
      setPreset(randomPreset);
      document.querySelector(`[data-preset="${randomPreset}"]`)?.click();

      // Random colors
      const colorKeys = Object.keys(colorPalette);
      const randomTitleColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
      const randomSubtitleColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
      const randomSloganColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];

      setSelectedColor('titleColorPicker', randomTitleColor);
      setSelectedColor('subtitleColorPicker', randomSubtitleColor);
      setSelectedColor('sloganColorPicker', randomSloganColor);

      // Random sizes
      if (titleSizeSlider && titleSizeValue) {
        titleSizeSlider.value = 50 + Math.random() * 50;
        titleSizeValue.value = titleSizeSlider.value;
      }
      if (subtitleSizeSlider && subtitleSizeValue) {
        subtitleSizeSlider.value = 20 + Math.random() * 20;
        subtitleSizeValue.value = subtitleSizeSlider.value;
      }
      if (logoSizeSlider && logoSizeValue) {
        logoSizeSlider.value = 80 + Math.random() * 120;
        logoSizeValue.value = logoSizeSlider.value;
      }

      // Random glow
      if (titleGlow) titleGlow.checked = Math.random() > 0.5;
      if (subtitleGlow) subtitleGlow.checked = Math.random() > 0.5;
      if (sloganGlow) sloganGlow.checked = Math.random() > 0.5;

      // Random logo position
      if (logoXSlider && logoXValue && logoYSlider && logoYValue) {
        logoXSlider.value = Math.random() * 1200;
        logoXValue.value = logoXSlider.value;
        logoYSlider.value = Math.random() * 675;
        logoYValue.value = logoYSlider.value;
      }

      updateState();
    });
  }

  // Export button
  if (exportBtn && exportQualitySelect) {
    exportBtn.addEventListener('click', () => {
      const canvasWrapper = document.getElementById('canvasWrapper');
      if (canvasWrapper) {
        const quality = parseInt(exportQualitySelect.value) || 2;
        exportImage(canvasWrapper, currentImageType, exportBtn, quality);
      }
    });
  }

  // Copy button (duplicate of copyClipboardBtn functionality)
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const canvasWrapper = document.getElementById('canvasWrapper');
      if (!canvasWrapper) return;

      if (!navigator.clipboard || !window.ClipboardItem) {
        showToast('Clipboard API not supported in this browser', 'error');
        return;
      }

      // Store button state (preserve HTML including unicode character)
      const originalButtonHTML = copyBtn.innerHTML;
      const originalDisabled = copyBtn.disabled;
      copyBtn.innerHTML = 'Copying...';
      copyBtn.disabled = true;

      // Get parent container to prevent layout shifts
      const canvasContainer = canvasWrapper.parentElement;
      const originalContainerStyles = canvasContainer
        ? {
            position: canvasContainer.style.position,
            overflow: canvasContainer.style.overflow,
            contain: canvasContainer.style.contain,
            width: canvasContainer.style.width,
            height: canvasContainer.style.height,
            aspectRatio: canvasContainer.style.aspectRatio,
            minHeight: canvasContainer.style.minHeight,
            maxHeight: canvasContainer.style.maxHeight,
          }
        : null;

      // Store original styles to restore later
      let originalStyles = {
        width: canvasWrapper.style.width,
        height: canvasWrapper.style.height,
        transform: canvasWrapper.style.transform,
        transformOrigin: canvasWrapper.style.transformOrigin,
        maxWidth: canvasWrapper.style.maxWidth,
        maxHeight: canvasWrapper.style.maxHeight,
        minWidth: canvasWrapper.style.minWidth,
        minHeight: canvasWrapper.style.minHeight,
        boxSizing: canvasWrapper.style.boxSizing,
        flexShrink: canvasWrapper.style.flexShrink,
        flexGrow: canvasWrapper.style.flexGrow,
        overflow: canvasWrapper.style.overflow,
        position: canvasWrapper.style.position,
        top: canvasWrapper.style.top,
        left: canvasWrapper.style.left,
      };

      try {
        // Import the convertMaskedLogoToImage function from export.js
        const exportModule = await import('./export.js');
        const convertMaskedLogoToImage = exportModule.convertMaskedLogoToImage;

        // CRITICAL: Get container dimensions BEFORE modifying anything to prevent CLS
        let containerWidth, containerHeight;
        if (canvasContainer) {
          const containerComputed = window.getComputedStyle(canvasContainer);
          containerWidth = containerComputed.width;
          containerHeight = containerComputed.height;
        }

        // Get computed styles BEFORE modifying canvas wrapper
        const computedStyle = window.getComputedStyle(canvasWrapper);
        const backgroundImage = computedStyle.backgroundImage;
        const originalBackgroundSize = computedStyle.backgroundSize;
        const originalBackgroundRepeat = computedStyle.backgroundRepeat;

        // Prevent layout shifts by containing the parent container and maintaining its size
        if (canvasContainer) {
          canvasContainer.style.setProperty('position', 'relative', 'important');
          canvasContainer.style.setProperty('overflow', 'hidden', 'important');
          canvasContainer.style.setProperty('contain', 'layout style paint', 'important');
          // Maintain exact dimensions to prevent CLS - use pre-computed values
          canvasContainer.style.setProperty('width', containerWidth, 'important');
          canvasContainer.style.setProperty('height', containerHeight, 'important');
          canvasContainer.style.setProperty('aspect-ratio', 'unset', 'important');
          canvasContainer.style.setProperty('min-height', containerHeight, 'important');
          canvasContainer.style.setProperty('max-height', containerHeight, 'important');
        }

        // CRITICAL: Remove all transforms and scaling for copy
        // Keep absolute positioning to prevent breaking out of container
        canvasWrapper.style.setProperty('width', `${currentImageType.width}px`, 'important');
        canvasWrapper.style.setProperty('height', `${currentImageType.height}px`, 'important');
        canvasWrapper.style.setProperty('transform', 'none', 'important');
        canvasWrapper.style.setProperty('transform-origin', 'top left', 'important');
        canvasWrapper.style.setProperty('max-width', 'none', 'important');
        canvasWrapper.style.setProperty('max-height', 'none', 'important');
        canvasWrapper.style.setProperty('min-width', `${currentImageType.width}px`, 'important');
        canvasWrapper.style.setProperty('min-height', `${currentImageType.height}px`, 'important');
        canvasWrapper.style.setProperty('box-sizing', 'content-box', 'important');
        canvasWrapper.style.setProperty('flex-shrink', '0', 'important');
        canvasWrapper.style.setProperty('flex-grow', '0', 'important');
        canvasWrapper.style.setProperty('overflow', 'visible', 'important');
        // Keep absolute positioning to stay within container
        canvasWrapper.style.setProperty('position', 'absolute', 'important');
        canvasWrapper.style.setProperty('top', '0', 'important');
        canvasWrapper.style.setProperty('left', '0', 'important');

        // Convert masked logos to images (same as export)
        const logoContainers = canvasWrapper.querySelectorAll('.logo-masked');
        const replacements = [];

        for (const container of logoContainers) {
          const convertedImg = await convertMaskedLogoToImage(container);
          if (convertedImg) {
            replacements.push({ original: container });
            const img = document.createElement('img');
            img.src = convertedImg.src;
            img.style.cssText = container.style.cssText;
            img.style.maskImage = 'none';
            img.style.webkitMaskImage = 'none';
            img.style.backgroundColor = 'transparent';
            container.parentNode.insertBefore(img, container);
            container.style.display = 'none';
            replacements[replacements.length - 1].replacement = img;
          }
        }

        /**
         * Convert background-size values to pixels, handling comma-separated multiple values
         * @param {string} bgSize - Background size string (e.g., "100% 100%, 20px 20px")
         * @param {number} width - Target width in pixels
         * @param {number} height - Target height in pixels
         * @returns {string} Converted background-size string with all percentages converted to pixels
         */
        function convertBackgroundSizeToPixels(bgSize, width, height) {
          if (!bgSize || bgSize === 'auto' || bgSize === 'cover' || bgSize === 'contain') {
            return bgSize;
          }

          // Split by comma to handle multiple background layers
          const layers = bgSize.split(',').map(l => l.trim());
          const convertedLayers = layers.map(layer => {
            // Check if layer contains percentages
            if (layer.includes('%')) {
              // Replace percentage values with pixel values
              return layer.replace(/(\d+(?:\.\d+)?)%/g, (match, percent) => {
                const value = parseFloat(percent);
                // Determine if this is width or height based on position
                // Simple heuristic: first % is usually width, second is height
                const isWidth = layer.indexOf(match) < layer.length / 2;
                return isWidth ? `${(value / 100) * width}px` : `${(value / 100) * height}px`;
              });
            }
            return layer;
          });

          return convertedLayers.join(', ');
        }

        // Handle background pattern sizing
        let backgroundSize = originalBackgroundSize;
        const hasPattern =
          backgroundImage &&
          backgroundImage !== 'none' &&
          (backgroundImage.includes('gradient') || backgroundImage.includes('data:image'));

        // Handle different background-size formats for patterns
        if (
          hasPattern &&
          backgroundSize &&
          backgroundSize !== 'auto' &&
          backgroundSize !== 'cover' &&
          backgroundSize !== 'contain'
        ) {
          // Check for percentage-based sizes (including comma-separated)
          if (backgroundSize.includes('%')) {
            // Convert all percentages to pixels for the target canvas size
            backgroundSize = convertBackgroundSizeToPixels(
              backgroundSize,
              currentImageType.width,
              currentImageType.height
            );
          }
          // Check for pixel-based sizes
          else {
            // Check if we have comma-separated values (multiple layers)
            if (backgroundSize.includes(',')) {
              // For comma-separated pixel values, check each layer
              const layers = backgroundSize.split(',').map(l => l.trim());
              const maxSize = Math.max(currentImageType.width, currentImageType.height);
              const hasSmallPattern = layers.some(layer => {
                const sizeMatch = layer.match(/(\d+(?:\.\d+)?)px/g);
                if (sizeMatch) {
                  const patternSize = Math.max(...sizeMatch.map(s => parseFloat(s)));
                  return patternSize < maxSize * 0.1;
                }
                return false;
              });

              if (
                hasSmallPattern &&
                (!originalBackgroundRepeat || originalBackgroundRepeat === 'no-repeat')
              ) {
                canvasWrapper.style.setProperty('background-repeat', 'repeat', 'important');
              }
              // Keep original sizes for repeating patterns
            } else {
              // Single value - check if it's a small repeating pattern
              const sizeMatch = backgroundSize.match(/(\d+(?:\.\d+)?)px/g);
              if (sizeMatch) {
                const maxSize = Math.max(currentImageType.width, currentImageType.height);
                const patternSize = Math.max(...sizeMatch.map(s => parseFloat(s)));
                if (patternSize < maxSize * 0.1) {
                  // Small repeating pattern - ensure it repeats
                  if (!originalBackgroundRepeat || originalBackgroundRepeat === 'no-repeat') {
                    canvasWrapper.style.setProperty('background-repeat', 'repeat', 'important');
                  }
                  // Keep original size for repeating patterns
                } else {
                  // Large pattern - ensure it covers the canvas
                  backgroundSize = `${currentImageType.width}px ${currentImageType.height}px`;
                }
              } else {
                // Unknown format - default to full canvas size
                backgroundSize = `${currentImageType.width}px ${currentImageType.height}px`;
              }
            }
          }
        } else if (hasPattern && (!backgroundSize || backgroundSize === 'auto')) {
          // No size specified - default to full canvas
          backgroundSize = `${currentImageType.width}px ${currentImageType.height}px`;
        }

        const backgroundProps = {
          backgroundImage: backgroundImage,
          backgroundSize: backgroundSize,
          backgroundPosition: computedStyle.backgroundPosition || '0 0',
          backgroundRepeat: originalBackgroundRepeat || 'repeat',
          backgroundColor: computedStyle.backgroundColor,
          background: computedStyle.background,
        };

        // Pre-process canvas-based backgrounds
        if (
          backgroundProps.backgroundImage &&
          backgroundProps.backgroundImage !== 'none' &&
          backgroundProps.backgroundImage.includes('data:image')
        ) {
          const dataUrlMatches = backgroundProps.backgroundImage.match(
            /url\(['"]?(data:image\/[^'"]+)['"]?\)/g
          );
          if (dataUrlMatches && dataUrlMatches.length > 0) {
            const imagePromises = dataUrlMatches.map(match => {
              const dataUrl = match.replace(/url\(['"]?/, '').replace(/['"]?\)/, '');
              return new Promise(resolve => {
                const img = new Image();
                img.onload = () => resolve(dataUrl);
                img.onerror = () => resolve(dataUrl);
                img.src = dataUrl;
              });
            });
            await Promise.all(imagePromises);
            canvasWrapper.style.setProperty(
              'background-image',
              backgroundProps.backgroundImage,
              'important'
            );
          }
        }

        // Pre-load external background images
        const bgImageUrls = [];
        if (backgroundProps.backgroundImage && backgroundProps.backgroundImage !== 'none') {
          const urlMatches = backgroundProps.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/g);
          if (urlMatches) {
            urlMatches.forEach(match => {
              const url = match.replace(/url\(['"]?/, '').replace(/['"]?\)/, '');
              if (url && !url.startsWith('data:')) {
                bgImageUrls.push(url);
              }
            });
          }
        }

        if (bgImageUrls.length > 0) {
          await Promise.all(
            bgImageUrls.map(url => {
              return new Promise(resolve => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = resolve;
                img.onerror = resolve;
                img.src = url;
              });
            })
          );
        }

        // Wait for DOM to settle
        await new Promise(resolve => setTimeout(resolve, 150));

        const html2canvas = await loadHtml2Canvas();

        // Use same options as export for consistency
        const canvas = await html2canvas(canvasWrapper, {
          width: currentImageType.width,
          height: currentImageType.height,
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          logging: false,
          allowTaint: true,
          removeContainer: false,
          windowWidth: currentImageType.width,
          windowHeight: currentImageType.height,
          x: 0,
          y: 0,
          // Ensure background images are captured
          onclone: (clonedDoc, clonedWindow) => {
            const clonedWrapper = clonedDoc.getElementById('canvasWrapper');
            if (clonedWrapper && backgroundProps) {
              // CRITICAL: Set dimensions FIRST before any background properties
              // html2canvas calculates percentage-based background-sizes relative to element dimensions
              // Setting dimensions first ensures percentages calculate correctly
              clonedWrapper.style.setProperty('width', `${currentImageType.width}px`, 'important');
              clonedWrapper.style.setProperty(
                'height',
                `${currentImageType.height}px`,
                'important'
              );
              clonedWrapper.style.setProperty('position', 'relative', 'important');
              clonedWrapper.style.setProperty('transform', 'none', 'important');
              clonedWrapper.style.setProperty('box-sizing', 'content-box', 'important');
              clonedWrapper.style.setProperty('margin', '0', 'important');
              clonedWrapper.style.setProperty('padding', '0', 'important');

              clonedWrapper.style.setProperty('background-attachment', 'scroll', 'important');
              clonedWrapper.style.setProperty('background-clip', 'border-box', 'important');
              clonedWrapper.style.setProperty('background-origin', 'padding-box', 'important');

              if (backgroundProps.backgroundImage && backgroundProps.backgroundImage !== 'none') {
                clonedWrapper.style.setProperty(
                  'background-image',
                  backgroundProps.backgroundImage,
                  'important'
                );
              }

              // Convert background-size to pixels if it contains percentages (handles comma-separated values)
              let finalBackgroundSize = backgroundProps.backgroundSize;
              if (
                finalBackgroundSize &&
                finalBackgroundSize !== 'auto' &&
                finalBackgroundSize !== 'cover' &&
                finalBackgroundSize !== 'contain'
              ) {
                if (finalBackgroundSize.includes('%')) {
                  // Helper function to convert percentages to pixels
                  const convertSize = (bgSize, w, h) => {
                    if (!bgSize || bgSize === 'auto' || bgSize === 'cover' || bgSize === 'contain')
                      return bgSize;
                    const layers = bgSize.split(',').map(l => l.trim());
                    return layers
                      .map(layer => {
                        if (layer.includes('%')) {
                          return layer.replace(/(\d+(?:\.\d+)?)%/g, (match, percent) => {
                            const value = parseFloat(percent);
                            const isWidth = layer.indexOf(match) < layer.length / 2;
                            return isWidth ? `${(value / 100) * w}px` : `${(value / 100) * h}px`;
                          });
                        }
                        return layer;
                      })
                      .join(', ');
                  };
                  finalBackgroundSize = convertSize(
                    finalBackgroundSize,
                    currentImageType.width,
                    currentImageType.height
                  );
                }
                clonedWrapper.style.setProperty(
                  'background-size',
                  finalBackgroundSize,
                  'important'
                );
              } else {
                clonedWrapper.style.setProperty(
                  'background-size',
                  `${currentImageType.width}px ${currentImageType.height}px`,
                  'important'
                );
              }

              if (backgroundProps.backgroundPosition) {
                clonedWrapper.style.setProperty(
                  'background-position',
                  backgroundProps.backgroundPosition,
                  'important'
                );
              } else {
                clonedWrapper.style.setProperty('background-position', '0 0', 'important');
              }
              if (backgroundProps.backgroundRepeat) {
                clonedWrapper.style.setProperty(
                  'background-repeat',
                  backgroundProps.backgroundRepeat,
                  'important'
                );
              } else {
                clonedWrapper.style.setProperty('background-repeat', 'repeat', 'important');
              }
              if (
                backgroundProps.backgroundColor &&
                backgroundProps.backgroundColor !== 'rgba(0, 0, 0, 0)'
              ) {
                clonedWrapper.style.setProperty(
                  'background-color',
                  backgroundProps.backgroundColor,
                  'important'
                );
              }
            }
          },
        });

        // Create final canvas with exact dimensions to avoid positioning issues
        const scale = 2; // Match the scale used in html2canvas
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = currentImageType.width * scale;
        finalCanvas.height = currentImageType.height * scale;
        const ctx = finalCanvas.getContext('2d', {
          alpha: true,
          desynchronized: false,
          willReadFrequently: false,
        });

        // Use high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw the captured canvas to the final canvas at exact size
        ctx.drawImage(
          canvas,
          0,
          0,
          currentImageType.width * scale,
          currentImageType.height * scale
        );

        // Apply high-resolution export with dithering to eliminate banding
        const { exportHighResCanvas } = await import('./utils/export-high-res.js');
        const blob = await exportHighResCanvas({
          sourceCanvas: finalCanvas,
          width: currentImageType.width * scale,
          height: currentImageType.height * scale,
          scale: 1.0, // No additional scaling - canvas is already at target resolution
          dither: 'random', // Use random dithering for smooth gradients
          noiseAmount: 4, // Subtle noise to break up banding without being visible
          format: 'image/png',
          quality: 1.0,
        });

        // Copy to clipboard
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          showToast('Image copied to clipboard!', 'success');
        } catch (err) {
          console.error('Failed to copy to clipboard:', err);
          showToast('Failed to copy to clipboard', 'error');
        } finally {
          // Restore original container styles
          if (canvasContainer && originalContainerStyles) {
            Object.keys(originalContainerStyles).forEach(key => {
              const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
              if (originalContainerStyles[key]) {
                canvasContainer.style.setProperty(
                  cssKey,
                  originalContainerStyles[key],
                  'important'
                );
              } else {
                canvasContainer.style.removeProperty(cssKey);
              }
            });
          }

          // Restore original styles
          Object.keys(originalStyles).forEach(key => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            if (originalStyles[key]) {
              canvasWrapper.style.setProperty(cssKey, originalStyles[key], 'important');
            } else {
              canvasWrapper.style.removeProperty(cssKey);
            }
          });

          // Restore masked logo containers
          replacements.forEach(({ original, replacement }) => {
            if (replacement && replacement.parentNode) {
              replacement.parentNode.removeChild(replacement);
            }
            if (original) {
              original.style.display = '';
            }
          });

          // Restore button state
          copyBtn.innerHTML = originalButtonHTML;
          copyBtn.disabled = originalDisabled;
        }
      } catch (err) {
        console.error('Error copying to clipboard:', err);
        showToast('Failed to copy to clipboard', 'error');

        // Restore original container styles on error
        if (canvasContainer && originalContainerStyles) {
          Object.keys(originalContainerStyles).forEach(key => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            if (originalContainerStyles[key]) {
              canvasContainer.style.setProperty(cssKey, originalContainerStyles[key], 'important');
            } else {
              canvasContainer.style.removeProperty(cssKey);
            }
          });
        }

        // Restore original styles on error
        if (originalStyles) {
          Object.keys(originalStyles).forEach(key => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            if (originalStyles[key]) {
              canvasWrapper.style.setProperty(cssKey, originalStyles[key], 'important');
            } else {
              canvasWrapper.style.removeProperty(cssKey);
            }
          });
        }

        // Restore button state
        copyBtn.innerHTML = originalButtonHTML;
        copyBtn.disabled = originalDisabled;
      }
    });
  }

  // Global Randomize button
  if (randomizeBtn) {
    randomizeBtn.addEventListener('click', () => {
      randomizeAllSettings();
    });
  }

  // Hard Refresh Button (independent of reset button)
  if (hardRefreshBtn) {
    console.log('Hard refresh button found, attaching event listener');

    hardRefreshBtn.addEventListener('click', async e => {
      e.preventDefault();
      e.stopPropagation();

      // Immediate feedback - this should appear instantly
      console.log('=== HARD REFRESH BUTTON CLICKED ===');
      console.log('Starting hard refresh process...');

      // Visual feedback
      hardRefreshBtn.style.opacity = '0.5';
      hardRefreshBtn.disabled = true;

      // Show feedback to user
      try {
        showToast('Clearing cache and reloading...', 'info', 1000);
      } catch (err) {
        console.warn('Could not show toast:', err);
      }

      // Hard refresh: clear cache, storage, and force fresh asset fetches
      // Similar to Ctrl+F5 or Ctrl+Shift+R, but more aggressive
      // For GitHub Pages, we need a reliable method that bypasses all caches
      try {
        // Prepare reload URL first - this will always execute
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const url = new URL(window.location.href);
        url.searchParams.delete('_hr');
        url.searchParams.delete('_r');
        url.searchParams.set('_hr', timestamp);
        url.searchParams.set('_r', randomStr);
        const newUrl = url.toString();

        console.log('Prepared reload URL:', newUrl);

        // Clear caches with timeout to prevent hanging
        const clearOps = [];

        // 1. Clear HTTP Cache via Cache API (if available) - with timeout
        if ('caches' in window) {
          clearOps.push(
            Promise.race([
              caches.keys()
                .then(cacheNames => {
                  console.log('Found caches:', cacheNames);
                  return Promise.all(
              cacheNames.map(cacheName => {
                console.log('Deleting cache:', cacheName);
                return caches.delete(cacheName);
              })
            );
                })
                .then(() => console.log('All caches cleared via Cache API')),
              new Promise(resolve => setTimeout(resolve, 500)) // 500ms timeout
            ]).catch(cacheError => console.warn('Error clearing Cache API:', cacheError))
          );
        }

        // 2. Unregister all service workers (if any) - with timeout
        if ('serviceWorker' in navigator) {
          clearOps.push(
            Promise.race([
              navigator.serviceWorker.getRegistrations()
                .then(registrations => {
                  return Promise.all(
                    registrations.map(registration => {
                      console.log('Unregistering service worker:', registration.scope);
                      return registration.unregister();
                    })
                  );
                })
                .then(() => console.log('All service workers unregistered')),
              new Promise(resolve => setTimeout(resolve, 500)) // 500ms timeout
            ]).catch(swError => console.warn('Error unregistering service workers:', swError))
          );
        }

        // 3. Clear IndexedDB (if used) - with timeout
        if ('indexedDB' in window) {
          clearOps.push(
            Promise.race([
              indexedDB.databases()
                .then(databases => {
                  return Promise.all(
              databases.map(db => {
                      return new Promise((resolve) => {
                  const deleteReq = indexedDB.deleteDatabase(db.name);
                  deleteReq.onsuccess = () => {
                    console.log('Deleted IndexedDB:', db.name);
                    resolve();
                  };
                        deleteReq.onerror = () => {
                          console.warn('Error deleting IndexedDB:', db.name);
                          resolve(); // Continue anyway
                        };
                  deleteReq.onblocked = () => {
                    console.warn('IndexedDB delete blocked for:', db.name);
                    resolve(); // Continue anyway
                  };
                });
              })
            );
                }),
              new Promise(resolve => setTimeout(resolve, 500)) // 500ms timeout
            ]).catch(dbError => console.warn('Could not clear IndexedDB:', dbError))
          );
        }

        // 4. Clear localStorage and sessionStorage (synchronous, no timeout needed)
        try {
          localStorage.clear();
          sessionStorage.clear();
          console.log('Cleared localStorage and sessionStorage');
        } catch (storageError) {
          console.warn('Error clearing storage:', storageError);
        }

        // Wait for cache clearing operations with timeout (max 1.5 seconds total)
        try {
          await Promise.race([
            Promise.allSettled(clearOps),
            new Promise(resolve => setTimeout(resolve, 1500))
          ]);
          console.log('Cache clearing operations completed');
        } catch (error) {
          console.warn('Some cache clearing operations may have failed:', error);
        }

        // Small delay to ensure UI updates
        await new Promise(resolve => setTimeout(resolve, 50));

        console.log('All caches cleared, performing hard reload...');
        console.log('Navigating to:', newUrl);

        // ALWAYS execute reload - this is the critical part
        // Use replace to avoid adding to history, and force fresh fetch
        window.location.replace(newUrl);
      } catch (error) {
        console.error('Error during hard refresh:', error);

        // Fallback: Clear storage and use cache-busted URL
        try {
          localStorage.clear();
          sessionStorage.clear();

          // Use cache-busted URL as fallback
          const url = new URL(window.location.href);
          url.searchParams.set('_hr', Date.now());
          url.searchParams.set('_r', Math.random().toString(36).substring(2, 15));
          window.location.replace(url.toString());
        } catch (fallbackError) {
          console.error('Fallback hard refresh also failed:', fallbackError);
          // Last resort: simple reload with cache-busting
          const url = new URL(window.location.href);
          url.searchParams.set('_hr', Date.now());
          window.location.href = url.toString();
        }
      }
    });

    // Verify event listener was attached
    console.log('Hard refresh button event listener attached successfully');
  } else {
    console.error(
      'Hard refresh button not found in DOM - element with id "hardRefreshBtn" is missing'
    );
  }

  // Global Reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetToDefaults();
    });
  }

  // Logo upload
  if (logoUploadBtn && logoUploadInput) {
    logoUploadBtn.addEventListener('click', () => {
      // Show toast notification with requirements before opening file dialog
      const requirements = `
        <p><strong>Logo Upload Requirements:</strong></p>
        <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
          <li><strong>Formats:</strong> SVG, PNG, or JPEG</li>
          <li><strong>Max Size:</strong> 5MB</li>
          <li><strong>Recommended:</strong> White or black logo for best colorization results</li>
          <li><strong>Note:</strong> SVG logos work best with the color filter system</li>
        </ul>
      `;
      showToast(requirements, 'info', 5000);
      // Small delay to ensure toast is visible before dialog opens
      setTimeout(() => {
        logoUploadInput.click();
      }, 100);
    });

    logoUploadInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        handleLogoUpload(file);
      }
    });
  }
}

/**
 * Initialize color pickers
 */
function initColorPickers() {
  createColorPicker('titleColorPicker', 'cyan', () => updateState());
  createColorPicker('subtitleColorPicker', 'text-secondary', () => updateState());
  createColorPicker('sloganColorPicker', 'magenta', () => updateState());
  createColorPicker('dividerColorPicker', 'cyan', () => updateState());
  createColorPicker('titleDividerColorPicker', 'cyan', () => updateState());
  createColorPicker('subtitleDividerColorPicker', 'cyan', () => updateState());
  createColorPicker('sloganDividerColorPicker', 'cyan', () => updateState());
  createColorPicker('patternColorPicker', 'cyan', () => updateState());
}

/**
 * Load fonts
 */
function loadFonts() {
  const link = document.createElement('link');
  link.href =
    'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

/**
 * Apply layer visibility based on checkbox states
 * Exported to window for access from preview.js
 */
function applyLayerVisibility() {
  const canvasWrapper = document.getElementById('canvasWrapper');
  if (!canvasWrapper) return;

  const layerCheckboxes = {
    logo: document.getElementById('layerVisibilityLogo'),
    title: document.getElementById('layerVisibilityTitle'),
    subtitle: document.getElementById('layerVisibilitySubtitle'),
    slogan: document.getElementById('layerVisibilitySlogan'),
    pattern: document.getElementById('layerVisibilityPattern'),
  };

  // Toggle logo visibility
  if (layerCheckboxes.logo) {
    const logoElements = canvasWrapper.querySelectorAll('[data-layer="logo"]');
    logoElements.forEach(el => {
      el.style.display = layerCheckboxes.logo.checked ? '' : 'none';
    });
  }

  // Toggle title visibility
  if (layerCheckboxes.title) {
    const titleElements = canvasWrapper.querySelectorAll('[data-layer="title"]');
    titleElements.forEach(el => {
      el.style.display = layerCheckboxes.title.checked ? '' : 'none';
    });
  }

  // Toggle subtitle visibility
  if (layerCheckboxes.subtitle) {
    const subtitleElements = canvasWrapper.querySelectorAll('[data-layer="subtitle"]');
    subtitleElements.forEach(el => {
      el.style.display = layerCheckboxes.subtitle.checked ? '' : 'none';
    });
  }

  // Toggle slogan visibility
  if (layerCheckboxes.slogan) {
    const sloganElements = canvasWrapper.querySelectorAll('[data-layer="slogan"]');
    sloganElements.forEach(el => {
      el.style.display = layerCheckboxes.slogan.checked ? '' : 'none';
    });
  }

  // Toggle pattern visibility (background pattern)
  if (layerCheckboxes.pattern) {
    if (layerCheckboxes.pattern.checked) {
      // Restore pattern by re-applying state (if pattern was previously set)
      if (canvasWrapper.dataset.originalBgStored === 'true') {
        canvasWrapper.style.background = canvasWrapper.dataset.originalBg || '';
        canvasWrapper.style.backgroundImage = canvasWrapper.dataset.originalBgImage || '';
        // Reset stored flag so it can be stored again if toggled off
        canvasWrapper.dataset.originalBgStored = 'false';
        // Re-trigger update to restore full pattern settings
        updateState(true); // Skip history to avoid duplicate entries
      }
    } else {
      // Hide pattern by storing and removing background styles
      if (canvasWrapper.dataset.originalBgStored !== 'true') {
        // Store original background only once
        canvasWrapper.dataset.originalBg = canvasWrapper.style.background || '';
        canvasWrapper.dataset.originalBgImage = canvasWrapper.style.backgroundImage || '';
        canvasWrapper.dataset.originalBgStored = 'true';
      }
      // Clear pattern - use default dark background
      canvasWrapper.style.backgroundImage = 'none';
      canvasWrapper.style.background = '#0a0a0a';
    }
  }
}

/**
 * Initialize generator
 */
/**
 * Initialize collapsible sections
 */
function initCollapsibleSections() {
  const sections = document.querySelectorAll('.collapsible-section');

  sections.forEach(section => {
    const label = section.querySelector('.collapsible-label');
    const icon = section.querySelector('.collapse-icon');
    if (!label || !icon) return;

    // Load saved state from localStorage
    const sectionId = section.dataset.section;
    const savedState = localStorage.getItem(`collapsible-section-${sectionId}`);
    if (savedState === 'collapsed') {
      section.classList.add('collapsed');
      icon.textContent = '▹';
    } else {
      icon.textContent = '▾';
    }

    label.addEventListener('click', () => {
      const isCollapsed = section.classList.contains('collapsed');
      section.classList.toggle('collapsed');

      // Update icon
      if (section.classList.contains('collapsed')) {
        icon.textContent = '▹';
      } else {
        icon.textContent = '▾';
      }

      // Save state to localStorage
      if (section.classList.contains('collapsed')) {
        localStorage.setItem(`collapsible-section-${sectionId}`, 'collapsed');
      } else {
        localStorage.removeItem(`collapsible-section-${sectionId}`);
      }
    });
  });
}

function init() {
  loadFonts();
  initDOMElements();
  initColorPickers();
  populateTemplates();
  populateBackgroundPatterns();
  populateSavedPresets();
  setupEventListeners();
  initCollapsibleSections();

  // Initialize custom pattern dropdown after patterns are populated and event listeners are set up
  if (backgroundPatternSelect) {
    initCustomPatternDropdown();
  }

  // Initialize custom template dropdown after templates are populated
  if (templateSelect) {
    initCustomTemplateDropdown();
  }

  // Initialize custom export quality dropdown
  initCustomExportQualityDropdown();

  initTabs();

  // Initialize pattern settings tooltips
  initPatternSettingsTooltips();

  // Initialize button tooltips for preview buttons
  initButtonTooltips();

  // Initialize ruler/guides system
  initRulerGuides();

  // Initialize composition overlays system
  initCompositionOverlays();

  // Initialize custom preset dropdown
  if (savedPresetsSelect) {
    customPresetDropdown = createCustomPresetDropdown(savedPresetsSelect, value => {
      // Callback when preset is selected - the native select change event will handle it
    });
  }

  setImageType(currentImageType);
  initHistory(currentState);
  applyStateToUI(currentState); // Apply initial state to UI first

  // Ensure logo color is initialized after custom dropdown is created
  setTimeout(() => {
    const logoColorSelect = document.getElementById('logoColorSelect');
    if (logoColorSelect) {
      // Ensure select has options
      if (logoColorSelect.options.length === 0) {
        // Populate options if empty
        Object.keys(colorPalette).forEach(key => {
          if (key.startsWith('text-')) return;
          const option = document.createElement('option');
          option.value = key;
          option.textContent = key;
          logoColorSelect.appendChild(option);
        });
      }
      // Set default value if empty
      if (!logoColorSelect.value || logoColorSelect.value === '') {
        logoColorSelect.value = 'cyan';
        if (logoColorSelect.dispatchEvent) {
          logoColorSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      // Update state to ensure logo color is applied
      currentState.logoColor = logoColorSelect.value;
      updateState();
    }
  }, 200);

  // Update pattern setting availability on init
  if (currentState.backgroundPattern) {
    updatePatternSettingAvailability(currentState.backgroundPattern);
  }

  updateState(true); // Initial state, skip history
  updateUndoRedoButtons();

  // Export applyLayerVisibility to window for access from preview.js
  window.applyLayerVisibility = applyLayerVisibility;

  // Fix inline-control alignment - match line-height of labels to their siblings
  function fixInlineControlAlignment() {
    const inlineControls = document.querySelectorAll('.inline-control');
    inlineControls.forEach(control => {
      const label = control.querySelector('label');
      if (!label) return;

      // Find the sibling element (buttons or select)
      const sibling = Array.from(control.children).find(c => c !== label);
      if (sibling && sibling.offsetHeight > 0) {
        label.style.lineHeight = sibling.offsetHeight + 'px';
      }
    });
  }

  // Fix alignment after a short delay to ensure elements are rendered
  setTimeout(fixInlineControlAlignment, 100);
  window.addEventListener('resize', fixInlineControlAlignment);

  // Set up ResizeObserver for canvas container
  if (resizeObserver) {
    const previewColumn = document.querySelector('.preview-column');
    if (previewColumn) {
      resizeObserver.observe(previewColumn);
    }
    const canvasContainer = document.querySelector('.canvas-container');
    if (canvasContainer) {
      resizeObserver.observe(canvasContainer);
    }
  }
}

// Scale canvas on window resize and after layout changes
let resizeTimeout;
function handleResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const canvasWrapper = document.getElementById('canvasWrapper');
    if (canvasWrapper) {
      // Recalculate scale
      scaleCanvasForPreview(canvasWrapper);
    }
  }, 100);
}

window.addEventListener('resize', handleResize);

// Also scale after any layout changes
let resizeObserver;
if (typeof ResizeObserver !== 'undefined') {
  resizeObserver = new ResizeObserver(() => {
    handleResize();
    syncColumnHeights(); // Also sync column heights when preview column resizes
  });
}

/**
 * Sync left column height to match right column height
 */
function syncColumnHeights() {
  const controlsColumn = document.querySelector('.controls-column');
  const previewColumn = document.querySelector('.preview-column');

  if (controlsColumn && previewColumn) {
    // Get the right column's actual height
    const previewHeight = previewColumn.offsetHeight;
    // Set left column to match
    controlsColumn.style.height = `${previewHeight}px`;
  }
}

// Use ResizeObserver to watch for changes in the preview column
let columnHeightObserver = null;
if (typeof ResizeObserver !== 'undefined') {
  columnHeightObserver = new ResizeObserver(() => {
    syncColumnHeights();
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init();
    // Observe preview column for height changes
    const previewColumn = document.querySelector('.preview-column');
    if (previewColumn && columnHeightObserver) {
      columnHeightObserver.observe(previewColumn);
    }
    // Sync heights after initialization
    setTimeout(syncColumnHeights, 200);
  });
} else {
  init();
  // Observe preview column for height changes
  const previewColumn = document.querySelector('.preview-column');
  if (previewColumn && columnHeightObserver) {
    columnHeightObserver.observe(previewColumn);
  }
  // Sync heights after initialization
  setTimeout(syncColumnHeights, 200);
}

/**
 * Update visual indicators for pattern settings based on pattern type
 * Disables/greys out settings that don't apply to the current pattern
 * @param {string} patternKey - Pattern key or empty string
 */
function updatePatternSettingAvailability(patternKey) {
  if (!patternKey || !patternDefaults[patternKey]) {
    // Enable all settings when no pattern is selected
    const allSettings = [
      'patternOpacity',
      'patternSize',
      'patternRotation',
      'patternBlendMode',
      'patternOffsetX',
      'patternOffsetY',
      'patternSpacing',
      'patternDensity',
      'patternBlur',
      'patternScale',
      'patternRepeat',
      'patternIntensity',
    ];

    allSettings.forEach(settingId => {
      const container = document.querySelector(`[id^="${settingId}"]`)?.closest('.control-group');
      if (container) {
        container.classList.remove('pattern-setting-disabled');
        const inputs = container.querySelectorAll('input, select');
        inputs.forEach(input => {
          input.disabled = false;
          input.style.opacity = '1';
        });
        const label = container.querySelector('label');
        if (label) {
          label.style.opacity = '1';
        }
      }
    });
    return;
  }

  const defaults = patternDefaults[patternKey];
  const applicableSettings = defaults.applicableSettings || [];

  // Map setting IDs to their applicable keys
  const settingMap = {
    patternOpacity: 'opacity',
    patternSize: 'size',
    patternRotation: 'rotation',
    patternBlendMode: 'blendMode',
    patternOffsetX: 'offsetX',
    patternOffsetY: 'offsetY',
    patternSpacing: 'spacing',
    patternDensity: 'density',
    patternBlur: 'blur',
    patternScale: 'scale',
    patternRepeat: 'repeat',
    patternIntensity: 'intensity',
  };

  // Always enable color (it's always applicable)
  const colorContainer = document.querySelector('#patternColorPicker')?.closest('.control-group');
  if (colorContainer) {
    colorContainer.classList.remove('pattern-setting-disabled');
  }

  // Check each setting
  Object.entries(settingMap).forEach(([settingId, settingKey]) => {
    const isApplicable = applicableSettings.includes(settingKey) || settingKey === 'color';
    const container = document.querySelector(`[id^="${settingId}"]`)?.closest('.control-group');

    if (container) {
      if (isApplicable) {
        container.classList.remove('pattern-setting-disabled');
        const inputs = container.querySelectorAll('input, select');
        inputs.forEach(input => {
          input.disabled = false;
          input.style.opacity = '1';
        });
        const label = container.querySelector('label');
        if (label) {
          label.style.opacity = '1';
        }
      } else {
        container.classList.add('pattern-setting-disabled');
        const inputs = container.querySelectorAll('input, select');
        inputs.forEach(input => {
          input.disabled = true;
          input.style.opacity = '0.4';
        });
        const label = container.querySelector('label');
        if (label) {
          label.style.opacity = '0.4';
        }
      }
    }
  });
}

/**
 * Randomize all settings
 */
function randomizeAllSettings() {
  // Randomize text
  if (titleInput) {
    const titles = [
      'Logi-Ink',
      'Digital Innovation',
      'Creative Solutions',
      'Tech Excellence',
      'Future Forward',
    ];
    titleInput.value = titles[Math.floor(Math.random() * titles.length)];
  }
  if (subtitleInput) {
    const subtitles = [
      'Digital Innovation & Creative Solutions',
      'Transforming Ideas Into Reality',
      'Building Tomorrow Today',
      'Innovation Meets Design',
    ];
    subtitleInput.value = subtitles[Math.floor(Math.random() * subtitles.length)];
  }
  if (sloganInput) {
    const slogans = [
      'Transforming Ideas Into Reality',
      'Where Innovation Meets Excellence',
      'Building Digital Excellence',
      'Creative Solutions for Modern Challenges',
    ];
    sloganInput.value = slogans[Math.floor(Math.random() * slogans.length)];
  }

  // Randomize colors
  const colorKeys = Object.keys(colorPalette).filter(key => !key.startsWith('text-'));
  const randomTitleColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
  const randomSubtitleColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
  const randomSloganColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
  const randomLogoColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];

  setSelectedColor('titleColorPicker', randomTitleColor);
  setSelectedColor('subtitleColorPicker', randomSubtitleColor);
  setSelectedColor('sloganColorPicker', randomSloganColor);
  if (logoColorSelect) {
    logoColorSelect.value = randomLogoColor;
    logoColorSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Randomize sizes
  if (titleSizeSlider && titleSizeValue) {
    const titleSize = 50 + Math.random() * 50;
    titleSizeSlider.value = titleSize;
    titleSizeValue.value = titleSize;
  }
  if (subtitleSizeSlider && subtitleSizeValue) {
    const subtitleSize = 20 + Math.random() * 20;
    subtitleSizeSlider.value = subtitleSize;
    subtitleSizeValue.value = subtitleSize;
  }
  if (sloganSizeSlider && sloganSizeValue) {
    const sloganSize = 16 + Math.random() * 12;
    sloganSizeSlider.value = sloganSize;
    sloganSizeValue.value = sloganSize;
  }
  if (logoSizeSlider && logoSizeValue) {
    const logoSize = 80 + Math.random() * 120;
    logoSizeSlider.value = logoSize;
    logoSizeValue.value = logoSize;
  }

  // Randomize glow
  if (logoGlow) logoGlow.checked = Math.random() > 0.5;
  if (titleGlow) titleGlow.checked = Math.random() > 0.5;
  if (subtitleGlow) subtitleGlow.checked = Math.random() > 0.5;
  if (sloganGlow) sloganGlow.checked = Math.random() > 0.5;

  // Randomize logo position
  if (logoXSlider && logoXValue && logoYSlider && logoYValue) {
    logoXSlider.value = Math.random() * 1200;
    logoXValue.value = logoXSlider.value;
    logoYSlider.value = Math.random() * 675;
    logoYValue.value = logoYSlider.value;
  }

  // Randomize text alignment (absolute positions)
  if (titleXSlider && titleXValue) {
    const x = Math.random() * 1200;
    titleXSlider.value = x;
    titleXValue.value = x;
  }
  if (titleYSlider && titleYValue) {
    const y = Math.random() * 675;
    titleYSlider.value = y;
    titleYValue.value = y;
  }
  if (subtitleXSlider && subtitleXValue) {
    const x = Math.random() * 1200;
    subtitleXSlider.value = x;
    subtitleXValue.value = x;
  }
  if (subtitleYSlider && subtitleYValue) {
    const y = Math.random() * 675;
    subtitleYSlider.value = y;
    subtitleYValue.value = y;
  }
  if (sloganXSlider && sloganXValue) {
    const x = Math.random() * 1200;
    sloganXSlider.value = x;
    sloganXValue.value = x;
  }
  if (sloganYSlider && sloganYValue) {
    const y = Math.random() * 675;
    sloganYSlider.value = y;
    sloganYValue.value = y;
  }

  // Randomize dividers
  if (dividerAboveTitle) dividerAboveTitle.checked = Math.random() > 0.7;
  if (dividerBelowTitle) dividerBelowTitle.checked = Math.random() > 0.7;
  if (dividerAboveSubtitle) dividerAboveSubtitle.checked = Math.random() > 0.7;
  if (dividerBelowSubtitle) dividerBelowSubtitle.checked = Math.random() > 0.7;
  if (dividerAboveSlogan) dividerAboveSlogan.checked = Math.random() > 0.7;
  if (dividerBelowSlogan) dividerBelowSlogan.checked = Math.random() > 0.7;

  // Randomize divider colors
  const randomDividerColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
  setSelectedColor('titleDividerColorPicker', randomDividerColor);
  setSelectedColor('subtitleDividerColorPicker', randomDividerColor);
  setSelectedColor('sloganDividerColorPicker', randomDividerColor);

  // Randomize divider widths
  if (titleDividerWidthSlider && titleDividerWidthValue) {
    const width = 1 + Math.random() * 9;
    titleDividerWidthSlider.value = width;
    titleDividerWidthValue.value = width;
  }
  if (subtitleDividerWidthSlider && subtitleDividerWidthValue) {
    const width = 1 + Math.random() * 9;
    subtitleDividerWidthSlider.value = width;
    subtitleDividerWidthValue.value = width;
  }
  if (sloganDividerWidthSlider && sloganDividerWidthValue) {
    const width = 1 + Math.random() * 9;
    sloganDividerWidthSlider.value = width;
    sloganDividerWidthValue.value = width;
  }

  // Randomize divider glow
  if (titleDividerGlow) titleDividerGlow.checked = Math.random() > 0.5;
  if (subtitleDividerGlow) subtitleDividerGlow.checked = Math.random() > 0.5;
  if (sloganDividerGlow) sloganDividerGlow.checked = Math.random() > 0.5;

  // Randomize divider gaps
  if (titleDividerGapSlider && titleDividerGapValue) {
    const gap = 10 + Math.random() * 50;
    titleDividerGapSlider.value = gap;
    titleDividerGapValue.value = gap;
  }
  if (subtitleDividerGapSlider && subtitleDividerGapValue) {
    const gap = 10 + Math.random() * 50;
    subtitleDividerGapSlider.value = gap;
    subtitleDividerGapValue.value = gap;
  }
  if (sloganDividerGapSlider && sloganDividerGapValue) {
    const gap = 10 + Math.random() * 50;
    sloganDividerGapSlider.value = gap;
    sloganDividerGapValue.value = gap;
  }

  // Randomize divider positions (X/Y) - sometimes use auto (null), sometimes random position
  // Above Title
  if (dividerAboveTitleXSlider && dividerAboveTitleXValue && dividerAboveTitleYSlider && dividerAboveTitleYValue) {
    if (Math.random() > 0.3) {
      // 70% chance: use auto positioning (null)
      dividerAboveTitleXSlider.value = '';
      dividerAboveTitleXValue.value = '';
      dividerAboveTitleYSlider.value = '';
      dividerAboveTitleYValue.value = '';
    } else {
      // 30% chance: random position
      const x = Math.random() * 1200;
      const y = Math.random() * 675;
      dividerAboveTitleXSlider.value = x;
      dividerAboveTitleXValue.value = x;
      dividerAboveTitleYSlider.value = y;
      dividerAboveTitleYValue.value = y;
    }
  }
  // Below Title
  if (dividerBelowTitleXSlider && dividerBelowTitleXValue && dividerBelowTitleYSlider && dividerBelowTitleYValue) {
    if (Math.random() > 0.3) {
      dividerBelowTitleXSlider.value = '';
      dividerBelowTitleXValue.value = '';
      dividerBelowTitleYSlider.value = '';
      dividerBelowTitleYValue.value = '';
    } else {
      const x = Math.random() * 1200;
      const y = Math.random() * 675;
      dividerBelowTitleXSlider.value = x;
      dividerBelowTitleXValue.value = x;
      dividerBelowTitleYSlider.value = y;
      dividerBelowTitleYValue.value = y;
    }
  }
  // Above Subtitle
  if (dividerAboveSubtitleXSlider && dividerAboveSubtitleXValue && dividerAboveSubtitleYSlider && dividerAboveSubtitleYValue) {
    if (Math.random() > 0.3) {
      dividerAboveSubtitleXSlider.value = '';
      dividerAboveSubtitleXValue.value = '';
      dividerAboveSubtitleYSlider.value = '';
      dividerAboveSubtitleYValue.value = '';
    } else {
      const x = Math.random() * 1200;
      const y = Math.random() * 675;
      dividerAboveSubtitleXSlider.value = x;
      dividerAboveSubtitleXValue.value = x;
      dividerAboveSubtitleYSlider.value = y;
      dividerAboveSubtitleYValue.value = y;
    }
  }
  // Below Subtitle
  if (dividerBelowSubtitleXSlider && dividerBelowSubtitleXValue && dividerBelowSubtitleYSlider && dividerBelowSubtitleYValue) {
    if (Math.random() > 0.3) {
      dividerBelowSubtitleXSlider.value = '';
      dividerBelowSubtitleXValue.value = '';
      dividerBelowSubtitleYSlider.value = '';
      dividerBelowSubtitleYValue.value = '';
    } else {
      const x = Math.random() * 1200;
      const y = Math.random() * 675;
      dividerBelowSubtitleXSlider.value = x;
      dividerBelowSubtitleXValue.value = x;
      dividerBelowSubtitleYSlider.value = y;
      dividerBelowSubtitleYValue.value = y;
    }
  }
  // Above Slogan
  if (dividerAboveSloganXSlider && dividerAboveSloganXValue && dividerAboveSloganYSlider && dividerAboveSloganYValue) {
    if (Math.random() > 0.3) {
      dividerAboveSloganXSlider.value = '';
      dividerAboveSloganXValue.value = '';
      dividerAboveSloganYSlider.value = '';
      dividerAboveSloganYValue.value = '';
    } else {
      const x = Math.random() * 1200;
      const y = Math.random() * 675;
      dividerAboveSloganXSlider.value = x;
      dividerAboveSloganXValue.value = x;
      dividerAboveSloganYSlider.value = y;
      dividerAboveSloganYValue.value = y;
    }
  }
  // Below Slogan
  if (dividerBelowSloganXSlider && dividerBelowSloganXValue && dividerBelowSloganYSlider && dividerBelowSloganYValue) {
    if (Math.random() > 0.3) {
      dividerBelowSloganXSlider.value = '';
      dividerBelowSloganXValue.value = '';
      dividerBelowSloganYSlider.value = '';
      dividerBelowSloganYValue.value = '';
    } else {
      const x = Math.random() * 1200;
      const y = Math.random() * 675;
      dividerBelowSloganXSlider.value = x;
      dividerBelowSloganXValue.value = x;
      dividerBelowSloganYSlider.value = y;
      dividerBelowSloganYValue.value = y;
    }
  }

  // Randomize background pattern
  if (backgroundPatternSelect) {
    const patterns = Object.keys(backgroundPatterns);
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    backgroundPatternSelect.value = randomPattern;
    backgroundPatternSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  updateState();
}

/**
 * Reset all settings to defaults
 */
function resetToDefaults() {
  // Reset text
  if (titleInput) titleInput.value = 'Logi-Ink';
  if (subtitleInput) subtitleInput.value = 'Digital Innovation & Creative Solutions';
  if (sloganInput) sloganInput.value = 'Transforming Ideas Into Reality';

  // Reset colors
  setSelectedColor('titleColorPicker', 'cyan');
  setSelectedColor('subtitleColorPicker', 'text-secondary');
  setSelectedColor('sloganColorPicker', 'magenta');
  if (logoColorSelect) {
    logoColorSelect.value = 'cyan';
    logoColorSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Reset sizes
  if (titleSizeSlider && titleSizeValue) {
    titleSizeSlider.value = 72;
    titleSizeValue.value = 72;
  }
  if (subtitleSizeSlider && subtitleSizeValue) {
    subtitleSizeSlider.value = 28;
    subtitleSizeValue.value = 28;
  }
  if (sloganSizeSlider && sloganSizeValue) {
    sloganSizeSlider.value = 20;
    sloganSizeValue.value = 20;
  }
  if (logoSizeSlider && logoSizeValue) {
    logoSizeSlider.value = 120;
    logoSizeValue.value = 120;
  }

  // Reset glow
  if (logoGlow) logoGlow.checked = false;
  if (titleGlow) titleGlow.checked = false;
  if (subtitleGlow) subtitleGlow.checked = false;
  if (sloganGlow) sloganGlow.checked = false;

  // Reset logo position
  if (logoXSlider && logoXValue && logoYSlider && logoYValue) {
    logoXSlider.value = 40;
    logoXValue.value = 40;
    logoYSlider.value = 40;
    logoYValue.value = 40;
  }

  // Reset text alignment (to center positions)
  if (titleXSlider && titleXValue) {
    titleXSlider.value = 600;
    titleXValue.value = 600;
  }
  if (titleYSlider && titleYValue) {
    titleYSlider.value = 315;
    titleYValue.value = 315;
  }
  if (subtitleXSlider && subtitleXValue) {
    subtitleXSlider.value = 600;
    subtitleXValue.value = 600;
  }
  if (subtitleYSlider && subtitleYValue) {
    subtitleYSlider.value = 395;
    subtitleYValue.value = 395;
  }
  if (sloganXSlider && sloganXValue) {
    sloganXSlider.value = 600;
    sloganXValue.value = 600;
  }
  if (sloganYSlider && sloganYValue) {
    sloganYSlider.value = 455;
    sloganYValue.value = 455;
  }

  // Reset dividers
  if (dividerAboveTitle) dividerAboveTitle.checked = false;
  if (dividerBelowTitle) dividerBelowTitle.checked = false;
  if (dividerAboveSubtitle) dividerAboveSubtitle.checked = false;
  if (dividerBelowSubtitle) dividerBelowSubtitle.checked = false;
  if (dividerAboveSlogan) dividerAboveSlogan.checked = false;
  if (dividerBelowSlogan) dividerBelowSlogan.checked = false;

  // Reset divider colors
  setSelectedColor('titleDividerColorPicker', 'cyan');
  setSelectedColor('subtitleDividerColorPicker', 'cyan');
  setSelectedColor('sloganDividerColorPicker', 'cyan');

  // Reset divider widths
  if (titleDividerWidthSlider && titleDividerWidthValue) {
    titleDividerWidthSlider.value = 2;
    titleDividerWidthValue.value = 2;
  }
  if (subtitleDividerWidthSlider && subtitleDividerWidthValue) {
    subtitleDividerWidthSlider.value = 2;
    subtitleDividerWidthValue.value = 2;
  }
  if (sloganDividerWidthSlider && sloganDividerWidthValue) {
    sloganDividerWidthSlider.value = 2;
    sloganDividerWidthValue.value = 2;
  }

  // Reset background pattern
  if (backgroundPatternSelect) {
    backgroundPatternSelect.value = '';
    backgroundPatternSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Reset uploaded logo
  customLogoUrl = null;
  window.customLogoUrl = null;
  if (logoUploadInput) logoUploadInput.value = '';

  updateState();
}

/**
 * Handle logo upload
 */
function handleLogoUpload(file) {
  // Validate file type
  const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    showToast(
      '<strong>Invalid file type!</strong><br><br>Please upload:<br>• SVG (recommended)<br>• PNG<br>• JPEG<br><br>For best results, use a white or black logo.',
      'error',
      6000
    );
    return;
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    showToast(
      '<strong>File too large!</strong><br><br>Maximum file size: 5MB<br>Please compress your image and try again.',
      'error',
      5000
    );
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    customLogoUrl = e.target.result;
    // Make it accessible to preview.js
    window.customLogoUrl = customLogoUrl;
    updateState();
    showToast(
      '<strong>Logo uploaded successfully!</strong><br><br>Your custom logo is now being used. To revert, click "Reset" or upload a new logo.',
      'success',
      4000
    );
  };
  reader.onerror = () => {
    showToast(
      '<strong>Upload failed!</strong><br><br>Please try again or use a different file.',
      'error',
      4000
    );
  };
  reader.readAsDataURL(file);
}

// Also sync on window resize
window.addEventListener('resize', () => {
  setTimeout(syncColumnHeights, 100);
});

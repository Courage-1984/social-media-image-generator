/**
 * Main Module
 * Initializes the generator and handles events
 */

import { IMAGE_TYPES, presets, colorPalette, logoPositions } from './config.js';

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

// State
let currentImageType = IMAGE_TYPES.OG;
let currentState = {
  title: 'Logi-Ink',
  subtitle: 'Digital Innovation & Creative Solutions',
  slogan: 'Transforming Ideas Into Reality',
  logoPosition: 'top-left',
  logoSize: 120,
  logoColor: 'cyan',
  titleSize: 72,
  subtitleSize: 28,
  sloganSize: 20,
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
  titleOffsetX: 0,
  titleOffsetY: 0,
  subtitleOffsetX: 0,
  subtitleOffsetY: 0,
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
let titleInput, subtitleInput, sloganInput, logoPositionSelect;
let titleSizeSlider, titleSizeValue, subtitleSizeSlider, subtitleSizeValue;
let sloganSizeSlider, sloganSizeValue, logoSizeSlider, logoSizeValue;
let titleGlow, subtitleGlow, sloganGlow;
let dividerAboveTitle, dividerBelowTitle, dividerAboveSubtitle, dividerBelowSubtitle;
let dividerAboveSlogan, dividerBelowSlogan;
let dividerWidthSlider, dividerWidthValue;
let titleDividerWidthSlider, titleDividerWidthValue;
let subtitleDividerWidthSlider, subtitleDividerWidthValue;
let sloganDividerWidthSlider, sloganDividerWidthValue;
let exportBtn, copyBtn, randomBtn, undoBtn, redoBtn, gridToggleBtn, popoutBtn;
let copyClipboardBtn, fullscreenBtn;
let rulerToggleBtn, historyTimelineBtn, closeHistoryBtn;
let contrastToggleBtn, transparencyCheckerBtn, layerVisibilityBtn, closeLayerVisibilityBtn;
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
  logoPositionSelect = document.getElementById('logoPosition');
  titleSizeSlider = document.getElementById('titleSize');
  titleSizeValue = document.getElementById('titleSizeValue');
  subtitleSizeSlider = document.getElementById('subtitleSize');
  subtitleSizeValue = document.getElementById('subtitleSizeValue');
  sloganSizeSlider = document.getElementById('sloganSize');
  sloganSizeValue = document.getElementById('sloganSizeValue');
  logoSizeSlider = document.getElementById('logoSize');
  logoSizeValue = document.getElementById('logoSizeValue');
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
    title: titleInput.value || '',
    subtitle: subtitleInput.value || '',
    slogan: sloganInput ? sloganInput.value : '',
    logoPosition: logoPositionSelect ? logoPositionSelect.value : 'top-left',
    logoSize: logoSizeValue ? parseInt(logoSizeValue.value) || 120 : 120,
    logoColor: currentState.logoColor || getLogoColorKey() || 'cyan', // Preserve existing logoColor if set
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
    titleOffsetX: titleXValue ? parseInt(titleXValue.value) || 0 : 0,
    titleOffsetY: titleYValue ? parseInt(titleYValue.value) || 0 : 0,
    subtitleOffsetX: subtitleXValue ? parseInt(subtitleXValue.value) || 0 : 0,
    subtitleOffsetY: subtitleYValue ? parseInt(subtitleYValue.value) || 0 : 0,
    sloganOffsetX: sloganXValue ? parseInt(sloganXValue.value) || 0 : 0,
    sloganOffsetY: sloganYValue ? parseInt(sloganYValue.value) || 0 : 0,
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
  logoPositionSelect.value = state.logoPosition || 'top-left';
  logoSizeValue.value = state.logoSize || 120;
  logoSizeSlider.value = state.logoSize || 120;
  titleSizeValue.value = state.titleSize || 72;
  titleSizeSlider.value = state.titleSize || 72;
  subtitleSizeValue.value = state.subtitleSize || 28;
  subtitleSizeSlider.value = state.subtitleSize || 28;
  sloganSizeValue.value = state.sloganSize || 20;
  sloganSizeSlider.value = state.sloganSize || 20;
  titleGlow.checked = state.titleGlow || false;
  subtitleGlow.checked = state.subtitleGlow || false;
  sloganGlow.checked = state.sloganGlow || false;
  dividerAboveTitle.checked = state.dividerAboveTitle || false;
  dividerBelowTitle.checked = state.dividerBelowTitle || false;
  dividerAboveSubtitle.checked = state.dividerAboveSubtitle || false;
  dividerBelowSubtitle.checked = state.dividerBelowSubtitle || false;
  if (dividerAboveSlogan) dividerAboveSlogan.checked = state.dividerAboveSlogan || false;
  if (dividerBelowSlogan) dividerBelowSlogan.checked = state.dividerBelowSlogan || false;
  dividerWidthValue.value = state.dividerWidth || 2;
  dividerWidthSlider.value = state.dividerWidth || 2;
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
  titleXValue.value = state.titleOffsetX || 0;
  titleXSlider.value = state.titleOffsetX || 0;
  titleYValue.value = state.titleOffsetY || 0;
  titleYSlider.value = state.titleOffsetY || 0;
  subtitleXValue.value = state.subtitleOffsetX || 0;
  subtitleXSlider.value = state.subtitleOffsetX || 0;
  subtitleYValue.value = state.subtitleOffsetY || 0;
  subtitleYSlider.value = state.subtitleOffsetY || 0;
  if (sloganXValue) {
    sloganXValue.value = state.sloganOffsetX || 0;
    sloganXSlider.value = state.sloganOffsetX || 0;
  }
  if (sloganYValue) {
    sloganYValue.value = state.sloganOffsetY || 0;
    sloganYSlider.value = state.sloganOffsetY || 0;
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
      titleXSlider.value = 0;
      titleXValue.value = 0;
      titleYSlider.value = 0;
      titleYValue.value = 0;
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
      subtitleXSlider.value = 0;
      subtitleXValue.value = 0;
      subtitleYSlider.value = 0;
      subtitleYValue.value = 0;
      updateState();
    });
  }

  // Text inputs
  [titleInput, subtitleInput, sloganInput].forEach(input => {
    if (input) {
      input.addEventListener('input', () => updateState());
    }
  });

  // Logo position select - use 'change' event for selects
  if (logoPositionSelect) {
    logoPositionSelect.addEventListener('change', () => updateState());
  }

  // Checkboxes
  [
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

      // Store button state
      const originalText = copyClipboardBtn.textContent;
      const originalDisabled = copyClipboardBtn.disabled;
      copyClipboardBtn.textContent = 'Copying...';
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
            copyClipboardBtn.textContent = originalText;
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
        copyClipboardBtn.textContent = originalText;
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
          // Don't start dragging if clicking on the close button
          if (e.target === closeLayerVisibilityBtn || e.target.closest('.preset-btn')) {
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
        const isVisible = historyTimeline.style.display !== 'none';
        historyTimeline.style.display = isVisible ? 'none' : 'block';
        historyTimelineBtn.classList.toggle('active', !isVisible);

        if (!isVisible) {
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

  function updateHistoryTimeline() {
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
    reversedHistory.forEach((state, reverseIndex) => {
      const actualIndex = history.length - 1 - reverseIndex;
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      if (actualIndex === historyIndex) {
        historyItem.classList.add('active');
      }

      // Create a simple preview based on state
      const previewText = state.title ? state.title.substring(0, 10) : 'Empty';
      const previewColor = state.titleColor || '#00ffff';

      historyItem.innerHTML = `
        <div class="history-item-preview" style="background: ${previewColor}; color: #0a0a0a; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: bold; padding: 0.25rem;">
          ${previewText}
        </div>
        <div class="history-item-info">
          <span class="history-item-index">#${actualIndex + 1}</span>
          <span class="history-item-time">State ${actualIndex + 1}</span>
        </div>
      `;

      historyItem.addEventListener('click', () => {
        const state = getStateAt(index);
        if (state) {
          setHistoryIndex(index);
          // Apply state to UI and update
          applyStateToUI(state);
          currentState = state;
          updateState(true); // Skip history to avoid duplicate entry
          const historyTimeline = document.getElementById('historyTimeline');
          if (historyTimeline) {
            historyTimeline.style.display = 'none';
            if (historyTimelineBtn) {
              historyTimelineBtn.classList.remove('active');
            }
          }
        }
      });

      historyTimelineContent.appendChild(historyItem);
    });
  }

  async function generateHistoryPreview(container, state) {
    // Simplified preview - just show a placeholder for now
    // Full preview generation would require applying the state temporarily
    container.innerHTML =
      '<div style="color: #666; text-align: center; padding: 0.5rem; font-size: 0.7rem;">Preview</div>';
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

  // Initialize custom dropdown with hover previews
  initCustomPatternDropdown();
  initCustomExportQualityDropdown();

  // Initialize custom logo position dropdown
  if (logoPositionSelect) {
    initCustomLogoPositionDropdown();
    // Ensure change event listener is attached after dropdown is initialized
    logoPositionSelect.addEventListener('change', () => updateState());
  }

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
      if (logoPositionSelect) {
        logoPositionSelect.value = logoPositions[Math.floor(Math.random() * logoPositions.length)];
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

      // Store button state
      const originalText = copyBtn.textContent;
      const originalDisabled = copyBtn.disabled;
      copyBtn.textContent = 'Copying...';
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
          copyBtn.textContent = originalText;
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
        copyBtn.textContent = originalText;
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
      try {
        // 1. Clear HTTP Cache via Cache API (if available)
        if ('caches' in window) {
          try {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map(cacheName => {
                console.log('Deleting cache:', cacheName);
                return caches.delete(cacheName);
              })
            );
            console.log('All caches cleared via Cache API');
          } catch (cacheError) {
            console.warn('Error clearing Cache API:', cacheError);
          }
        }

        // 2. Unregister all service workers (if any)
        if ('serviceWorker' in navigator) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              await registration.unregister();
              console.log('Unregistered service worker:', registration.scope);

              // Also clear service worker cache
              if (registration.active) {
                try {
                  const cacheNames = await caches.keys();
                  await Promise.all(cacheNames.map(name => caches.delete(name)));
                } catch (swCacheError) {
                  console.warn('Error clearing service worker cache:', swCacheError);
                }
              }
            }
          } catch (swError) {
            console.warn('Error unregistering service workers:', swError);
          }
        }

        // 3. Clear IndexedDB (if used)
        if ('indexedDB' in window) {
          try {
            const databases = await indexedDB.databases();
            await Promise.all(
              databases.map(db => {
                return new Promise((resolve, reject) => {
                  const deleteReq = indexedDB.deleteDatabase(db.name);
                  deleteReq.onsuccess = () => {
                    console.log('Deleted IndexedDB:', db.name);
                    resolve();
                  };
                  deleteReq.onerror = () => reject(deleteReq.error);
                  deleteReq.onblocked = () => {
                    console.warn('IndexedDB delete blocked for:', db.name);
                    resolve(); // Continue anyway
                  };
                });
              })
            );
          } catch (dbError) {
            console.warn('Could not clear IndexedDB:', dbError);
          }
        }

        // 4. Clear localStorage and sessionStorage
        try {
          localStorage.clear();
          sessionStorage.clear();
          console.log('Cleared localStorage and sessionStorage');
        } catch (storageError) {
          console.warn('Error clearing storage:', storageError);
        }

        // 5. Force network fetch with no-cache headers to invalidate HTTP cache
        try {
          await fetch(window.location.href, {
            method: 'GET',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
            },
          }).catch(() => {
            // Ignore fetch errors - we're just trying to invalidate cache
          });
        } catch (fetchError) {
          // Ignore - this is just cache invalidation attempt
        }

        // Small delay to ensure all async operations complete
        await new Promise(resolve => setTimeout(resolve, 200));

        console.log('All caches cleared, performing hard reload...');

        // 6. Force hard reload by navigating to cache-busted URL
        // This is the most reliable way to bypass all caches
        const baseUrl = window.location.origin + window.location.pathname;
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const newUrl = `${baseUrl}?hr=${timestamp}&r=${randomStr}${window.location.hash || ''}`;

        console.log('Navigating to:', newUrl);

        // Navigate to new URL - this forces a completely fresh load
        // Using href instead of replace ensures proper navigation
        window.location.href = newUrl;
      } catch (error) {
        console.error('Error during hard refresh:', error);

        // Fallback: Aggressive simple reload
        try {
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload(true);
        } catch (fallbackError) {
          console.error('Fallback hard refresh also failed:', fallbackError);
          // Last resort: simple reload
          window.location.reload();
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
function init() {
  loadFonts();
  initDOMElements();
  initColorPickers();
  populateTemplates();
  populateBackgroundPatterns();
  populateSavedPresets();
  setupEventListeners();

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
  if (titleGlow) titleGlow.checked = Math.random() > 0.5;
  if (subtitleGlow) subtitleGlow.checked = Math.random() > 0.5;
  if (sloganGlow) sloganGlow.checked = Math.random() > 0.5;

  // Randomize logo position
  if (logoPositionSelect) {
    logoPositionSelect.value = logoPositions[Math.floor(Math.random() * logoPositions.length)];
  }

  // Randomize text alignment
  if (titleXSlider && titleXValue) {
    const x = -50 + Math.random() * 100;
    titleXSlider.value = x;
    titleXValue.value = x;
  }
  if (titleYSlider && titleYValue) {
    const y = -50 + Math.random() * 100;
    titleYSlider.value = y;
    titleYValue.value = y;
  }
  if (subtitleXSlider && subtitleXValue) {
    const x = -50 + Math.random() * 100;
    subtitleXSlider.value = x;
    subtitleXValue.value = x;
  }
  if (subtitleYSlider && subtitleYValue) {
    const y = -50 + Math.random() * 100;
    subtitleYSlider.value = y;
    subtitleYValue.value = y;
  }
  if (sloganXSlider && sloganXValue) {
    const x = -50 + Math.random() * 100;
    sloganXSlider.value = x;
    sloganXValue.value = x;
  }
  if (sloganYSlider && sloganYValue) {
    const y = -50 + Math.random() * 100;
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
  if (titleGlow) titleGlow.checked = false;
  if (subtitleGlow) subtitleGlow.checked = false;
  if (sloganGlow) sloganGlow.checked = false;

  // Reset logo position
  if (logoPositionSelect) {
    logoPositionSelect.value = 'top-left';
  }

  // Reset text alignment
  if (titleXSlider && titleXValue) {
    titleXSlider.value = 0;
    titleXValue.value = 0;
  }
  if (titleYSlider && titleYValue) {
    titleYSlider.value = 0;
    titleYValue.value = 0;
  }
  if (subtitleXSlider && subtitleXValue) {
    subtitleXSlider.value = 0;
    subtitleXValue.value = 0;
  }
  if (subtitleYSlider && subtitleYValue) {
    subtitleYSlider.value = 0;
    subtitleYValue.value = 0;
  }
  if (sloganXSlider && sloganXValue) {
    sloganXSlider.value = 0;
    sloganXValue.value = 0;
  }
  if (sloganYSlider && sloganYValue) {
    sloganYSlider.value = 0;
    sloganYValue.value = 0;
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

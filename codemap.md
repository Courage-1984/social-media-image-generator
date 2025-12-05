# Codebase Map - Social Media Image Generator

**Generated:** $(date)  
**Project Type:** Vanilla JavaScript Web Application  
**Architecture:** Modular ES6 Modules

---

## 📁 Directory Structure

```
social-media-image-generator/
├── css/                    # Stylesheets (8 files)
│   ├── base.css
│   ├── canvas.css
│   ├── color-picker.css
│   ├── controls.css
│   ├── layout.css
│   ├── skeleton.css
│   ├── tabs.css
│   └── toast.css
├── docs/                   # Documentation (8 files)
│   ├── DETAILED_REPORT.md
│   ├── DOCUMENTATION_OVERHAUL_SUMMARY.md
│   ├── EXECUTIVE_SUMMARY.md
│   ├── EXPORT_SYSTEM_REPORT.md
│   ├── export-hires.md
│   ├── IMPLEMENTATION_ALIGNMENT.md
│   ├── README.md
│   └── RULER_GUIDES.md
├── js/                     # JavaScript modules (28 files)
│   ├── main.js            # Entry point (3498 lines)
│   ├── config.js          # Configuration hub
│   ├── preview.js         # Rendering engine
│   ├── export.js          # Export functionality
│   ├── background-patterns.js
│   ├── batch-export.js
│   ├── button-tooltips.js
│   ├── color-picker.js
│   ├── css-filter-solver.js
│   ├── custom-export-quality-dropdown.js
│   ├── custom-logo-color-dropdown.js
│   ├── custom-logo-position-dropdown.js
│   ├── custom-pattern-dropdown.js
│   ├── custom-preset-dropdown.js
│   ├── custom-template-dropdown.js
│   ├── grid-overlay.js
│   ├── history.js
│   ├── pattern-preview-tooltip.js
│   ├── pattern-settings-tooltip.js
│   ├── preset-storage.js
│   ├── preview-popout.js
│   ├── ruler-guides.js
│   ├── skeleton-screen.js
│   ├── tabs.js
│   ├── templates.js
│   ├── test-cls-monitor.js
│   ├── text-alignment.js
│   └── utils/              # Utility modules (4 files)
│       ├── dither-worker.js
│       ├── export-high-res-worker.js
│       ├── export-high-res.js
│       └── toast.js
├── generate.html          # Main application entry point
└── preview-popout-window.html  # Popup preview window
```

---

## 🎯 Entry Points

### Primary Entry Point
- **File:** `generate.html`
- **Script:** `js/main.js` (ES Module)
- **Purpose:** Main application interface

### Secondary Entry Point
- **File:** `preview-popout-window.html`
- **Type:** Standalone popup window
- **Communication:** `postMessage` API with parent window

---

## 🔗 Dependency Graph

### Core Modules

#### `js/config.js` (Configuration Hub)
**Exports:**
- `IMAGE_TYPES` - Image dimension configurations
- `colorPalette` - Color definitions
- `glowColors` - Glow effect colors
- `presets` - Background preset styles
- `logoPositions` - Logo position options
- `logoPositionLabels` - Human-readable labels

**Imported By:** 7 modules
- `js/main.js`
- `js/preview.js`
- `js/export.js`
- `js/color-picker.js`
- `js/custom-logo-color-dropdown.js`
- `js/custom-pattern-dropdown.js`
- `js/batch-export.js`

**Role:** Central configuration - low coupling risk (intentional sharing)

---

#### `js/main.js` (Orchestration Hub)
**Size:** 3,498 lines  
**Imports:** 22 modules

**Dependencies:**
- `config.js` - Configuration
- `color-picker.js` - Color selection
- `preview.js` - Rendering
- `export.js` - Image export
- `grid-overlay.js` - Grid display
- `background-patterns.js` - Pattern rendering
- `preset-storage.js` - Preset persistence
- `history.js` - Undo/redo
- `templates.js` - Template system
- `pattern-preview-tooltip.js` - Pattern previews
- `custom-pattern-dropdown.js` - Pattern selector
- `custom-template-dropdown.js` - Template selector
- `custom-export-quality-dropdown.js` - Quality selector
- `custom-logo-position-dropdown.js` - Position selector
- `custom-logo-color-dropdown.js` - Logo color selector
- `preview-popout.js` - Popup window
- `tabs.js` - Tab navigation
- `pattern-settings-tooltip.js` - Settings tooltips
- `custom-preset-dropdown.js` - Preset selector
- `utils/toast.js` - Notifications
- `button-tooltips.js` - Button tooltips
- `ruler-guides.js` - Ruler/guide system

**Role:** Application entry point and event orchestration

**⚠️ Hotspot:** Very large file - consider splitting into:
- Event handlers module
- State management module
- Initialization module

---

#### `js/preview.js` (Rendering Engine)
**Exports:**
- `updatePreview()` - Update canvas preview
- `setImageType()` - Set image dimensions
- `setPreset()` - Apply preset style
- `scaleCanvasForPreview()` - Scale canvas
- `setZoomLevel()` / `getZoomLevel()` - Zoom control
- `cycleZoomLevel()` - Zoom cycling
- `setPan()` / `getPan()` - Pan control

**Imports:**
- `config.js` - Configuration
- `color-picker.js` - Color selection
- `background-patterns.js` - Pattern rendering
- `grid-overlay.js` - Grid display

**Imported By:**
- `js/main.js`

**Role:** Core rendering logic - changes affect entire application

---

#### `js/export.js` (Export Hub)
**Exports:**
- `exportImage()` - Main export function
- `loadHtml2Canvas()` - Load html2canvas library
- `loadHtmlToImage()` - Load html-to-image library
- `convertMaskedLogoToImage()` - Logo conversion

**Imports:**
- `config.js` - Image type configurations
- `utils/toast.js` - User notifications
- `utils/export-high-res.js` - High-res export
- `test-cls-monitor.js` - Performance monitoring (optional)

**Imported By:**
- `js/main.js`
- `js/batch-export.js`

**Role:** Critical export functionality with external dependencies

---

### Utility Modules

#### `js/utils/toast.js`
**Exports:** `showToast()`
**Imported By:** `main.js`, `export.js`
**Purpose:** User notification system

#### `js/utils/export-high-res.js`
**Exports:**
- `exportHighResCanvas()` - High-res canvas export
- `exportHighResGradient()` - Gradient export

**Imported By:** `export.js`
**Purpose:** High-resolution export with dithering

#### `js/utils/export-high-res-worker.js`
**Exports:** `exportHighResCanvas()`
**Imports:** `dither-worker.js`
**Uses:** Web Workers API, OffscreenCanvas
**Purpose:** Off-thread dithering for performance

#### `js/utils/dither-worker.js`
**Type:** Web Worker
**Used By:** `export-high-res-worker.js`
**Purpose:** Off-thread dithering processing

---

### Feature Modules

#### `js/color-picker.js`
**Exports:**
- `createColorPicker()` - Create color picker UI
- `getSelectedColor()` - Get selected color
- `getSelectedColorKey()` - Get color key
- `setSelectedColor()` - Set color selection

**Imports:** `config.js`
**Imported By:** `main.js`, `preview.js`, `custom-pattern-dropdown.js`

#### `js/background-patterns.js`
**Exports:**
- `backgroundPatterns` - Pattern definitions
- `applyBackgroundPattern()` - Apply pattern to element
- `patternDefaults` - Default pattern settings
- `hexToRgba()` - Color conversion

**Imported By:**
- `main.js`
- `preview.js`
- `custom-pattern-dropdown.js`
- `pattern-preview-tooltip.js`

#### `js/preset-storage.js`
**Exports:**
- `savePreset()` - Save preset to localStorage
- `loadPreset()` - Load preset from localStorage
- `deletePreset()` - Delete preset
- `getSavedPresets()` - Get all saved presets
- `presetExists()` - Check if preset exists

**Uses:** LocalStorage API
**Imported By:** `main.js`

#### `js/history.js`
**Exports:**
- `addToHistory()` - Add state to history
- `undo()` - Undo last change
- `redo()` - Redo last change
- `canUndo()` / `canRedo()` - Check undo/redo availability
- `initHistory()` - Initialize history
- `getHistory()` - Get history array
- `getStateAt()` - Get state at index
- `setHistoryIndex()` - Set history index
- `clearHistory()` - Clear history

**Imported By:** `main.js`

#### `js/templates.js`
**Exports:**
- `templates` - Template definitions
- `getTemplate()` - Get template by key
- `getAllTemplates()` - Get all templates
- `applyTemplate()` - Apply template to canvas

**Imported By:**
- `main.js`
- `custom-template-dropdown.js`

#### `js/grid-overlay.js`
**Exports:**
- `toggleGridOverlay()` - Toggle grid display
- `isGridOverlayVisible()` - Check grid visibility
- `updateGridOverlayDimensions()` - Update grid size

**Imported By:**
- `main.js`
- `preview.js`

#### `js/ruler-guides.js`
**Exports:**
- `initRulerGuides()` - Initialize ruler system
- `getRulerState()` - Get ruler state
- `setRulerState()` - Set ruler state

**Imported By:** `main.js`

#### `js/preview-popout.js`
**Exports:**
- `createPopoutPreview()` - Create popup window
- `showPopoutPreview()` - Show popup
- `hidePopoutPreview()` - Hide popup
- `togglePopoutPreview()` - Toggle popup
- `syncPopoutPreview()` - Sync with main window
- `isPopoutOpenState()` - Check if popup is open

**Imported By:** `main.js`
**Uses:** `postMessage` API

#### `js/batch-export.js`
**Exports:**
- `batchExport()` - Export multiple variations
- `generateVariations()` - Generate state variations

**Imports:**
- `export.js`
- `config.js`

---

### UI Component Modules

#### Custom Dropdown Components
- `js/custom-logo-color-dropdown.js` - Logo color selector
- `js/custom-logo-position-dropdown.js` - Logo position selector
- `js/custom-preset-dropdown.js` - Preset selector
- `js/custom-export-quality-dropdown.js` - Export quality selector
- `js/custom-template-dropdown.js` - Template selector
- `js/custom-pattern-dropdown.js` - Pattern selector

#### Tooltip Components
- `js/button-tooltips.js` - Button tooltips
- `js/pattern-preview-tooltip.js` - Pattern preview tooltips
- `js/pattern-settings-tooltip.js` - Pattern settings tooltips

#### Navigation
- `js/tabs.js` - Tab navigation system

---

### Helper Modules

#### `js/text-alignment.js`
**Exports:**
- `calculateTextPosition()` - Calculate text position
- `applyTextPosition()` - Apply text position

**Status:** ✅ Low coupling - standalone utility

#### `js/css-filter-solver.js`
**Exports:**
- `generateColorFilter()` - Generate CSS filter for color

**Status:** ✅ Low coupling - standalone utility

#### `js/test-cls-monitor.js`
**Exports:**
- `initCLSMonitor()` - Initialize CLS monitoring
- `startExportMonitoring()` - Start monitoring
- `stopExportMonitoring()` - Stop monitoring
- `resetCLSMonitor()` - Reset monitor
- `cleanupCLSMonitor()` - Cleanup monitor

**Imported By:** `export.js` (optional/lazy loaded)

---

## 🔄 Dependency Chains

### Deepest Chains

1. **main.js → custom-pattern-dropdown.js → background-patterns.js → config.js**
   - Depth: 3 levels
   - Purpose: Pattern selection with preview

2. **main.js → preview.js → config.js**
   - Depth: 2 levels
   - Purpose: Rendering with configuration

3. **main.js → export.js → export-high-res.js**
   - Depth: 2 levels
   - Purpose: High-resolution export

4. **export.js → export-high-res-worker.js → dither-worker.js**
   - Depth: 2 levels
   - Purpose: Off-thread dithering

---

## ⚠️ Coupling Analysis

### High Coupling (Expected)

1. **`js/config.js`**
   - **Reason:** Imported by 7+ modules
   - **Risk:** ✅ Low - Configuration is meant to be shared
   - **Status:** Acceptable

2. **`js/main.js`**
   - **Reason:** Imports 22 modules (orchestration hub)
   - **Risk:** ⚠️ Medium - Large dependency surface
   - **Status:** Expected for entry point, but consider splitting

### Potential Hotspots

1. **`js/main.js` (3,498 lines)**
   - **Concern:** Very large file
   - **Suggestions:**
     - Extract event handlers into `js/event-handlers.js`
     - Extract state management into `js/state.js`
     - Extract initialization into `js/init.js`

2. **`js/preview.js`**
   - **Concern:** Core rendering logic - changes affect entire app
   - **Suggestions:**
     - Extract rendering strategies
     - Add unit tests for rendering functions
     - Consider rendering pipeline abstraction

3. **`js/export.js`**
   - **Concern:** Critical functionality with external dependencies
   - **Suggestions:**
     - Add comprehensive error handling
     - Add fallback strategies
     - Add export tests

### Low Coupling (Good)

1. **`js/text-alignment.js`**
   - ✅ Standalone utility with no dependencies
   - ✅ Isolated functionality

2. **`js/css-filter-solver.js`**
   - ✅ Standalone utility with no dependencies
   - ✅ Isolated functionality

---

## 📦 External Dependencies

### Runtime Libraries (CDN)

1. **html-to-image**
   - **Type:** CDN (dynamic loading)
   - **Purpose:** Primary canvas rendering and export
   - **Fallback:** html2canvas

2. **html2canvas**
   - **Type:** CDN (dynamic loading)
   - **Purpose:** Fallback canvas rendering

### Browser APIs

- **Web Workers API** - Off-thread processing
- **OffscreenCanvas API** - Worker canvas rendering
- **LocalStorage API** - Preset persistence
- **Blob API** - File generation
- **Canvas API** - Canvas operations
- **postMessage API** - Popup window communication

---

## 🎨 Stylesheet Architecture

### Load Order (in `generate.html`)

1. `css/base.css` - Base styles
2. `css/layout.css` - Layout structure
3. `css/controls.css` - Control components
4. `css/color-picker.css` - Color picker styles
5. `css/canvas.css` - Canvas styles
6. `css/tabs.css` - Tab navigation
7. `css/toast.css` - Toast notifications

### Organization
- ✅ Modular CSS architecture
- ✅ Separation of concerns
- ✅ Component-specific stylesheets

---

## 📊 Metrics

- **Total Files:** 48
- **JavaScript Files:** 30
- **CSS Files:** 8
- **HTML Files:** 2
- **Documentation Files:** 8

### Module Breakdown
- **Core Modules:** 4
- **Utility Modules:** 4
- **Feature Modules:** 10
- **UI Modules:** 10
- **Helper Modules:** 3

### Size Metrics
- **Largest Module:** `js/main.js` (3,498 lines)
- **Average Module Size:** ~300 lines
- **Max Dependencies:** 22 (main.js)
- **Max Dependency Depth:** 3 levels

---

## 🏗️ Architecture Summary

### Pattern
- **Module System:** ES6 Modules (import/export)
- **Bundler:** None - direct browser module loading
- **Framework:** Vanilla JavaScript
- **State Management:** Centralized in `main.js` with `history.js` for undo/redo
- **UI:** DOM manipulation with custom components
- **Styling:** Modular CSS files

### Strengths
✅ Modular architecture  
✅ Clear separation of concerns  
✅ ES6 module system  
✅ Low coupling for utilities  
✅ Web Worker support for performance

### Areas for Improvement
⚠️ `main.js` is very large (3,498 lines) - consider splitting  
⚠️ Consider adding unit tests for core modules  
⚠️ Consider adding TypeScript for type safety  
⚠️ Consider bundler for production optimization

---

## 🔍 Quick Reference

### Find Module By Functionality

- **Configuration:** `js/config.js`
- **Rendering:** `js/preview.js`
- **Export:** `js/export.js`
- **State Management:** `js/main.js` + `js/history.js`
- **Storage:** `js/preset-storage.js`
- **Patterns:** `js/background-patterns.js`
- **Templates:** `js/templates.js`
- **Utilities:** `js/utils/`
- **Web Workers:** `js/utils/dither-worker.js`

### Entry Points
- **Main App:** `generate.html` → `js/main.js`
- **Popup Preview:** `preview-popout-window.html`

---

**Generated by codemap command**  
**Last Updated:** $(date)


# Ruler/Guides System Documentation
## Social Media Image Generator

**Status:** ✅ Complete  
**Last Updated:** 2025-01-30

---

## Overview

The ruler/guides system provides precision measurement and alignment tools for the canvas. The implementation uses a strict MVC pattern with Canvas-based rendering for optimal performance.

---

## Features

### Core Functionality
- **Horizontal and Vertical Rulers:** Display pixel measurements with adaptive tick spacing
- **Guide Lines:** Draggable horizontal and vertical guides
- **Crosshair:** Mouse position indicator with glow effect
- **Distance Indicators:** Real-time spacing between adjacent guides
- **Snap-to-Grid:** Real-time snapping during guide dragging
- **Unit Conversion:** px, %, em with smart formatting
- **Color Cycling:** 5-color palette (Cyan, Magenta, Green, Yellow, Orange)
- **Keyboard Shortcuts:** H/V for guides, C for clear (with confirmation)

---

## Architecture

### MVC Pattern

**Model (RulerState):**
- Centralized state management
- Single source of truth for all ruler data
- Position stored as absolute pixels (`positionPx`) to prevent floating-point errors

**View (Canvas):**
- Dual canvas layers for optimal performance
- Cached ruler marks (redrawn only on size/unit change)
- Dynamic guide layer (RAF loop for smooth updates)

**Controller (Events):**
- Mouse tracking for crosshair
- Guide dragging with snap-to-grid
- Keyboard shortcuts
- UI management

### Performance Optimizations

- **60 FPS Target:** RAF loop decouples rendering from event handling
- **Optimized Mouse Tracking:** State updates only, rendering deferred to RAF
- **Debounced Calculations:** O(NlogN) distance calculations deferred until drag completes
- **Batched Drawing:** Guides drawn grouped by color to minimize state changes
- **Smart Ruler:** Heckbert's algorithm for adaptive tick spacing

---

## Technical Implementation

### State Management

```javascript
const RulerState = {
  isActive: false,
  snapEnabled: false,
  currentUnit: 'px',
  gridSize: 10,
  guides: [], // Guide objects with positionPx
  cursorX: 0,
  cursorY: 0,
  cursorVisible: false,
  needsRerender: true,
  rafId: null,
};
```

### Guide Data Model

```javascript
class Guide {
  constructor(type, positionPx, colorIndex) {
    this.id = uniqueId;
    this.type = 'H' | 'V';
    this.positionPx = positionPx; // Source of truth
    this.colorIndex = 0-4;
    this.isDragging = false;
  }
}
```

### Rendering Pipeline

1. **Mouse Move Event:** Updates `RulerState.cursorX/Y` (O(1))
2. **RAF Loop:** Calls `renderGuideLayer()` (O(N) for guides)
3. **Distance Calculation:** Debounced, only when not dragging (O(NlogN))

---

## File Structure

```
generate/js/ruler-guides.js
├── RulerState (Model)
├── Guide class
├── UnitConverter
├── SmartRulerEngine
├── Canvas initialization
├── Rendering functions
│   ├── renderRulerMarks()
│   ├── renderGuideLayer()
│   └── renderDistanceIndicators()
├── RAF loop
├── Event handlers
│   ├── setupMouseTracking()
│   ├── setupGuideDragging()
│   └── handleKeyboardShortcuts()
└── UI management
```

---

## Usage

### Toggle Ruler/Guides
- Click the ruler toggle button (⌖) in preview controls
- Or use keyboard shortcut (if configured)

### Add Guides
- **Horizontal Guide:** Press `H` key or click horizontal ruler
- **Vertical Guide:** Press `V` key or click vertical ruler
- **Drag Guides:** Click and drag existing guides to reposition

### Delete Guides
- Click delete button on guide
- Or press `C` to clear all guides (with confirmation)

### Snap-to-Grid
- Toggle snap-to-grid in ruler settings
- Guides automatically snap to grid during drag

### Unit Conversion
- Select unit (px, %, em) from dropdown
- Ruler marks and measurements update automatically

---

## Keyboard Shortcuts

- **H:** Add horizontal guide
- **V:** Add vertical guide
- **C:** Clear all guides (with confirmation)

---

## Testing Checklist

- [x] Toggle ruler on/off
- [x] Add guides (H/V keys, buttons)
- [x] Drag guides to reposition
- [x] Delete individual guides
- [x] Clear all guides
- [x] Snap-to-grid functionality
- [x] Unit conversion (px, %, em)
- [x] Distance indicators
- [x] Crosshair display
- [x] Color cycling
- [x] Performance at 60 FPS

---

## Performance Metrics

- **Target FPS:** 60
- **Mouse Tracking:** O(1) state updates
- **Guide Rendering:** O(N) where N = number of guides
- **Distance Calculation:** O(NlogN), debounced during drag

---

## Browser Compatibility

- Chrome (latest) ✅
- Firefox (latest) ✅
- Safari (latest) ✅
- Edge (latest) ✅

**Requirements:**
- Canvas API
- requestAnimationFrame
- Mouse events

---

**Document Version:** 1.0  
**Maintained By:** Development Team


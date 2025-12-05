# Social Media Image Generator Documentation

**Location:** `./generate/`  
**Version:** 2.0  
**Status:** Production Ready  
**Last Updated:** 2025-01-30

---

## Quick Navigation

### Core Documentation
- **[Executive Summary](./EXECUTIVE_SUMMARY.md)** - High-level overview, features, and project statistics
- **[Detailed Technical Report](./DETAILED_REPORT.md)** - Comprehensive technical documentation
- **[Export System Report](./EXPORT_SYSTEM_REPORT.md)** - Complete export functionality documentation
- **[Implementation Alignment](./IMPLEMENTATION_ALIGNMENT.md)** - Documentation vs code comparison

### Feature-Specific Documentation
- **[Ruler/Guides System](./RULER_GUIDES.md)** - Ruler and guide tools documentation (Canvas-based MVC architecture)
- **[High-Resolution Export Guide](./export-hires.md)** - Gradient export and dithering guide

---

## Overview

The Social Media Image Generator is a comprehensive web-based tool for creating high-quality social media images optimized for Open Graph (OG) images and Twitter Cards.

### Key Features

- **Dual Image Types:** OG Images (1200×630px) and Twitter Cards (1200×675px)
- **16 Preset Styles:** Hero, Service, Minimal, Gradient, Particles, Cyberpunk, Neon, Geometric, Wave, Matrix, Dark, Space, Glow, Tech, Electric, Void
- **20+ Background Patterns:** Procedural patterns with extensive customization
- **High-Resolution Export:** 1x-4x quality with dithering to eliminate gradient banding
- **Real-Time Preview:** Live canvas updates with zoom, pan, grid, and ruler tools
- **History System:** Full undo/redo with timeline visualization
- **Template System:** Save and load custom templates
- **Advanced Tools:** Layer visibility, transparency checkerboard, contrast toggle, popout preview

### Technology

- **Export Engine:** html-to-image v1.11.11 (native browser rendering via SVG foreignObject)
- **Architecture:** Vanilla JavaScript ES6 modules, no build tools required
- **Storage:** localStorage for presets and templates
- **Styling:** Modular CSS architecture (8 stylesheets)

---

## Getting Started

1. Open `generate.html` in a modern browser
2. Select image type (OG Image or Twitter Card)
3. Choose a preset style or customize manually
4. Configure text, colors, logo, and background patterns
5. Preview in real-time with zoom/pan capabilities
6. Export at desired quality (1x-4x) or copy to clipboard

---

## Documentation Structure

### Core Documentation
Essential reading for understanding the system:
- **EXECUTIVE_SUMMARY.md** - Start here for overview
- **DETAILED_REPORT.md** - Complete technical reference
- **EXPORT_SYSTEM_REPORT.md** - Export functionality details

### Feature Documentation
Specific feature guides:
- **RULER_GUIDES.md** - Ruler/guides system (Canvas-based MVC architecture)
- **export-hires.md** - High-resolution export techniques

### Development Documentation
For developers and contributors:
- **IMPLEMENTATION_ALIGNMENT.md** - Code vs docs comparison

---

## Recent Updates

### 2025-01-30
- ✅ Ruler/guides system properly hooked up (removed old DOM-based implementation, now uses Canvas-based `ruler-guides.js` module)
- ✅ CLS prevention improvements (debounced updates, container preservation)
- ✅ Export library migration to html-to-image (Phase 2 complete)
- ✅ Granular zoom levels (0.5x-3.0x in 0.1 increments)
- ✅ Documentation alignment and consolidation

---

## File Structure

```
generate/
├── generate.html              # Main application
├── preview-popout-window.html # Popout preview window
├── css/                       # 8 stylesheets
├── js/                        # 25+ JavaScript modules
│   ├── main.js               # Main application logic
│   ├── preview.js             # Canvas rendering
│   ├── export.js              # Export functionality
│   └── utils/                 # Utility modules
└── docs/                      # Documentation
    ├── README.md              # This file
    ├── EXECUTIVE_SUMMARY.md
    ├── DETAILED_REPORT.md
    ├── EXPORT_SYSTEM_REPORT.md
    └── ...
```

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Requirements:**
- ES6 module support
- localStorage API
- Canvas API
- Clipboard API (optional, for copy functionality)

---

## Contributing

When updating documentation:
1. Update relevant documentation files
2. Verify alignment with actual implementation
3. Update this README if structure changes
4. See IMPLEMENTATION_ALIGNMENT.md for comparison guidelines

---

**Maintained By:** Development Team  
**Document Version:** 2.0


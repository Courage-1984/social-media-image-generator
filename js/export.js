/**
 * Export Module
 * Handles image export functionality
 */

import { IMAGE_TYPES } from './config.js';
import { showToast } from './utils/toast.js';
import { exportHighResCanvas } from './utils/export-high-res.js';

// CLS Monitoring for Phase 1 testing (optional - only loaded if available)
let clsMonitor = null;
// Lazy load CLS monitor on first export (avoids top-level await)
async function loadCLSMonitor() {
  if (clsMonitor !== null) return clsMonitor;
  try {
    clsMonitor = await import('./test-cls-monitor.js').catch(() => null);
  } catch (e) {
    // Silently fail - CLS monitoring is optional for testing
    clsMonitor = false;
  }
  return clsMonitor;
}

// PHASE 2: Load html-to-image library (replaces html2canvas)
// html-to-image uses SVG foreignObject for native browser rendering
// Provides better CSS fidelity and performance
let htmlToImageLoaded = false;
export async function loadHtmlToImage() {
  if (htmlToImageLoaded && window.htmlToImage) {
    return window.htmlToImage;
  }

  if (document.querySelector('script[data-html-to-image]')) {
    // Script already loading, wait for it
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (window.htmlToImage) {
          htmlToImageLoaded = true;
          clearInterval(checkInterval);
          resolve(window.htmlToImage);
        }
      }, 100);
    });
  }

  // Load html-to-image from CDN using ES module
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'module';
    script.setAttribute('data-html-to-image', 'true');
    script.textContent = `
      import * as htmlToImage from 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/+esm';
      window.htmlToImage = htmlToImage;
      // Verify the library loaded correctly
      if (!htmlToImage || typeof htmlToImage.toCanvas !== 'function') {
        console.error('html-to-image library loaded but toCanvas function not found', htmlToImage);
        window.dispatchEvent(new CustomEvent('htmlToImageError', { detail: 'toCanvas function not found' }));
      } else {
        window.dispatchEvent(new CustomEvent('htmlToImageLoaded'));
      }
    `;

    // Listen for load event
    const loadHandler = () => {
      htmlToImageLoaded = true;
      if (window.htmlToImage && typeof window.htmlToImage.toCanvas === 'function') {
        resolve(window.htmlToImage);
      } else {
        reject(new Error('html-to-image library loaded but toCanvas function not available'));
      }
    };

    const errorHandler = (event) => {
      reject(new Error(`Failed to load html-to-image library: ${event.detail || 'Unknown error'}`));
    };

    window.addEventListener('htmlToImageLoaded', loadHandler, { once: true });
    window.addEventListener('htmlToImageError', errorHandler, { once: true });

    script.onerror = () => {
      reject(new Error('Failed to load html-to-image library script'));
    };

    document.head.appendChild(script);
  });
}

// Legacy function name for backward compatibility
export function loadHtml2Canvas() {
  return loadHtmlToImage();
}

/**
 * Convert CSS masked logo to canvas for proper export
 * PHASE 2: html-to-image may support CSS mask-image better than html2canvas,
 * but we keep this conversion for maximum compatibility
 * @param {HTMLElement} logoContainer - Logo container with CSS mask
 * @returns {Promise<HTMLImageElement|null>} Image element or null if conversion fails
 */
export async function convertMaskedLogoToImage(logoContainer) {
  if (!logoContainer || !logoContainer.classList.contains('logo-masked')) return null;

  try {
    const logoUrl = logoContainer.dataset.logoUrl || logoContainer.style.maskImage?.replace(/url\(['"]?([^'"]+)['"]?\)/, '$1');
    const bgColor = logoContainer.dataset.logoColor || logoContainer.style.backgroundColor || '#ffffff';
    const width = parseInt(logoContainer.style.width) || 120;
    const height = parseInt(logoContainer.style.height) || 120;

    // Create canvas
    const canvas = document.createElement('canvas');
    const scale = 2; // Use higher resolution for export
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // Load the mask image (SVG)
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => {
        console.warn('Failed to load logo for export:', logoUrl);
        reject(new Error('Failed to load logo'));
      };
      img.src = logoUrl;
    });

    // Draw the background color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Use destination-in composite to apply mask (only show where logo is opaque)
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(img, 0, 0, width, height);

    // Convert canvas to image
    const resultImg = new Image();
    resultImg.src = canvas.toDataURL('image/png');
    await new Promise((resolve) => {
      resultImg.onload = resolve;
    });

    return resultImg;
  } catch (error) {
    console.warn('Failed to convert masked logo to image:', error);
    return null;
  }
}

/**
 * Export canvas as PNG
 * PHASE 2: Uses html-to-image instead of html2canvas for better CSS fidelity
 * @param {HTMLElement} canvasWrapper - Canvas wrapper element
 * @param {Object} imageType - Image type from IMAGE_TYPES
 * @param {HTMLElement} exportBtn - Export button element
 * @param {number} scale - Export scale (1, 2, 3, or 4)
 */
export async function exportImage(canvasWrapper, imageType, exportBtn, scale = 2) {
  if (!canvasWrapper || !exportBtn) return;

  // PHASE 1 Testing: Start CLS monitoring if available
  const monitor = await loadCLSMonitor();
  if (monitor && monitor.startExportMonitoring) {
    monitor.startExportMonitoring();
  }

  exportBtn.textContent = 'Exporting...';
  exportBtn.disabled = true;

  // Get parent container to prevent layout shifts
  const canvasContainer = canvasWrapper.parentElement;
  const originalContainerStyles = canvasContainer ? {
    position: canvasContainer.style.position,
    overflow: canvasContainer.style.overflow,
    contain: canvasContainer.style.contain,
    width: canvasContainer.style.width,
    height: canvasContainer.style.height,
    aspectRatio: canvasContainer.style.aspectRatio,
    minHeight: canvasContainer.style.minHeight,
    maxHeight: canvasContainer.style.maxHeight,
  } : null;

  // Store original styles to restore later (outside try for error handling)
  // PHASE 1: Store all transform-related properties for zero-CLS fix
  // Get computed style early for opacity/zIndex/pointerEvents
  const initialComputedStyle = window.getComputedStyle(canvasWrapper);
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
      opacity: canvasWrapper.style.opacity || initialComputedStyle.opacity,
      zIndex: canvasWrapper.style.zIndex || initialComputedStyle.zIndex,
      pointerEvents: canvasWrapper.style.pointerEvents || initialComputedStyle.pointerEvents,
      visibility: canvasWrapper.style.visibility || initialComputedStyle.visibility,
  };

  try {
    // PHASE 1: Zero-CLS Implementation - Get computed dimensions BEFORE any modifications
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

    // PHASE 1 - Stage 1.1: Store original 1x dimensions (preview size)
    // Use imageType dimensions as the canonical 1x size
    const originalWidthValue = imageType.width;
    const originalHeightValue = imageType.height;
    // Create string versions for CSS properties
    const originalWidth = `${originalWidthValue}px`;
    const originalHeight = `${originalHeightValue}px`;

    // PHASE 1 - Stage 1.2: Clone element for export (ZERO CLS approach)
    // Clone the element so we can modify it without affecting the preview
    // This ensures the preview never changes, eliminating CLS completely
    const exportClone = canvasWrapper.cloneNode(true);
    exportClone.id = 'canvasWrapperExportClone';

    // CRITICAL FIX: Preserve inline styles from original element
    // Background patterns and text sizes are set via inline styles (setProperty)
    // Clearing cssText removes these critical styles, causing export failures
    // Instead, we'll selectively override only positioning/visibility styles
    const originalInlineStyles = canvasWrapper.style.cssText;
    exportClone.style.cssText = originalInlineStyles; // Preserve all inline styles

    // Override positioning/visibility for off-screen capture (preserve everything else)
    exportClone.style.setProperty('position', 'fixed', 'important');
    exportClone.style.setProperty('top', '0', 'important');
    exportClone.style.setProperty('left', '0', 'important');
    exportClone.style.setProperty('z-index', '-9999', 'important');
    exportClone.style.setProperty('opacity', '1', 'important');
    exportClone.style.setProperty('pointer-events', 'none', 'important');
    exportClone.style.setProperty('visibility', 'visible', 'important');
    exportClone.style.setProperty('clip', 'auto', 'important');
    exportClone.style.setProperty('clip-path', 'none', 'important');
    exportClone.style.setProperty('transform', 'none', 'important'); // Remove preview scaling transform

    // CRITICAL FIX: Copy ALL styles from ORIGINAL element (both inline AND computed)
    // This ensures fonts, colors, and all visual properties match exactly
    // We prioritize inline styles (source of truth) but fall back to computed for missing properties
    const textElements = [
      { selector: '[data-layer="title"]', type: 'title' },
      { selector: '[data-layer="subtitle"]', type: 'subtitle' },
      { selector: '[data-layer="slogan"]', type: 'slogan' }
    ];

    textElements.forEach(({ selector, type }) => {
      const originalElement = canvasWrapper.querySelector(selector);
      const cloneElement = exportClone.querySelector(selector);
      if (originalElement && cloneElement) {
        // Get both inline and computed styles
        const inlineStyle = originalElement.style;
        const computedStyle = window.getComputedStyle(originalElement);
        
        // Font properties - prioritize inline, fallback to computed
        const fontSize = inlineStyle.fontSize || computedStyle.fontSize;
        const fontFamily = inlineStyle.fontFamily || computedStyle.fontFamily;
        const fontWeight = inlineStyle.fontWeight || computedStyle.fontWeight;
        const lineHeight = inlineStyle.lineHeight || computedStyle.lineHeight;
        const letterSpacing = inlineStyle.letterSpacing || computedStyle.letterSpacing;
        const textTransform = inlineStyle.textTransform || computedStyle.textTransform;
        const fontStyle = inlineStyle.fontStyle || computedStyle.fontStyle;
        const textShadow = inlineStyle.textShadow || computedStyle.textShadow;
        const color = inlineStyle.color || computedStyle.color;
        
        // Text alignment and positioning
        const textAlign = inlineStyle.textAlign || computedStyle.textAlign;
        const textDecoration = inlineStyle.textDecoration || computedStyle.textDecoration;
        const whiteSpace = inlineStyle.whiteSpace || computedStyle.whiteSpace;
        const wordWrap = inlineStyle.wordWrap || computedStyle.wordWrap;
        const overflowWrap = inlineStyle.overflowWrap || computedStyle.overflowWrap;

        // Apply all font/text properties with !important to ensure they're used
        if (fontSize) cloneElement.style.setProperty('font-size', fontSize, 'important');
        if (fontFamily) cloneElement.style.setProperty('font-family', fontFamily, 'important');
        if (fontWeight) cloneElement.style.setProperty('font-weight', fontWeight, 'important');
        if (lineHeight) cloneElement.style.setProperty('line-height', lineHeight, 'important');
        if (letterSpacing) cloneElement.style.setProperty('letter-spacing', letterSpacing, 'important');
        if (textTransform) cloneElement.style.setProperty('text-transform', textTransform, 'important');
        if (fontStyle) cloneElement.style.setProperty('font-style', fontStyle, 'important');
        if (textShadow) cloneElement.style.setProperty('text-shadow', textShadow, 'important');
        if (color) cloneElement.style.setProperty('color', color, 'important');
        if (textAlign) cloneElement.style.setProperty('text-align', textAlign, 'important');
        if (textDecoration) cloneElement.style.setProperty('text-decoration', textDecoration, 'important');
        if (whiteSpace) cloneElement.style.setProperty('white-space', whiteSpace, 'important');
        if (wordWrap) cloneElement.style.setProperty('word-wrap', wordWrap, 'important');
        if (overflowWrap) cloneElement.style.setProperty('overflow-wrap', overflowWrap, 'important');
        
        // Copy positioning properties to ensure text appears in same location
        const position = inlineStyle.position || computedStyle.position;
        const top = inlineStyle.top || computedStyle.top;
        const left = inlineStyle.left || computedStyle.left;
        const transform = inlineStyle.transform || computedStyle.transform;
        
        if (position) cloneElement.style.setProperty('position', position, 'important');
        if (top) cloneElement.style.setProperty('top', top, 'important');
        if (left) cloneElement.style.setProperty('left', left, 'important');
        // Note: transform is removed later for export, but preserve it here initially
      }
    })

    // CRITICAL FIX: Ensure background-image is explicitly set from ORIGINAL element's inline style
    // Background patterns are set via applyBackgroundPattern() which uses setProperty (inline style)
    // We need to preserve this inline style, not rely on computed style
    const originalInlineBgImage = canvasWrapper.style.backgroundImage;
    if (originalInlineBgImage && originalInlineBgImage !== 'none') {
      // Use the inline style value directly (this is what applyBackgroundPattern set)
      exportClone.style.setProperty('background-image', originalInlineBgImage, 'important');
    } else {
      // Fallback to computed if inline not available
      const computedBgImage = computedStyle.backgroundImage;
      if (computedBgImage && computedBgImage !== 'none') {
        let bgImageValue = computedBgImage;
        if (bgImageValue.includes('data:image')) {
          bgImageValue = bgImageValue.replace(/url\(['"]?(data:image\/[^'"]+)['"]?\)/g, 'url("$1")');
        }
        exportClone.style.setProperty('background-image', bgImageValue, 'important');
      }
    }

    // Also ensure background-size and background-repeat from inline styles
    const originalInlineBgSize = canvasWrapper.style.backgroundSize;
    const originalInlineBgRepeat = canvasWrapper.style.backgroundRepeat;
    const originalInlineBgPosition = canvasWrapper.style.backgroundPosition;

    if (originalInlineBgSize && originalInlineBgSize !== 'auto') {
      exportClone.style.setProperty('background-size', originalInlineBgSize, 'important');
    }
    if (originalInlineBgRepeat) {
      exportClone.style.setProperty('background-repeat', originalInlineBgRepeat, 'important');
    }
    if (originalInlineBgPosition) {
      exportClone.style.setProperty('background-position', originalInlineBgPosition, 'important');
    }

    // CRITICAL: Set dimensions on clone for export (use imageType dimensions)
    exportClone.style.setProperty('width', originalWidth, 'important');
    exportClone.style.setProperty('height', originalHeight, 'important');
    exportClone.style.setProperty('box-sizing', 'content-box', 'important');
    exportClone.style.setProperty('flex-shrink', '0', 'important');
    exportClone.style.setProperty('flex-grow', '0', 'important');
    exportClone.style.setProperty('overflow', 'visible', 'important');
    exportClone.style.setProperty('max-width', 'none', 'important');
    exportClone.style.setProperty('max-height', 'none', 'important');
    exportClone.style.setProperty('min-width', originalWidth, 'important');
    exportClone.style.setProperty('min-height', originalHeight, 'important');

    // Remove any transforms on clone (html-to-image uses pixelRatio)
    exportClone.style.setProperty('transform', 'none', 'important');
    exportClone.style.setProperty('transform-origin', 'unset', 'important');

    // CRITICAL FIX: Append clone to body (off-screen, invisible to user)
    // Ensure clone is in the same document so all stylesheets are available
    // This is essential for html-to-image to capture CSS correctly
    document.body.appendChild(exportClone);
    
    // Force a layout recalculation to ensure all styles are applied
    // This helps html-to-image capture the element correctly
    void exportClone.offsetHeight;
    void exportClone.offsetWidth;

    // Use clone for all export operations - original preview element remains untouched
    const elementToCapture = exportClone;

    // Find masked logo containers in the CLONE and convert them to regular img elements for export
    // html-to-image doesn't reliably capture CSS mask-image, so we replace them temporarily
    const logoContainers = elementToCapture.querySelectorAll('.logo-masked');
    const replacements = [];

    for (const container of logoContainers) {
      const convertedImg = await convertMaskedLogoToImage(container);
      if (convertedImg) {
        // Store original container
        replacements.push({ original: container });

        // Create replacement img element with same positioning
        const img = document.createElement('img');
        img.src = convertedImg.src;
        img.style.cssText = container.style.cssText;
        img.style.maskImage = 'none';
        img.style.webkitMaskImage = 'none';
        img.style.backgroundColor = 'transparent';

        // Replace container with img
        container.parentNode.insertBefore(img, container);
        container.style.display = 'none';
        replacements[replacements.length - 1].replacement = img;
      }
    }

    // Pre-process canvas-based backgrounds (like grid patterns with data URLs)
    // html-to-image needs data URLs to be properly formatted and pre-loaded
    // Get the computed background-image from the clone (should already have it from style copying)
    const cloneComputedBg = window.getComputedStyle(elementToCapture).backgroundImage;
    const bgImageToUse = cloneComputedBg && cloneComputedBg !== 'none' ? cloneComputedBg : backgroundImage;

    if (bgImageToUse && bgImageToUse !== 'none' && bgImageToUse.includes('data:image')) {
      // Extract all data URLs from background-image (might be multiple layers)
      const dataUrlMatches = bgImageToUse.match(/url\(['"]?(data:image\/[^'"]+)['"]?\)/g);
      if (dataUrlMatches && dataUrlMatches.length > 0) {
        // Pre-load all data URL images to ensure they're ready
        const imagePromises = dataUrlMatches.map(match => {
          const dataUrl = match.replace(/url\(['"]?/, '').replace(/['"]?\)/, '');
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(dataUrl);
            img.onerror = () => resolve(dataUrl); // Continue even if load fails
            img.src = dataUrl;
          });
        });
        await Promise.all(imagePromises);

        // CRITICAL: Ensure data URLs are properly quoted for html-to-image
        // html-to-image prefers double quotes around data URLs
        let formattedBgImage = bgImageToUse;
        formattedBgImage = formattedBgImage.replace(/url\(['"]?(data:image\/[^'"]+)['"]?\)/g, 'url("$1")');

        // Explicitly set background-image on clone with properly formatted data URLs
        elementToCapture.style.setProperty('background-image', formattedBgImage, 'important');
      }
    }

    // Double-check that background-image is set on the clone (especially for data URLs)
    // This ensures grid patterns and other canvas-based patterns are exported correctly
    const finalComputedBg = window.getComputedStyle(elementToCapture).backgroundImage;
    if (finalComputedBg && finalComputedBg !== 'none') {
      // Ensure it's properly formatted
      let finalBgImage = finalComputedBg;
      if (finalBgImage.includes('data:image')) {
        finalBgImage = finalBgImage.replace(/url\(['"]?(data:image\/[^'"]+)['"]?\)/g, 'url("$1")');
        elementToCapture.style.setProperty('background-image', finalBgImage, 'important');
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
      const layers = bgSize.split(',').map(layer => layer.trim());
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

    // Store background properties for onclone callback
    // Ensure background-size covers the full canvas if it's a pattern
    let backgroundSize = originalBackgroundSize;
    // Detect patterns more accurately - check for gradients, repeating patterns, or small background images
    const hasPattern = backgroundImage && backgroundImage !== 'none' &&
                      (backgroundImage.includes('gradient') ||
                       backgroundImage.includes('repeating-') ||
                       backgroundImage.includes('data:image') ||
                       (originalBackgroundRepeat && originalBackgroundRepeat !== 'no-repeat'));

    // Handle different background-size formats for patterns
    if (hasPattern && backgroundSize && backgroundSize !== 'auto' && backgroundSize !== 'cover' && backgroundSize !== 'contain') {
      // Check for percentage-based sizes (including comma-separated)
      if (backgroundSize.includes('%')) {
        // Convert all percentages to pixels for the target canvas size
        backgroundSize = convertBackgroundSizeToPixels(backgroundSize, imageType.width, imageType.height);
      }
      // Check for pixel-based sizes
      else {
        // Check if we have comma-separated values (multiple layers)
        if (backgroundSize.includes(',')) {
          // For comma-separated pixel values, check each layer
          const layers = backgroundSize.split(',').map(l => l.trim());
          const maxSize = Math.max(imageType.width, imageType.height);
          const hasSmallPattern = layers.some(layer => {
            const sizeMatch = layer.match(/(\d+(?:\.\d+)?)px/g);
            if (sizeMatch) {
              const patternSize = Math.max(...sizeMatch.map(s => parseFloat(s)));
              return patternSize < maxSize * 0.1;
            }
            return false;
          });

          if (hasSmallPattern && (!originalBackgroundRepeat || originalBackgroundRepeat === 'no-repeat')) {
            canvasWrapper.style.setProperty('background-repeat', 'repeat', 'important');
          }
          // Keep original sizes for repeating patterns
        } else {
          // Single value - check if it's a small repeating pattern
          const sizeMatch = backgroundSize.match(/(\d+(?:\.\d+)?)px/g);
          if (sizeMatch) {
            const maxSize = Math.max(imageType.width, imageType.height);
            const patternSize = Math.max(...sizeMatch.map(s => parseFloat(s)));
            if (patternSize < maxSize * 0.1) {
              // Small repeating pattern - ensure it repeats
              if (!originalBackgroundRepeat || originalBackgroundRepeat === 'no-repeat') {
                canvasWrapper.style.setProperty('background-repeat', 'repeat', 'important');
              }
              // Keep original size for repeating patterns
            } else {
              // Large pattern - ensure it covers the canvas
              backgroundSize = `${imageType.width}px ${imageType.height}px`;
            }
          } else {
            // Unknown format - default to full canvas size
            backgroundSize = `${imageType.width}px ${imageType.height}px`;
          }
        }
      }
    } else if (hasPattern && (!backgroundSize || backgroundSize === 'auto')) {
      // No size specified - default to full canvas
      backgroundSize = `${imageType.width}px ${imageType.height}px`;
    }

    const backgroundProps = {
      backgroundImage: backgroundImage,
      backgroundSize: backgroundSize,
      backgroundPosition: computedStyle.backgroundPosition || '0 0',
      backgroundRepeat: originalBackgroundRepeat || 'repeat',
      backgroundColor: computedStyle.backgroundColor,
      background: computedStyle.background,
      mixBlendMode: computedStyle.mixBlendMode,
    };

    // PHASE 2: mix-blend-mode is now supported by html-to-image (native rendering)
    // No special handling needed - html-to-image will render it correctly
    const mixBlendMode = computedStyle.mixBlendMode;
    if (mixBlendMode && mixBlendMode !== 'normal') {
      // Store original for restoration (if needed)
      originalStyles.mixBlendMode = canvasWrapper.style.mixBlendMode;
      // Note: html-to-image supports mix-blend-mode via native browser rendering
    }

    // Wait for all background images to load (especially data URLs and external images)
    const bgImageUrls = [];
    if (backgroundProps.backgroundImage && backgroundProps.backgroundImage !== 'none') {
      // Extract all URLs from background-image (supports multiple layers)
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

    // Pre-load all external background images
    if (bgImageUrls.length > 0) {
      await Promise.all(bgImageUrls.map(url => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = resolve;
          img.onerror = resolve; // Continue even if load fails
          img.src = url;
        });
      }));
    }

    // CRITICAL FIX: Wait for fonts to load before export
    // html-to-image may not capture fonts loaded via <link> tags correctly
    // This ensures Google Fonts (Orbitron, Rajdhani) are fully loaded
    try {
      if (document.fonts && typeof document.fonts.ready !== 'undefined') {
        // Wait for all fonts to be loaded (with timeout)
        await Promise.race([
          document.fonts.ready,
          new Promise(resolve => setTimeout(resolve, 3000)) // 3 second timeout
        ]);
      }
    } catch (error) {
      console.warn('Font loading wait failed, continuing with export:', error);
      // Continue with export even if font loading check fails
    }

    // PHASE 2 - Stage 2: Synchronization Assurance
    // Use double requestAnimationFrame to ensure browser commits transform before capture
    // This is more reliable than setTimeout for ensuring the transformation is painted
    const htmlToImage = await loadHtmlToImage();

    // Ensure clone is fully visible and ready for capture
    // Double-check that opacity and visibility are set correctly
    elementToCapture.style.setProperty('opacity', '1', 'important');
    elementToCapture.style.setProperty('visibility', 'visible', 'important');

    // PHASE 2: html-to-image uses native browser rendering via SVG foreignObject
    // This provides better CSS fidelity and eliminates many html2canvas workarounds
    // Synchronize and capture using double RAF for browser commit
    const canvas = await new Promise((resolve, reject) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          // Triple-check visibility before capture (on clone)
          elementToCapture.style.setProperty('opacity', '1', 'important');
          elementToCapture.style.setProperty('visibility', 'visible', 'important');

          // PHASE 2 - Stage 3: html-to-image Execution
          // CRITICAL: Set pixelRatio to scale - html-to-image uses pixelRatio for high-res capture
          // CSS transform already scales the element visually, but html-to-image needs pixelRatio
          // The width/height parameters should match the FINAL scaled dimensions
          const scaledWidth = originalWidthValue * scale;
          const scaledHeight = originalHeightValue * scale;

          // PHASE 2: html-to-image options (different from html2canvas)
          // html-to-image uses pixelRatio for scaling and has simpler options
          const options = {
            pixelRatio: scale, // High-resolution scaling (1, 2, 3, or 4)
            backgroundColor: null, // Transparent background
            cacheBust: false, // Don't cache bust (we've already pre-loaded images)
            useCORS: true, // Allow cross-origin images
            quality: 1.0, // Maximum quality (for JPEG, not used for PNG)
            width: originalWidthValue, // Base width (pixelRatio scales it)
            height: originalHeightValue, // Base height (pixelRatio scales it)
            // Filter function to exclude non-visual elements
            filter: (node) => {
              // Skip script tags and other non-visual elements
              if (node.tagName === 'SCRIPT' || node.tagName === 'NOSCRIPT') {
                return false;
              }
              return true;
            },
          };

          // Apply background properties to the CLONE before capture
          // html-to-image captures the element as-is, so we need to ensure styles are correct
          const computedBackground = window.getComputedStyle(elementToCapture).background;
          const computedBackgroundImage = window.getComputedStyle(elementToCapture).backgroundImage;
          const computedBackgroundSize = window.getComputedStyle(elementToCapture).backgroundSize;
          const computedBackgroundRepeat = window.getComputedStyle(elementToCapture).backgroundRepeat;
          const computedBackgroundPosition = window.getComputedStyle(elementToCapture).backgroundPosition;

          // Temporarily apply computed styles to ensure capture (on clone)
          const originalBgImage = elementToCapture.style.backgroundImage;
          const originalBgSize = elementToCapture.style.backgroundSize;
          const originalBgRepeat = elementToCapture.style.backgroundRepeat;
          const originalBgPosition = elementToCapture.style.backgroundPosition;

          if (computedBackgroundImage && computedBackgroundImage !== 'none') {
            elementToCapture.style.setProperty('background-image', computedBackgroundImage, 'important');
          }
          if (computedBackgroundSize && computedBackgroundSize !== 'auto') {
            elementToCapture.style.setProperty('background-size', computedBackgroundSize, 'important');
          }
          if (computedBackgroundRepeat) {
            elementToCapture.style.setProperty('background-repeat', computedBackgroundRepeat, 'important');
          }
          if (computedBackgroundPosition) {
            elementToCapture.style.setProperty('background-position', computedBackgroundPosition, 'important');
          }

          // PHASE 2: Use html-to-image's toCanvas for better control
          // Verify htmlToImage and toCanvas are available
          if (!htmlToImage) {
            reject(new Error('html-to-image library not loaded'));
            return;
          }

          if (typeof htmlToImage.toCanvas !== 'function') {
            console.error('htmlToImage object:', htmlToImage);
            console.error('Available methods:', Object.keys(htmlToImage));
            reject(new Error('html-to-image toCanvas function not available. Available methods: ' + Object.keys(htmlToImage).join(', ')));
            return;
          }

          // Add a small delay to ensure browser has painted the clone with all styles
          // This is critical for html-to-image to capture the element correctly
          setTimeout(async () => {
            // CRITICAL FIX: Ensure fonts are embedded in the export
            // html-to-image needs fonts to be available, especially for Google Fonts
            // Use getFontEmbedCSS if available to ensure fonts are included
            let fontEmbedCSS = null;
            if (htmlToImage.getFontEmbedCSS && typeof htmlToImage.getFontEmbedCSS === 'function') {
              try {
                fontEmbedCSS = await htmlToImage.getFontEmbedCSS(elementToCapture);
                // Add fontEmbedCSS to options if available
                if (fontEmbedCSS) {
                  options.fontEmbedCSS = fontEmbedCSS;
                }
              } catch (e) {
                console.warn('Failed to get font embed CSS, continuing without it:', e);
              }
            }
            
            htmlToImage.toCanvas(elementToCapture, options)
              .then((canvas) => {
                // Restore original background styles on clone (for cleanup)
                elementToCapture.style.backgroundImage = originalBgImage;
                elementToCapture.style.backgroundSize = originalBgSize;
                elementToCapture.style.backgroundRepeat = originalBgRepeat;
                elementToCapture.style.backgroundPosition = originalBgPosition;

                resolve(canvas);
              })
              .catch((error) => {
                // Restore original background styles on clone (for cleanup)
                elementToCapture.style.backgroundImage = originalBgImage;
                elementToCapture.style.backgroundSize = originalBgSize;
                elementToCapture.style.backgroundRepeat = originalBgRepeat;
                elementToCapture.style.backgroundPosition = originalBgPosition;

                console.error('html-to-image toCanvas error:', error);
                reject(error);
              });
          }, 50); // Small delay to ensure browser has painted

          // Legacy html2canvas onclone callback (not used in html-to-image, but kept for reference)
          /* onclone: (clonedDoc, clonedWindow) => {
        // Find the cloned canvas wrapper
        const clonedWrapper = clonedDoc.getElementById('canvasWrapper');
        if (clonedWrapper && backgroundProps) {
          // PHASE 1: In the cloned document, set dimensions to original 1x size
          // html2canvas will use its internal scale parameter to capture at high resolution
          // The original element keeps CSS transform for zero CLS, but clone uses 1x dimensions
          // CRITICAL: Set dimensions FIRST before any background properties
          clonedWrapper.style.setProperty('width', `${originalWidthValue}px`, 'important');
          clonedWrapper.style.setProperty('height', `${originalHeightValue}px`, 'important');
          clonedWrapper.style.setProperty('position', 'relative', 'important');
          clonedWrapper.style.setProperty('transform', 'none', 'important');

          // CRITICAL: Copy ALL computed styles from original to ensure fidelity
          // This includes filters, backdrop-filter, and other CSS properties html2canvas might miss
          const allComputedStyles = window.getComputedStyle(canvasWrapper);
          const importantStyles = [
            'filter', 'backdrop-filter', 'opacity', 'mix-blend-mode',
            'box-shadow', 'border-radius', 'border', 'outline'
          ];
          importantStyles.forEach(prop => {
            const value = allComputedStyles.getPropertyValue(prop);
            if (value && value !== 'none' && value !== 'normal') {
              clonedWrapper.style.setProperty(prop, value, 'important');
            }
          });
          clonedWrapper.style.setProperty('box-sizing', 'content-box', 'important');
          clonedWrapper.style.setProperty('margin', '0', 'important');
          clonedWrapper.style.setProperty('padding', '0', 'important');

          // Force background to be visible and properly set
          clonedWrapper.style.setProperty('background-attachment', 'scroll', 'important');
          clonedWrapper.style.setProperty('background-clip', 'border-box', 'important');
          clonedWrapper.style.setProperty('background-origin', 'padding-box', 'important');

          // Copy all background properties from stored values
          // CRITICAL: html2canvas needs the exact computed background to capture multi-layer patterns
          // Get the computed background which includes all layers properly formatted
          const computedBackground = window.getComputedStyle(canvasWrapper).background;
          const computedBackgroundImage = window.getComputedStyle(canvasWrapper).backgroundImage;

          // Use computed background if available (includes all layers)
          if (computedBackground && computedBackground !== 'none' && computedBackground !== 'rgba(0, 0, 0, 0) none') {
            clonedWrapper.style.setProperty('background', computedBackground, 'important');
          } else if (backgroundProps.backgroundImage && backgroundProps.backgroundImage !== 'none') {
            // Fallback to stored background-image
            clonedWrapper.style.setProperty('background-image', backgroundProps.backgroundImage, 'important');
          }

          // Also set background-image separately to ensure it's captured
          if (computedBackgroundImage && computedBackgroundImage !== 'none') {
            clonedWrapper.style.setProperty('background-image', computedBackgroundImage, 'important');
          } else if (backgroundProps.backgroundImage && backgroundProps.backgroundImage !== 'none') {
            clonedWrapper.style.setProperty('background-image', backgroundProps.backgroundImage, 'important');
          }

          // CRITICAL: Remove filter (blur) from clone - html2canvas doesn't support it
          // Pattern blur will not be captured (html2canvas limitation)
          clonedWrapper.style.setProperty('filter', 'none', 'important');

          // CRITICAL: Get computed background properties to ensure all layers are captured correctly
          // html2canvas needs the exact computed properties for multi-layer patterns
          const computedBackgroundSize = window.getComputedStyle(canvasWrapper).backgroundSize;
          const computedBackgroundRepeat = window.getComputedStyle(canvasWrapper).backgroundRepeat;
          const computedBackgroundPosition = window.getComputedStyle(canvasWrapper).backgroundPosition;

          // Check if this is a pattern with multiple layers
          const isPattern = computedBackgroundImage &&
                          (computedBackgroundImage.includes('gradient') ||
                           computedBackgroundImage.includes('repeating-'));
          const hasMultipleLayers = computedBackgroundImage && computedBackgroundImage.split(',').length > 1;

          // Use computed background-size (handles all layers correctly)
          if (computedBackgroundSize && computedBackgroundSize !== 'auto') {
            clonedWrapper.style.setProperty('background-size', computedBackgroundSize, 'important');
          } else if (backgroundProps.backgroundSize && backgroundProps.backgroundSize !== 'auto') {
            clonedWrapper.style.setProperty('background-size', backgroundProps.backgroundSize, 'important');
          } else if (isPattern) {
            // For patterns without explicit size, ensure they cover the canvas
            if (hasMultipleLayers) {
              // For multi-layer patterns, we need to set size for each layer
              // Count layers and create matching sizes
              const layerCount = computedBackgroundImage.split(',').length;
              const sizes = Array(layerCount).fill(`${originalWidthValue}px ${originalHeightValue}px`).join(', ');
              clonedWrapper.style.setProperty('background-size', sizes, 'important');
            } else {
              clonedWrapper.style.setProperty('background-size', `${originalWidthValue}px ${originalHeightValue}px`, 'important');
            }
          }

          // Use computed background-repeat
          // For multi-layer patterns, ensure repeat is set for all layers
          if (computedBackgroundRepeat && computedBackgroundRepeat !== 'no-repeat') {
            if (hasMultipleLayers && !computedBackgroundRepeat.includes(',')) {
              // If multiple layers but single repeat value, duplicate for all layers
              const layerCount = computedBackgroundImage.split(',').length;
              const repeats = Array(layerCount).fill(computedBackgroundRepeat).join(', ');
              clonedWrapper.style.setProperty('background-repeat', repeats, 'important');
            } else {
              clonedWrapper.style.setProperty('background-repeat', computedBackgroundRepeat, 'important');
            }
          } else if (backgroundProps.backgroundRepeat && backgroundProps.backgroundRepeat !== 'no-repeat') {
            if (hasMultipleLayers && !backgroundProps.backgroundRepeat.includes(',')) {
              const layerCount = computedBackgroundImage.split(',').length;
              const repeats = Array(layerCount).fill(backgroundProps.backgroundRepeat).join(', ');
              clonedWrapper.style.setProperty('background-repeat', repeats, 'important');
            } else {
              clonedWrapper.style.setProperty('background-repeat', backgroundProps.backgroundRepeat, 'important');
            }
          } else if (isPattern) {
            // Default to repeat for patterns
            if (hasMultipleLayers) {
              const layerCount = computedBackgroundImage.split(',').length;
              const repeats = Array(layerCount).fill('repeat').join(', ');
              clonedWrapper.style.setProperty('background-repeat', repeats, 'important');
            } else {
              clonedWrapper.style.setProperty('background-repeat', 'repeat', 'important');
            }
          }

          // Use computed background-position
          if (computedBackgroundPosition) {
            clonedWrapper.style.setProperty('background-position', computedBackgroundPosition, 'important');
          } else if (backgroundProps.backgroundPosition) {
            clonedWrapper.style.setProperty('background-position', backgroundProps.backgroundPosition, 'important');
          } else if (hasMultipleLayers) {
            // For multi-layer patterns, set position for each layer
            const layerCount = computedBackgroundImage.split(',').length;
            const positions = Array(layerCount).fill('0 0').join(', ');
            clonedWrapper.style.setProperty('background-position', positions, 'important');
          }

          if (backgroundProps.backgroundPosition) {
            clonedWrapper.style.setProperty('background-position', backgroundProps.backgroundPosition, 'important');
          } else {
            clonedWrapper.style.setProperty('background-position', '0 0', 'important');
          }
          if (backgroundProps.backgroundRepeat) {
            clonedWrapper.style.setProperty('background-repeat', backgroundProps.backgroundRepeat, 'important');
          } else {
            clonedWrapper.style.setProperty('background-repeat', 'repeat', 'important');
          }
          if (backgroundProps.backgroundColor && backgroundProps.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            clonedWrapper.style.setProperty('background-color', backgroundProps.backgroundColor, 'important');
          }

          // For data URLs, ensure they're properly formatted
          if (backgroundProps.backgroundImage && backgroundProps.backgroundImage.includes('data:image')) {
            // Ensure data URLs are properly quoted
            const fixedBgImage = backgroundProps.backgroundImage.replace(
              /url\(['"]?(data:image\/[^'"]+)['"]?\)/g,
              (match, dataUrl) => `url("${dataUrl}")`
            );
            clonedWrapper.style.setProperty('background-image', fixedBgImage, 'important');
          }

          // Note: mix-blend-mode is supported by html-to-image (native rendering)
          // The background will render correctly with blend mode
        }
      }, */
        });
      });
    });

    // Clean up: Remove temporary logo replacements from clone
    for (const { original, replacement } of replacements) {
      if (replacement && replacement.parentNode) {
        replacement.remove();
      }
      if (original && original.parentNode) {
        original.style.display = '';
      }
    }

    // Remove the export clone from DOM (original preview element was never modified)
    if (exportClone && exportClone.parentNode) {
      exportClone.remove();
    }

    // html-to-image already captures at the correct scaled resolution via pixelRatio
    // The canvas returned is already at the target resolution (originalWidthValue * scale)
    // Calculate final dimensions for dithering function
    const finalWidth = originalWidthValue * scale;
    const finalHeight = originalHeightValue * scale;

    // PHASE 1: Apply high-resolution export with dithering to eliminate banding
    // Use 'random' dithering for fast, effective banding removal
    // The canvas is already at the target resolution via pixelRatio, so we just apply dithering
    const blob = await exportHighResCanvas({
      sourceCanvas: canvas,
      width: finalWidth,
      height: finalHeight,
      scale: 1.0, // No additional scaling - canvas is already at target resolution
      dither: 'random', // Use random dithering for smooth gradients
      noiseAmount: 4, // Subtle noise to break up banding without being visible
      format: 'image/png',
      quality: 1.0,
    });

    const filename = imageType === IMAGE_TYPES.OG ? 'og-image.png' : 'twitter-card.png';
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();

    // Clean up object URL after a short delay
    setTimeout(() => URL.revokeObjectURL(link.href), 100);

    exportBtn.textContent = 'Export as PNG';
    exportBtn.disabled = false;

    // PHASE 1 Testing: Stop CLS monitoring and report results
    if (clsMonitor && clsMonitor.stopExportMonitoring) {
      clsMonitor.stopExportMonitoring();
    }

    // Show toast with usage instructions
    const imageTypeName = imageType === IMAGE_TYPES.OG ? 'OG Image' : 'Twitter Card';
    const instructions = `
      <strong>${imageTypeName} exported successfully!</strong><br><br>
      <strong>Usage:</strong><br>
      • Save to your project's root directory<br>
      • Use in meta tags: &lt;meta property="og:image" content="/${filename}" /&gt;<br>
      • Recommended size: ${imageType.width}×${imageType.height}px<br>
      • File: ${filename}
    `;
    showToast(instructions, 'success', 8000);
  } catch (error) {
    console.error('Export error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      htmlToImageAvailable: !!window.htmlToImage,
      htmlToImageKeys: window.htmlToImage ? Object.keys(window.htmlToImage) : null,
    });

    // Restore logo containers in case of error
    const logoContainers = canvasWrapper.querySelectorAll('.logo-masked');
    for (const container of logoContainers) {
      container.style.display = '';
      const replacement = container.previousSibling;
      if (replacement && replacement.tagName === 'IMG' && replacement.src.includes('data:image')) {
        replacement.remove();
      }
    }

    // Clean up clone in case of error
    const exportClone = document.getElementById('canvasWrapperExportClone');
    if (exportClone && exportClone.parentNode) {
      // Remove temporary logo replacements
      const logoContainers = exportClone.querySelectorAll('.logo-masked');
      for (const container of logoContainers) {
        container.style.display = '';
        const replacement = container.previousSibling;
        if (replacement && replacement.tagName === 'IMG' && replacement.src.includes('data:image')) {
          replacement.remove();
        }
      }
      // Remove the clone
      exportClone.remove();
    }

    const errorMessage = error.message || 'Unknown error occurred';
    showToast(`Export failed: ${errorMessage}`, 'error', 10000);
    exportBtn.textContent = 'Export as PNG';
    exportBtn.disabled = false;
  }
}


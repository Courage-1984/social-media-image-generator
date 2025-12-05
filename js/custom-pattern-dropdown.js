/**
 * Custom Pattern Dropdown Module
 * Creates a custom dropdown with hover previews for pattern options
 */

import { backgroundPatterns } from './background-patterns.js';
import { getSelectedColor } from './color-picker.js';
import { showPatternPreview, hidePatternPreview } from './pattern-preview-tooltip.js';

let customDropdown = null;
let isOpen = false;
let menuResizeHandler = null;

/**
 * Create custom dropdown element
 * @param {HTMLElement} selectElement - The native select element
 */
export function createCustomPatternDropdown(selectElement) {
  if (!selectElement) return;

  // Check if custom dropdown already exists
  if (document.querySelector('.custom-pattern-dropdown-wrapper')) {
    return; // Already initialized
  }

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'custom-pattern-dropdown-wrapper';
  wrapper.style.cssText = 'position: relative; width: 100%;';

  // Create custom button (displays current selection)
  const button = document.createElement('button');
  button.className = 'custom-pattern-dropdown-button';
  button.type = 'button';
  button.style.cssText = `
    width: 100%;
    padding: 0.75rem;
    background: #0a0a0a;
    border: 1px solid rgba(0, 255, 255, 0.3);
    color: #ffffff;
    font-family: 'Rajdhani', sans-serif;
    border-radius: 4px;
    cursor: pointer;
    text-align: left;
    position: relative;
  `;
  button.innerHTML = `
    <span class="dropdown-text">None (Use Preset Background)</span>
    <span class="dropdown-arrow">⯆</span>
  `;

  // Create dropdown menu
  const menu = document.createElement('div');
  menu.className = 'custom-pattern-dropdown-menu';

  // Function to calculate and set menu height and position based on viewport
  function updateMenuHeight() {
    if (!isOpen || !menu) return;

    const buttonRect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - buttonRect.bottom - 8; // 8px for margin-top (4px) + some padding

    // Add margin beneath the list for negative space
    const marginBottom = 16; // 16px margin beneath the list
    const maxHeight = Math.max(150, spaceBelow - marginBottom);
    menu.style.maxHeight = `${maxHeight}px`;

    // Use fixed positioning to escape column constraints and use viewport space
    // Calculate position relative to viewport
    menu.style.position = 'fixed';
    menu.style.top = `${buttonRect.bottom + 4}px`; // 4px margin-top
    menu.style.left = `${buttonRect.left}px`;
    menu.style.width = `${buttonRect.width}px`; // Match button width exactly
    menu.style.right = 'auto';
    menu.style.marginBottom = `${marginBottom}px`; // Add margin beneath the list
  }

  // Function to hide/show controls below the dropdown
  function toggleControlsBelowDropdown(hide) {
    // Find the control-group that contains the dropdown
    const controlGroup = wrapper.closest('.control-group');
    if (!controlGroup || !controlGroup.parentElement) return;

    // Get all siblings after the control-group
    const parent = controlGroup.parentElement;
    const children = Array.from(parent.children);
    const controlGroupIndex = children.indexOf(controlGroup);

    // Hide all elements after the control-group
    if (hide) {
      children.forEach((child, index) => {
        if (index > controlGroupIndex) {
          // Store original display value
          if (!child.dataset.originalDisplay) {
            child.dataset.originalDisplay = window.getComputedStyle(child).display;
          }
          child.style.display = 'none';
        }
      });
    } else {
      // Restore all elements after the control-group
      children.forEach((child, index) => {
        if (index > controlGroupIndex && child.dataset.originalDisplay) {
          child.style.display = child.dataset.originalDisplay;
          delete child.dataset.originalDisplay;
        }
      });
    }
  }

  menu.style.cssText = `
    position: fixed;
    background: #1a1a2e;
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 4px;
    overflow-y: auto;
    z-index: 10000;
    display: none;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  `;

  // Define pattern groups with hierarchy
  // Related patterns (max 2) are grouped as arrays
  const patternGroups = [
    {
      name: 'Basic Patterns',
      patterns: [
        ['dots', 'dots-large'], // Combined: Dots | Large Dots
        ['diagonal-lines', 'diagonal-lines-reverse'], // Combined: Diagonal Lines | Diagonal Lines (Reverse)
        'crosshatch'
      ]
    },
    {
      name: 'Geometric Patterns',
      patterns: [
        ['checkerboard', 'pixelated'], // Combined: Checkerboard | Pixelated
        'hexagon-grid',
        ['stripes-vertical', 'stripes-horizontal'] // Combined: Vertical Stripes | Horizontal Stripes
      ]
    },
    {
      name: 'Tech Patterns',
      patterns: [
        ['circuit-board', 'circuit-lines'], // Combined: Circuit Board | Circuit Lines
        ['neon-grid', 'tech-mesh'], // Combined: Neon Grid | Tech Mesh
        'scanlines'
      ]
    },
    {
      name: 'Organic Patterns',
      patterns: [
        ['circular-waves', 'ripples'], // Combined: Circular Waves | Ripples
        ['stars', 'quantum-dots'], // Combined: Stars | Quantum Dots
        'mesh-gradient'
      ]
    },
    {
      name: 'Effects',
      patterns: [
        ['noise', 'holographic'], // Combined: Noise | Holographic
        ['energy-field', 'wave-interference'] // Combined: Energy Field | Wave Interference
      ]
    },
    {
      name: 'Advanced',
      patterns: ['data-stream', 'matrix-rain', 'cyber-grid']
    }
  ];

  // Add "None" option
  const noneOption = createDropdownOption('', 'None (Use Preset Background)', selectElement);
  menu.appendChild(noneOption);

  // Add separator after "None"
  const separator = document.createElement('div');
  separator.className = 'custom-pattern-dropdown-separator';
  separator.style.cssText = `
    height: 1px;
    background: rgba(0, 255, 255, 0.2);
    margin: 0.5rem 0;
  `;
  menu.appendChild(separator);

  // Add pattern groups with headers
  patternGroups.forEach((group, groupIndex) => {
    // Add group header
    const groupHeader = document.createElement('div');
    groupHeader.className = 'custom-pattern-dropdown-group-header';
    groupHeader.textContent = group.name;
    groupHeader.style.cssText = `
      padding: 0.5rem 0.75rem;
      font-size: 0.7rem;
      font-weight: 600;
      color: rgba(0, 255, 255, 0.7);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: rgba(0, 255, 255, 0.05);
      border-bottom: 1px solid rgba(0, 255, 255, 0.1);
      margin-top: ${groupIndex > 0 ? '0.5rem' : '0'};
      user-select: none;
      pointer-events: none;
    `;
    menu.appendChild(groupHeader);

    // Add patterns in this group
    group.patterns.forEach((patternItem) => {
      // Check if it's an array (related patterns) or a single pattern
      if (Array.isArray(patternItem)) {
        // Create combined option for related patterns
        const combinedOption = createCombinedDropdownOption(patternItem, selectElement);
        menu.appendChild(combinedOption);
      } else if (backgroundPatterns[patternItem]) {
        // Single pattern option
        const option = createDropdownOption(patternItem, backgroundPatterns[patternItem].name, selectElement);
        menu.appendChild(option);
      }
    });
  });

  // Prevent page scroll when scrolling within dropdown menu
  let wheelHandler = null;
  let controlsColumnWheelHandler = null;
  let controlsColumnScrollHandler = null;

  function setupScrollPrevention() {
    if (wheelHandler) return; // Already set up

    wheelHandler = (e) => {
      if (!isOpen) return;

      // Use menu from closure (defined above)
      if (!menu) return;

      // Check if the event is within the dropdown menu
      const isWithinMenu = menu.contains(e.target) || e.target === menu;

      if (isWithinMenu) {
        const { scrollTop, scrollHeight, clientHeight } = menu;
        const isAtTop = scrollTop === 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1; // -1 for rounding

        // If scrolling up and at top, allow page scroll
        if (e.deltaY < 0 && isAtTop) {
          return; // Allow default (page scroll)
        }

        // If scrolling down and at bottom, allow page scroll
        if (e.deltaY > 0 && isAtBottom) {
          return; // Allow default (page scroll)
        }

        // Otherwise, prevent page scroll and manually scroll the dropdown
        e.preventDefault();
        e.stopPropagation();

        // Manually scroll the dropdown menu
        const scrollAmount = e.deltaY;
        menu.scrollTop += scrollAmount;
      }
    };

    // Handler for controls column scroll prevention
    controlsColumnWheelHandler = (e) => {
      if (!isOpen) return;

      if (!menu) return;

      const controlsColumn = e.currentTarget;

      // Check if the event is within the dropdown menu or its wrapper
      const dropdownWrapper = menu.closest('.custom-pattern-dropdown-wrapper');
      const isWithinDropdown = menu.contains(e.target) ||
                               e.target === menu ||
                               (dropdownWrapper && dropdownWrapper.contains(e.target));

      if (isWithinDropdown) {
        const { scrollTop, scrollHeight, clientHeight } = menu;
        const isAtTop = scrollTop === 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

        // Ensure scroll position is locked (should already be set when dropdown opened)
        if (!controlsColumn.dataset.lockedScrollTop) {
          controlsColumn.dataset.lockedScrollTop = controlsColumn.scrollTop;
        }
        // Ensure overflow is hidden (should already be set when dropdown opened)
        if (controlsColumn.style.overflowY !== 'hidden') {
          controlsColumn.style.overflowY = 'hidden';
        }

        // If at edges, allow column scroll
        if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
          // Restore overflow and clear lock when at edges
          controlsColumn.style.overflowY = '';
          delete controlsColumn.dataset.lockedScrollTop;
          return; // Allow default
        }

        // Otherwise, prevent column scroll and manually scroll the dropdown
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation(); // Prevent other handlers from running

        // Lock controls column scroll position
        const lockedScrollTop = parseFloat(controlsColumn.dataset.lockedScrollTop) || controlsColumn.scrollTop;
        controlsColumn.scrollTop = lockedScrollTop;

        // Manually scroll the dropdown menu
        const scrollAmount = e.deltaY;
        menu.scrollTop += scrollAmount;
      } else {
        // Event is NOT within dropdown - restore overflow if it was locked
        // This handles cases where user scrolls outside the dropdown area
        if (controlsColumn.dataset.lockedScrollTop) {
          controlsColumn.style.overflowY = '';
          delete controlsColumn.dataset.lockedScrollTop;
        }
      }
    };

    // Handler to prevent scroll event on controls column when dropdown is open
    controlsColumnScrollHandler = (e) => {
      if (!isOpen) return;

      const controlsColumn = e.currentTarget;

      // ALWAYS ensure overflow is hidden when dropdown is open
      // This prevents any scroll leakage
      if (controlsColumn.style.overflowY !== 'hidden') {
        controlsColumn.style.overflowY = 'hidden';
      }

      // Check if scroll is within dropdown area
      const dropdownWrapper = menu.closest('.custom-pattern-dropdown-wrapper');
      const isWithinDropdown = menu.contains(document.activeElement) ||
                               (dropdownWrapper && dropdownWrapper.contains(document.activeElement)) ||
                               menu.contains(e.target) ||
                               (dropdownWrapper && dropdownWrapper.contains(e.target));

      if (isWithinDropdown && controlsColumn.dataset.lockedScrollTop) {
        // If we have a locked scroll position, restore it immediately
        const lockedScrollTop = parseFloat(controlsColumn.dataset.lockedScrollTop);
        // Force scroll position back immediately
        if (controlsColumn.scrollTop !== lockedScrollTop) {
          controlsColumn.scrollTop = lockedScrollTop;
        }
      } else if (!isWithinDropdown) {
        // Scroll is outside dropdown - restore overflow
        if (controlsColumn.dataset.lockedScrollTop) {
          controlsColumn.style.overflowY = '';
          delete controlsColumn.dataset.lockedScrollTop;
        }
      }
    };

    // Use passive: false to allow preventDefault
    document.addEventListener('wheel', wheelHandler, { passive: false });

    // Also prevent scrolling on controls column - use capture phase to catch it early
    const controlsColumn = document.querySelector('.controls-column');
    if (controlsColumn) {
      // CRITICAL: Set overflow immediately when handlers are attached
      // This ensures no scroll events leak through before handlers can prevent them
      if (!controlsColumn.dataset.lockedScrollTop) {
        controlsColumn.dataset.lockedScrollTop = controlsColumn.scrollTop;
      }
      controlsColumn.style.overflowY = 'hidden';

      controlsColumn.addEventListener('wheel', controlsColumnWheelHandler, {
        passive: false,
        capture: true // Use capture phase to intercept before other handlers
      });

      // Also prevent scroll event to lock scroll position
      controlsColumn.addEventListener('scroll', controlsColumnScrollHandler, {
        passive: false,
        capture: true
      });

      // Periodic check to ensure overflow stays hidden (catches any edge cases)
      const overflowCheckInterval = setInterval(() => {
        if (!isOpen) {
          clearInterval(overflowCheckInterval);
          return;
        }
        if (controlsColumn.style.overflowY !== 'hidden' && controlsColumn.dataset.lockedScrollTop) {
          controlsColumn.style.overflowY = 'hidden';
        }
      }, 50);

      // Store interval ID so we can clear it when dropdown closes
      controlsColumn.dataset.overflowCheckInterval = overflowCheckInterval;
    }
  }

  function removeScrollPrevention() {
    if (wheelHandler) {
      document.removeEventListener('wheel', wheelHandler);
      wheelHandler = null;
    }

    const controlsColumn = document.querySelector('.controls-column');
    if (controlsColumn) {
      if (controlsColumnWheelHandler) {
        controlsColumn.removeEventListener('wheel', controlsColumnWheelHandler, { capture: true });
        controlsColumnWheelHandler = null;
      }
      if (controlsColumnScrollHandler) {
        controlsColumn.removeEventListener('scroll', controlsColumnScrollHandler, { capture: true });
        controlsColumnScrollHandler = null;
      }
      // Restore overflow and clear locked scroll position
      controlsColumn.style.overflowY = '';
      delete controlsColumn.dataset.lockedScrollTop;

      // Clear periodic overflow check interval
      if (controlsColumn.dataset.overflowCheckInterval) {
        clearInterval(parseInt(controlsColumn.dataset.overflowCheckInterval));
        delete controlsColumn.dataset.overflowCheckInterval;
      }
    }
  }

  // Toggle dropdown
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen = !isOpen;
    menu.style.display = isOpen ? 'block' : 'none';
    if (isOpen) {
      button.style.borderColor = 'rgba(0, 255, 255, 0.6)';
      button.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.3)';
      button.classList.add('active');

      // Hide all controls below the dropdown
      toggleControlsBelowDropdown(true);

      // Wait for layout to update after hiding controls, then calculate menu height
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Double RAF ensures layout has fully updated
          updateMenuHeight();
        });
      });

      // Update height on window resize
      menuResizeHandler = () => {
        if (isOpen) {
          updateMenuHeight();
        }
      };
      window.addEventListener('resize', menuResizeHandler);

      // IMMEDIATELY lock controls column scroll before setting up handlers
      // This prevents any scroll events from leaking through before handlers are attached
      const controlsColumn = document.querySelector('.controls-column');
      if (controlsColumn) {
        controlsColumn.dataset.lockedScrollTop = controlsColumn.scrollTop;
        controlsColumn.style.overflowY = 'hidden';
      }

      setupScrollPrevention();
    } else {
      button.style.borderColor = 'rgba(0, 255, 255, 0.3)';
      button.style.boxShadow = 'none';
      button.classList.remove('active');

      // Restore all controls below the dropdown
      toggleControlsBelowDropdown(false);

      removeScrollPrevention();

      // Remove resize handler
      if (menuResizeHandler) {
        window.removeEventListener('resize', menuResizeHandler);
        menuResizeHandler = null;
      }
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target) && isOpen) {
      isOpen = false;
      menu.style.display = 'none';
      button.classList.remove('active');
      button.style.borderColor = 'rgba(0, 255, 255, 0.3)';
      button.style.boxShadow = 'none';
      hidePatternPreview(true);

      // Restore all controls below the dropdown
      toggleControlsBelowDropdown(false);

      removeScrollPrevention();

      // Remove resize handler
      if (menuResizeHandler) {
        window.removeEventListener('resize', menuResizeHandler);
        menuResizeHandler = null;
      }
    }
  });

  // Update button text when select changes
  selectElement.addEventListener('change', () => {
    updateButtonText(button, selectElement);
  });

  // Replace select with custom dropdown
  // Hide the native select completely
  selectElement.style.cssText = `
    position: absolute !important;
    opacity: 0 !important;
    pointer-events: none !important;
    width: 1px !important;
    height: 1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
  `;

  // Insert custom dropdown wrapper
  selectElement.parentNode.insertBefore(wrapper, selectElement);
  wrapper.appendChild(button);
  wrapper.appendChild(menu);

  customDropdown = { wrapper, button, menu, selectElement };

  // Export the function so it can be called from outside
  customDropdown.toggleControlsBelowDropdown = toggleControlsBelowDropdown;

  // Store reference globally so it can be accessed from main.js
  window.customPatternDropdown = customDropdown;
}

/**
 * Create a combined dropdown option for related patterns (max 2)
 * @param {string[]} patternKeys - Array of pattern keys (max 2)
 * @param {HTMLElement} selectElement - The native select element
 * @returns {HTMLElement} Combined option element
 */
function createCombinedDropdownOption(patternKeys, selectElement) {
  if (!patternKeys || patternKeys.length === 0 || patternKeys.length > 2) {
    console.warn('createCombinedDropdownOption: Invalid patternKeys array');
    return null;
  }

  const option = document.createElement('div');
  option.className = 'custom-pattern-dropdown-option';
  option.style.cssText = `
    padding: 0.75rem;
    cursor: pointer;
    color: #ffffff;
    font-family: 'Rajdhani', sans-serif;
    border-bottom: 1px solid rgba(0, 255, 255, 0.1);
    transition: all 0.2s;
    position: relative;
  `;

  // Create text spans for each pattern, separated by " | "
  const patterns = patternKeys.map(key => ({
    key,
    name: backgroundPatterns[key] ? backgroundPatterns[key].name : key
  }));

  patterns.forEach((pattern, index) => {
    const span = document.createElement('span');
    span.className = 'pattern-text-segment';
    span.dataset.patternKey = pattern.key;
    span.textContent = pattern.name;
    span.style.cssText = `
      cursor: pointer;
      transition: color 0.2s;
    `;

    // Hover preview for this segment
    let previewTimeout = null;
    span.addEventListener('mouseenter', (e) => {
      e.stopPropagation();
      if (previewTimeout) {
        clearTimeout(previewTimeout);
        previewTimeout = null;
      }
      previewTimeout = setTimeout(() => {
        showPatternPreview(pattern.key, span);
      }, 100);
      span.style.color = '#00ffff';
    });

    span.addEventListener('mouseleave', () => {
      if (previewTimeout) {
        clearTimeout(previewTimeout);
        previewTimeout = null;
      }
      hidePatternPreview();
      span.style.color = '#ffffff';
    });

    option.appendChild(span);

    // Add separator " | " between patterns (not after the last one)
    if (index < patterns.length - 1) {
      const separator = document.createElement('span');
      separator.textContent = ' | ';
      separator.style.cssText = `
        color: rgba(0, 255, 255, 0.5);
        margin: 0 0.25rem;
        pointer-events: none;
      `;
      option.appendChild(separator);
    }
  });

  // Hover effect for entire option
  option.addEventListener('mouseenter', () => {
    option.style.background = 'rgba(0, 255, 255, 0.1)';
  });

  option.addEventListener('mouseleave', () => {
    option.style.background = '';
  });

  // Click handler - allow clicking on either pattern segment
  patterns.forEach((pattern) => {
    const span = option.querySelector(`span[data-pattern-key="${pattern.key}"]`);
    if (span) {
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        selectElement.value = pattern.key;
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        isOpen = false;
        customDropdown.menu.style.display = 'none';
        customDropdown.button.classList.remove('active');
        customDropdown.button.style.borderColor = 'rgba(0, 255, 255, 0.3)';
        customDropdown.button.style.boxShadow = 'none';
        hidePatternPreview(true);
        updateButtonText(customDropdown.button, selectElement);

        // Restore all controls below the dropdown
        toggleControlsBelowDropdown(false);

        // CRITICAL: Ensure scroll prevention is removed when pattern is selected
        removeScrollPrevention();

        if (menuResizeHandler) {
          window.removeEventListener('resize', menuResizeHandler);
          menuResizeHandler = null;
        }
      });
    }
  });

  // Also allow clicking anywhere on the option (outside spans) to select the first pattern
  option.addEventListener('click', (e) => {
    // If click was on a span, let the span handler take care of it
    if (e.target.classList.contains('pattern-text-segment')) {
      return;
    }
    // Otherwise, select the first pattern
    selectElement.value = patterns[0].key;
    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    isOpen = false;
    customDropdown.menu.style.display = 'none';
    customDropdown.button.style.borderColor = 'rgba(0, 255, 255, 0.3)';
    customDropdown.button.style.boxShadow = 'none';
    hidePatternPreview(true);
    updateButtonText(customDropdown.button, selectElement);

    // Restore all controls below the dropdown
    const controlGroup = customDropdown.wrapper.closest('.control-group');
    if (controlGroup && controlGroup.parentElement) {
      const parent = controlGroup.parentElement;
      const children = Array.from(parent.children);
      const controlGroupIndex = children.indexOf(controlGroup);
      children.forEach((child, index) => {
        if (index > controlGroupIndex && child.dataset.originalDisplay) {
          child.style.display = child.dataset.originalDisplay;
          delete child.dataset.originalDisplay;
        }
      });
    }

    removeScrollPrevention();

    if (menuResizeHandler) {
      window.removeEventListener('resize', menuResizeHandler);
      menuResizeHandler = null;
    }
  });

  return option;
}

/**
 * Create a dropdown option element
 * @param {string} value - Option value
 * @param {string} text - Option text
 * @param {HTMLElement} selectElement - The native select element
 * @returns {HTMLElement} Option element
 */
function createDropdownOption(value, text, selectElement) {
  const option = document.createElement('div');
  option.className = 'custom-pattern-dropdown-option';
  option.dataset.value = value;
  option.style.cssText = `
    padding: 0.75rem;
    cursor: pointer;
    color: #ffffff;
    font-family: 'Rajdhani', sans-serif;
    border-bottom: 1px solid rgba(0, 255, 255, 0.1);
    transition: all 0.2s;
  `;
  option.textContent = text;

  // Hover preview
  let previewTimeout = null;
  option.addEventListener('mouseenter', () => {
    // Clear any existing timeout
    if (previewTimeout) {
      clearTimeout(previewTimeout);
      previewTimeout = null;
    }

    if (value) {
      // Small delay to prevent flickering when moving between options
      previewTimeout = setTimeout(() => {
        showPatternPreview(value, option);
      }, 100);
    } else {
      hidePatternPreview(true);
    }
    option.style.background = 'rgba(0, 255, 255, 0.1)';
    option.style.color = '#00ffff';
  });

  option.addEventListener('mouseleave', () => {
    // Clear timeout if mouse leaves before preview shows
    if (previewTimeout) {
      clearTimeout(previewTimeout);
      previewTimeout = null;
    }

    option.style.background = '';
    option.style.color = '#ffffff';
    hidePatternPreview();
  });

  // Click to select
  option.addEventListener('click', () => {
    selectElement.value = value;
    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    isOpen = false;
    customDropdown.menu.style.display = 'none';
    customDropdown.button.style.borderColor = 'rgba(0, 255, 255, 0.3)';
    customDropdown.button.style.boxShadow = 'none';
    hidePatternPreview(true);
    updateButtonText(customDropdown.button, selectElement);

    // Restore all controls below the dropdown
    const controlGroup = customDropdown.wrapper.closest('.control-group');
    if (controlGroup && controlGroup.parentElement) {
      const parent = controlGroup.parentElement;
      const children = Array.from(parent.children);
      const controlGroupIndex = children.indexOf(controlGroup);
      children.forEach((child, index) => {
        if (index > controlGroupIndex && child.dataset.originalDisplay) {
          child.style.display = child.dataset.originalDisplay;
          delete child.dataset.originalDisplay;
        }
      });
    }

    removeScrollPrevention();

    // Remove resize handler
    if (menuResizeHandler) {
      window.removeEventListener('resize', menuResizeHandler);
      menuResizeHandler = null;
    }
  });

  return option;
}

/**
 * Update button text to match selected value
 * @param {HTMLElement} button - The button element
 * @param {HTMLElement} selectElement - The select element
 */
function updateButtonText(button, selectElement) {
  const selectedOption = selectElement.options[selectElement.selectedIndex];
  const text = selectedOption ? selectedOption.textContent : 'None (Use Preset Background)';
  button.querySelector('.dropdown-text').textContent = text;
}

/**
 * Initialize custom dropdown
 */
export function initCustomPatternDropdown() {
  const selectElement = document.getElementById('backgroundPattern');
  if (selectElement) {
    createCustomPatternDropdown(selectElement);
  }
}

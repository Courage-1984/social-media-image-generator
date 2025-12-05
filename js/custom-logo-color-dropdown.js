/**
 * Custom Logo Color Dropdown Module
 * Creates a custom color square dropdown for logo color selection
 */

import { colorPalette } from './config.js';

let customDropdown = null;
let isOpen = false;
let onSelectCallback = null;

/**
 * Create custom color dropdown element
 * @param {HTMLElement} selectElement - The native select element (hidden)
 * @param {Function} callback - Callback function when color is selected
 */
export function createCustomLogoColorDropdown(selectElement, callback) {
  if (!selectElement) return;

  onSelectCallback = callback;

  // Check if custom dropdown already exists
  const existingWrapper = selectElement.closest('.custom-logo-color-dropdown-wrapper') ||
                          document.querySelector('.custom-logo-color-dropdown-wrapper');
  if (existingWrapper && existingWrapper.querySelector('.custom-logo-color-dropdown-button')) {
    return; // Already initialized
  }

  // Use existing wrapper from HTML or create new one
  let wrapper = existingWrapper;
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'custom-logo-color-dropdown-wrapper';
    wrapper.style.cssText = 'position: relative; width: 100%;';
  }

  // Create custom button (displays current color square)
  const button = document.createElement('button');
  button.className = 'custom-logo-color-dropdown-button';
  button.type = 'button';
  button.style.cssText = `
    width: 100%;
    padding: 0.75rem;
    background: #0a0a0a;
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    height: 43.39px;
    box-sizing: border-box;
    gap: 0.5rem;
  `;

  const colorSquare = document.createElement('div');
  colorSquare.className = 'color-square';
  const defaultColor = colorPalette.cyan && colorPalette.cyan.hex ? colorPalette.cyan.hex : '#00ffff';
  colorSquare.style.cssText = `
    width: 1.5rem;
    height: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    background: ${defaultColor} !important;
    flex-shrink: 0;
    display: block;
  `;

  const arrow = document.createElement('span');
  arrow.className = 'dropdown-arrow';
  arrow.textContent = '⯆';
  // CSS handles all styling including color, transform, and transitions

  button.appendChild(colorSquare);
  button.appendChild(arrow);

  // Create dropdown menu
  const menu = document.createElement('div');
  menu.className = 'custom-logo-color-dropdown-menu';

  // Function to calculate and set menu height and position based on viewport
  function updateMenuHeight() {
    if (!isOpen || !menu) return;

    const buttonRect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - buttonRect.bottom - 8;

    const marginBottom = 16;
    const maxHeight = Math.max(150, spaceBelow - marginBottom);
    menu.style.maxHeight = `${maxHeight}px`;

    menu.style.position = 'fixed';
    menu.style.top = `${buttonRect.bottom + 4}px`;
    menu.style.left = `${buttonRect.left}px`;
    menu.style.width = `${buttonRect.width}px`;
    menu.style.right = 'auto';
    menu.style.marginBottom = `${marginBottom}px`;
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
    padding: 0.5rem;
    grid-template-columns: repeat(auto-fill, minmax(1.75rem, 1fr));
    gap: 0.4rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 255, 255, 0.3) #1a1a2e;
  `;

  // Append button and menu to wrapper
  wrapper.appendChild(button);
  wrapper.appendChild(menu);

  // If wrapper was newly created, insert it before select
  if (!existingWrapper && selectElement.parentNode) {
    selectElement.parentNode.insertBefore(wrapper, selectElement);
  }

  selectElement.style.cssText = 'opacity: 0; width: 1px; height: 1px; position: absolute; pointer-events: none;';

  customDropdown = { wrapper, button, menu, selectElement, colorSquare, updateMenuHeight };

  // Populate menu with color options
  updateMenu();

  // Event listeners
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (isOpen && !wrapper.contains(e.target)) {
      isOpen = false;
      menu.style.display = 'none';
      button.style.borderColor = 'rgba(0, 255, 255, 0.3)';
      button.style.boxShadow = 'none';
      button.classList.remove('active');
      if (updateMenuHeight) {
        window.removeEventListener('resize', updateMenuHeight);
      }
    }
  });

  // Update button color when select changes
  selectElement.addEventListener('change', () => {
    updateButtonColor();
    if (onSelectCallback) {
      const colorKey = selectElement.value;
      const colorObj = colorPalette[colorKey];
      const colorHex = colorObj && colorObj.hex ? colorObj.hex : (typeof colorObj === 'string' ? colorObj : null);
      if (colorHex) {
        onSelectCallback(colorKey, colorHex);
      }
    }
  });

  // Initial update
  updateButtonColor();

  // Set initial value if select has no value
  if (!selectElement.value && selectElement.options.length > 0) {
    selectElement.value = 'cyan';
    updateButtonColor();
    // Trigger callback to update state
    if (onSelectCallback) {
      const colorObj = colorPalette['cyan'];
      const colorHex = colorObj && colorObj.hex ? colorObj.hex : '#00ffff';
      onSelectCallback('cyan', colorHex);
    }
  } else if (!selectElement.value) {
    // If no value and no options, set default after a brief delay
    setTimeout(() => {
      if (selectElement.options.length > 0 && !selectElement.value) {
        selectElement.value = 'cyan';
        updateButtonColor();
        if (onSelectCallback) {
          const colorObj = colorPalette['cyan'];
          const colorHex = colorObj && colorObj.hex ? colorObj.hex : '#00ffff';
          onSelectCallback('cyan', colorHex);
        }
      }
    }, 100);
  }
}

/**
 * Toggle dropdown visibility
 * @param {boolean} force - Force open/close
 */
function toggleDropdown(force) {
  isOpen = force !== undefined ? force : !isOpen;
  const { button, menu, updateMenuHeight } = customDropdown;
  menu.style.display = isOpen ? 'grid' : 'none';
  button.classList.toggle('active', isOpen);

  if (isOpen) {
    menu.style.display = 'grid';
    button.style.borderColor = 'rgba(0, 255, 255, 0.6)';
    button.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.3)';
    // Wait for layout to update, then calculate menu height
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (updateMenuHeight) updateMenuHeight();
      });
    });
    if (updateMenuHeight) {
      window.addEventListener('resize', updateMenuHeight);
    }
  } else {
    menu.style.display = 'none';
    button.style.borderColor = 'rgba(0, 255, 255, 0.3)';
    button.style.boxShadow = 'none';
    if (updateMenuHeight) {
      window.removeEventListener('resize', updateMenuHeight);
    }
  }
}

/**
 * Update menu with color options
 */
function updateMenu() {
  if (!customDropdown) return;
  const { menu } = customDropdown;
  menu.innerHTML = ''; // Clear existing options

  Object.entries(colorPalette).forEach(([key, colorObj]) => {
    // Include all colors (including text-secondary and text-muted)
    // No filtering needed - all colors should be available for logo

    const colorHex = colorObj.hex || colorObj; // Support both object and string formats
    const colorValue = typeof colorHex === 'string' ? colorHex : colorObj;

    const item = document.createElement('div');
    item.className = 'custom-logo-color-dropdown-item';
    item.dataset.colorKey = key;
    item.dataset.colorValue = colorHex;
    item.title = colorObj.name || key.charAt(0).toUpperCase() + key.slice(1);
    item.style.cssText = `
      width: 1.75rem;
      height: 1.75rem;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      background: ${colorHex} !important;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    `;

    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const colorKey = item.dataset.colorKey;
      const colorValue = item.dataset.colorValue;

      // Update native select (if it exists)
      if (customDropdown.selectElement) {
        customDropdown.selectElement.value = colorKey;
        customDropdown.selectElement.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Update button color
      updateButtonColor(colorValue);

      toggleDropdown(false);

      if (onSelectCallback) {
        onSelectCallback(colorKey, colorValue);
      }
    });

    item.addEventListener('mouseenter', () => {
      item.style.transform = 'scale(1.1)';
      item.style.boxShadow = `0 0 10px ${colorHex}`;
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = 'scale(1)';
      item.style.boxShadow = 'none';
    });

    menu.appendChild(item);
  });
}

/**
 * Update button color square
 * @param {string} colorValue - Optional color value to set
 */
function updateButtonColor(colorValue) {
  if (!customDropdown) return;
  const { colorSquare, selectElement } = customDropdown;

  if (colorValue) {
    colorSquare.style.background = colorValue;
    colorSquare.style.setProperty('background', colorValue, 'important');
  } else {
    // Get color from select element or default to cyan
    const selectedKey = selectElement ? selectElement.value : 'cyan';
    const colorObj = colorPalette[selectedKey] || colorPalette.cyan;
    const colorHex = colorObj && colorObj.hex ? colorObj.hex : (colorObj || '#00ffff');
    colorSquare.style.background = colorHex;
    colorSquare.style.setProperty('background', colorHex, 'important');
  }
}

/**
 * Set selected color
 * @param {string} colorKey - Color key to set
 */
export function setSelectedColor(colorKey) {
  // Find select element - check customDropdown first, then DOM
  let selectElement = null;
  if (customDropdown && customDropdown.selectElement) {
    selectElement = customDropdown.selectElement;
  } else {
    selectElement = document.getElementById('logoColorSelect');
  }

  if (!selectElement) return;

  const colorObj = colorPalette[colorKey];
  if (!colorObj) return;

  const colorHex = colorObj && colorObj.hex ? colorObj.hex : (typeof colorObj === 'string' ? colorObj : null);

  // Ensure select has options
  if (selectElement.options.length === 0) {
    Object.keys(colorPalette).forEach((key) => {
      // Include all colors (including text-secondary and text-muted)
      const option = document.createElement('option');
      option.value = key;
      option.textContent = key;
      selectElement.appendChild(option);
    });
  }

  // Set value and trigger change
  selectElement.value = colorKey;
  selectElement.dispatchEvent(new Event('change', { bubbles: true }));

  // Update button if customDropdown is initialized
  if (customDropdown && colorHex) {
    updateButtonColor(colorHex);
  }
}

/**
 * Get selected color key
 * @returns {string} Selected color key
 */
export function getSelectedColorKey() {
  if (!customDropdown || !customDropdown.selectElement) return 'cyan';
  return customDropdown.selectElement.value || 'cyan';
}

// updateMenuHeight is defined above in the createCustomLogoColorDropdown function

/**
 * Initialize custom dropdown
 */
export function initCustomLogoColorDropdown(callback) {
  // Find or create the select element
  let selectElement = document.getElementById('logoColorSelect');
  if (!selectElement) {
    // Find the wrapper div in the HTML
    const wrapper = document.querySelector('.custom-logo-color-dropdown-wrapper');
    if (!wrapper) {
      console.error('Logo color dropdown wrapper not found in HTML');
      return;
    }

    selectElement = document.createElement('select');
    selectElement.id = 'logoColorSelect';
    selectElement.style.cssText = 'display: none;';
    wrapper.appendChild(selectElement);
  }

  // Always populate with color options (even if select already exists)
  // Clear existing options first
  selectElement.innerHTML = '';
  Object.keys(colorPalette).forEach((key) => {
    // Include all colors (including text-secondary and text-muted)
    const option = document.createElement('option');
    option.value = key;
    option.textContent = key;
    selectElement.appendChild(option);
  });

  // Set default value if empty
  if (!selectElement.value || selectElement.value === '') {
    selectElement.value = 'cyan';
  }

  if (selectElement) {
    createCustomLogoColorDropdown(selectElement, callback);
  }
}


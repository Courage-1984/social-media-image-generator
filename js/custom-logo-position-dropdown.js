/**
 * Custom Logo Position Dropdown Module
 * Creates a custom dropdown for logo position options
 */

let customDropdown = null;
let isOpen = false;

/**
 * Create a 3x3 grid indicator for position
 * @param {string} position - Position value
 * @returns {string} HTML string for the grid
 */
function createPositionGrid(position) {
  const grid = Array(9).fill('○'); // 9 empty circles
  const positionMap = {
    'top-left': 0,
    'top-center': 1,
    'top-right': 2,
    'center-left': 3,
    'center': 4,
    'center-right': 5,
    'bottom-left': 6,
    'bottom-center': 7,
    'bottom-right': 8,
    'hidden': -1
  };

  const index = positionMap[position];
  if (index !== undefined && index >= 0) {
    grid[index] = '●'; // Filled circle at position
  }

  // Return as a grid structure
  return `
    <div class="position-grid">
      <span>${grid[0]}</span><span>${grid[1]}</span><span>${grid[2]}</span>
      <span>${grid[3]}</span><span>${grid[4]}</span><span>${grid[5]}</span>
      <span>${grid[6]}</span><span>${grid[7]}</span><span>${grid[8]}</span>
    </div>
  `;
}

/**
 * Get position text for display
 * @param {string} position - Position value
 * @returns {string} Display text
 */
function getPositionText(position) {
  const textMap = {
    'top-left': 'Top Left',
    'top-center': 'Top Center',
    'top-right': 'Top Right',
    'center-left': 'Center Left',
    'center': 'Center Center',
    'center-right': 'Center Right',
    'bottom-left': 'Bottom Left',
    'bottom-center': 'Bottom Center',
    'bottom-right': 'Bottom Right',
    'hidden': 'Hidden'
  };
  return textMap[position] || 'Top Left';
}

/**
 * Create custom dropdown element
 * @param {HTMLElement} selectElement - The native select element
 */
export function createCustomLogoPositionDropdown(selectElement) {
  if (!selectElement) return;

  // Check if custom dropdown already exists
  if (document.querySelector('.custom-logo-position-dropdown-wrapper')) {
    return; // Already initialized
  }

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'custom-logo-position-dropdown-wrapper';
  wrapper.style.cssText = 'position: relative; width: 100%;';

  // Create custom button (displays current selection)
  const button = document.createElement('button');
  button.className = 'custom-logo-position-dropdown-button';
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
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  // Create button content with position indicator
  const buttonIndicator = document.createElement('div');
  buttonIndicator.className = 'position-indicator';
  buttonIndicator.innerHTML = createPositionGrid(selectElement.value || 'top-left');

  const buttonText = document.createElement('span');
  buttonText.className = 'dropdown-text';
  buttonText.textContent = getPositionText(selectElement.value || 'top-left');

  const buttonArrow = document.createElement('span');
  buttonArrow.className = 'dropdown-arrow';
  buttonArrow.textContent = '⯆';

  button.appendChild(buttonIndicator);
  button.appendChild(buttonText);
  button.appendChild(buttonArrow);

  // Update button style for flex layout
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.gap = '0.75rem';

  // Create dropdown menu
  const menu = document.createElement('div');
  menu.className = 'custom-logo-position-dropdown-menu';

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
    menu.style.position = 'fixed';
    menu.style.top = `${buttonRect.bottom + 4}px`; // 4px margin-top
    menu.style.left = `${buttonRect.left}px`;
    menu.style.width = `${buttonRect.width}px`; // Match button width exactly
    menu.style.right = 'auto';
    menu.style.marginBottom = `${marginBottom}px`; // Add margin beneath the list
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
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 255, 255, 0.3) #1a1a2e;
  `;

  // Insert wrapper before select and hide select
  selectElement.parentNode.insertBefore(wrapper, selectElement);
  wrapper.appendChild(button);
  wrapper.appendChild(menu);
  selectElement.style.cssText = 'opacity: 0; width: 1px; height: 1px; position: absolute; pointer-events: none;';

  customDropdown = { wrapper, button, menu, selectElement, updateMenuHeight };

  // Update menu when select options change
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

  // Update button text when select changes
  selectElement.addEventListener('change', () => {
    updateButtonText(button, selectElement);
  });

  // Initial update
  updateButtonText(button, selectElement);
}

/**
 * Toggle dropdown visibility
 * @param {boolean} force - Force open/close
 */
function toggleDropdown(force) {
  isOpen = force !== undefined ? force : !isOpen;
  const { button, menu, updateMenuHeight } = customDropdown;
  menu.style.display = isOpen ? 'block' : 'none';
  button.classList.toggle('active', isOpen);

  if (isOpen) {
    button.style.borderColor = 'rgba(0, 255, 255, 0.6)';
    button.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.3)';
    updateMenu();
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
    button.style.borderColor = 'rgba(0, 255, 255, 0.3)';
    button.style.boxShadow = 'none';
    if (updateMenuHeight) {
      window.removeEventListener('resize', updateMenuHeight);
    }
  }
}

/**
 * Update menu options based on native select
 */
function updateMenu() {
  if (!customDropdown) return;
  const { menu, selectElement } = customDropdown;
  menu.innerHTML = ''; // Clear existing options

  Array.from(selectElement.options).forEach((option) => {
    const item = document.createElement('div');
    item.className = 'custom-logo-position-dropdown-item';
    item.dataset.value = option.value;

    // Create position indicator (3x3 grid)
    const indicator = document.createElement('div');
    indicator.className = 'position-indicator';
    indicator.innerHTML = createPositionGrid(option.value);

    // Create text span
    const textSpan = document.createElement('span');
    textSpan.className = 'position-text';
    textSpan.textContent = option.textContent;

    item.appendChild(indicator);
    item.appendChild(textSpan);

    if (option.selected) {
      item.classList.add('selected');
    }

    item.addEventListener('click', (e) => {
      e.stopPropagation();
      selectElement.value = option.value;
      selectElement.dispatchEvent(new Event('change', { bubbles: true }));
      toggleDropdown(false);
    });

    menu.appendChild(item);
  });
}

/**
 * Update button text to match selected value
 * @param {HTMLElement} button - The button element
 * @param {HTMLElement} selectElement - The select element
 */
function updateButtonText(button, selectElement) {
  const selectedOption = selectElement.options[selectElement.selectedIndex];
  const position = selectedOption ? selectedOption.value : 'top-left';
  const text = getPositionText(position);

  // Update text
  const textSpan = button.querySelector('.dropdown-text');
  if (textSpan) {
    textSpan.textContent = text;
  }

  // Update indicator
  const indicator = button.querySelector('.position-indicator');
  if (indicator) {
    indicator.innerHTML = createPositionGrid(position);
  }
}

// updateMenuHeight is defined above in the createCustomLogoPositionDropdown function

/**
 * Initialize custom dropdown
 */
export function initCustomLogoPositionDropdown() {
  const selectElement = document.getElementById('logoPosition');
  if (selectElement) {
    createCustomLogoPositionDropdown(selectElement);
  }
}


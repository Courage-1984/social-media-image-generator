/**
 * Custom Export Quality Dropdown Module
 * Creates a custom dropdown matching the Background Pattern dropdown styling
 */

let customDropdown = null;
let isOpen = false;

/**
 * Create custom dropdown element
 * @param {HTMLElement} selectElement - The native select element
 */
export function createCustomExportQualityDropdown(selectElement) {
  if (!selectElement) return;

  // Check if custom dropdown already exists
  if (document.querySelector('.custom-export-quality-dropdown-wrapper')) {
    return; // Already initialized
  }

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'custom-export-quality-dropdown-wrapper';
  wrapper.style.cssText = 'position: relative; width: 100%;';

  // Create custom button (displays current selection)
  const button = document.createElement('button');
  button.className = 'custom-export-quality-dropdown-button';
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
    <span class="dropdown-text">2x (Recommended)</span>
    <span class="dropdown-arrow">⯆</span>
  `;

  // Create dropdown menu
  const menu = document.createElement('div');
  menu.className = 'custom-export-quality-dropdown-menu';
  menu.style.cssText = `
    position: fixed;
    background: #1a1a2e;
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 4px;
    overflow-y: auto;
    z-index: 10000;
    display: none;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
    max-height: 300px;
  `;

  // Function to calculate and set menu height and position based on viewport
  // Always opens upward
  function updateMenuHeight() {
    if (!isOpen || !menu) return;

    const buttonRect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceAbove = buttonRect.top - 8;

    // Position menu above the button
    const maxHeight = Math.max(150, spaceAbove);
    menu.style.maxHeight = `${maxHeight}px`;
    menu.style.position = 'fixed';
    menu.style.bottom = `${viewportHeight - buttonRect.top + 4}px`;
    menu.style.top = 'auto';
    menu.style.left = `${buttonRect.left}px`;
    menu.style.width = `${buttonRect.width}px`;
    menu.style.right = 'auto';
  }

  // Add options from select element
  Array.from(selectElement.options).forEach((option) => {
    const optionElement = document.createElement('div');
    optionElement.className = 'custom-export-quality-dropdown-option';
    optionElement.dataset.value = option.value;
    optionElement.style.cssText = `
      padding: 0.75rem;
      cursor: pointer;
      color: #ffffff;
      font-family: 'Rajdhani', sans-serif;
      border-bottom: 1px solid rgba(0, 255, 255, 0.1);
      transition: all 0.2s;
    `;
    optionElement.textContent = option.textContent;

    // Hover effect
    optionElement.addEventListener('mouseenter', () => {
      optionElement.style.background = 'rgba(0, 255, 255, 0.1)';
      optionElement.style.color = '#00ffff';
    });

    optionElement.addEventListener('mouseleave', () => {
      optionElement.style.background = '';
      optionElement.style.color = '#ffffff';
    });

    // Click to select
    optionElement.addEventListener('click', () => {
      selectElement.value = option.value;
      selectElement.dispatchEvent(new Event('change', { bubbles: true }));
      isOpen = false;
      menu.style.display = 'none';
      button.style.borderColor = 'rgba(0, 255, 255, 0.3)';
      button.style.boxShadow = 'none';
      updateButtonText(button, selectElement);
    });

    menu.appendChild(optionElement);
  });

  // Toggle dropdown
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen = !isOpen;
    menu.style.display = isOpen ? 'block' : 'none';
    if (isOpen) {
      button.style.borderColor = 'rgba(0, 255, 255, 0.6)';
      button.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.3)';
      button.classList.add('active');
      updateMenuHeight();
      window.addEventListener('resize', updateMenuHeight);
    } else {
      button.style.borderColor = 'rgba(0, 255, 255, 0.3)';
      button.style.boxShadow = 'none';
      button.classList.remove('active');
      window.removeEventListener('resize', updateMenuHeight);
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
      window.removeEventListener('resize', updateMenuHeight);
    }
  });

  // Update button text when select changes
  selectElement.addEventListener('change', () => {
    updateButtonText(button, selectElement);
  });

  // Replace select with custom dropdown
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

  // Initialize button text
  updateButtonText(button, selectElement);
}

/**
 * Update button text to match selected value
 * @param {HTMLElement} button - The button element
 * @param {HTMLElement} selectElement - The select element
 */
function updateButtonText(button, selectElement) {
  const selectedOption = selectElement.options[selectElement.selectedIndex];
  const text = selectedOption ? selectedOption.textContent : '2x (Recommended)';
  button.querySelector('.dropdown-text').textContent = text;
}

/**
 * Initialize custom dropdown
 */
export function initCustomExportQualityDropdown() {
  const selectElement = document.getElementById('exportQuality');
  if (selectElement) {
    createCustomExportQualityDropdown(selectElement);
  }
}


/**
 * Custom Preset Dropdown Module
 * Creates a custom dropdown for saved presets
 */

let customDropdown = null;
let isOpen = false;
let onSelectCallback = null;

/**
 * Create custom dropdown element
 * @param {HTMLElement} selectElement - The native select element
 * @param {Function} callback - Callback function when option is selected
 */
export function createCustomPresetDropdown(selectElement, callback) {
  if (!selectElement) return;

  onSelectCallback = callback;

  // Check if custom dropdown already exists
  if (document.querySelector('.custom-preset-dropdown-wrapper')) {
    return; // Already initialized
  }

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'custom-preset-dropdown-wrapper';
  wrapper.style.cssText = 'position: relative; display: inline-block;';

  // Create custom button (displays current selection)
  const button = document.createElement('button');
  button.className = 'custom-preset-dropdown-button';
  button.type = 'button';
  button.style.cssText = `
    padding: 0.4rem 1.5rem 0.4rem 0.6rem;
    background: #0a0a0a;
    border: 1px solid rgba(0, 255, 255, 0.3);
    color: #ffffff;
    font-family: 'Rajdhani', sans-serif;
    border-radius: 4px;
    cursor: pointer;
    text-align: left;
    position: relative;
    font-size: 0.85rem;
    min-width: 180px;
    max-width: 280px;
    white-space: nowrap;
    overflow: visible;
  `;
  button.innerHTML = `
    <span class="dropdown-text">Select a saved preset...</span>
    <span class="dropdown-arrow">⯆</span>
  `;

  // Create dropdown menu
  const menu = document.createElement('div');
  menu.className = 'custom-preset-dropdown-menu';
  menu.style.cssText = `
    display: none;
    position: fixed;
    background: #1a1a2e;
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 4px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    min-width: 180px;
  `;

  // Insert wrapper before select and hide select
  selectElement.parentNode.insertBefore(wrapper, selectElement);
  wrapper.appendChild(button);
  wrapper.appendChild(menu);
  wrapper.appendChild(selectElement); // Move select inside wrapper
  selectElement.style.cssText =
    'opacity: 0; width: 1px; height: 1px; position: absolute; pointer-events: none;';

  customDropdown = { wrapper, button, menu, selectElement };

  // Update menu when select options change
  updateMenu();

  // Toggle menu on button click
  button.addEventListener('click', e => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close menu when clicking outside
  document.addEventListener('click', e => {
    if (isOpen && !wrapper.contains(e.target)) {
      closeMenu();
    }
  });

  // Handle option selection
  menu.addEventListener('click', e => {
    const option = e.target.closest('.dropdown-option');
    if (option) {
      const value = option.dataset.value;
      selectOption(value, option.textContent);
      closeMenu();
    }
  });

  function toggleMenu() {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function openMenu() {
    isOpen = true;
    menu.style.display = 'block';
    updateMenuPosition();
    button.classList.add('active');
  }

  function closeMenu() {
    isOpen = false;
    menu.style.display = 'none';
    button.classList.remove('active');
  }

  function updateMenuPosition() {
    const buttonRect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - buttonRect.bottom - 8;
    const maxHeight = Math.max(150, Math.min(300, spaceBelow));

    menu.style.top = `${buttonRect.bottom + 4}px`;
    menu.style.left = `${buttonRect.left}px`;
    menu.style.width = `${buttonRect.width}px`;
    menu.style.maxHeight = `${maxHeight}px`;
  }

  function selectOption(value, text) {
    button.querySelector('.dropdown-text').textContent = text || 'Select a saved preset...';
    selectElement.value = value;

    // Trigger change event on native select
    const event = new Event('change', { bubbles: true });
    selectElement.dispatchEvent(event);

    // Call callback if provided
    if (onSelectCallback) {
      onSelectCallback(value);
    }
  }

  function updateMenu() {
    menu.innerHTML = '';
    const options = selectElement.querySelectorAll('option');

    options.forEach(option => {
      const optionElement = document.createElement('div');
      optionElement.className = 'dropdown-option';
      optionElement.dataset.value = option.value;
      optionElement.textContent = option.textContent;
      optionElement.style.cssText = `
        padding: 0.5rem 0.75rem;
        cursor: pointer;
        color: #ffffff;
        font-size: 0.85rem;
        transition: background 0.2s;
      `;

      optionElement.addEventListener('mouseenter', () => {
        optionElement.style.background = 'rgba(0, 255, 255, 0.2)';
      });
      optionElement.addEventListener('mouseleave', () => {
        optionElement.style.background = 'transparent';
      });

      menu.appendChild(optionElement);
    });
  }

  // Watch for changes to select options
  const observer = new MutationObserver(updateMenu);
  observer.observe(selectElement, { childList: true, subtree: true });

  // Expose update function
  return {
    update: updateMenu,
    setValue: value => {
      const option = selectElement.querySelector(`option[value="${value}"]`);
      if (option) {
        selectOption(value, option.textContent);
      }
    },
    getValue: () => selectElement.value,
  };
}

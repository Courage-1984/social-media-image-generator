/**
 * Custom Template Dropdown Module
 * Creates a custom dropdown matching the Background Pattern dropdown styling
 */

let customDropdown = null;
let isOpen = false;
let menuResizeHandler = null;

/**
 * Create custom dropdown element
 * @param {HTMLElement} selectElement - The native select element
 */
export function createCustomTemplateDropdown(selectElement) {
  if (!selectElement) return;

  // Check if custom dropdown already exists
  if (document.querySelector('.custom-template-dropdown-wrapper')) {
    return; // Already initialized
  }

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'custom-template-dropdown-wrapper';

  // Check if parent is an inline-control to apply flex styling
  const parent = selectElement.parentElement;
  const isInlineControl = parent && parent.classList.contains('inline-control');

  if (isInlineControl) {
    // Match the select's flex behavior in inline-control context
    wrapper.style.cssText = 'position: relative; flex: 1; min-width: 0;';
  } else {
    wrapper.style.cssText = 'position: relative; width: 100%;';
  }

  // Create custom button (displays current selection)
  const button = document.createElement('button');
  button.className = 'custom-pattern-dropdown-button'; // Reuse same CSS class
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
    <span class="dropdown-text">Select a template...</span>
    <span class="dropdown-arrow">⯆</span>
  `;

  // Create dropdown menu
  const menu = document.createElement('div');
  menu.className = 'custom-pattern-dropdown-menu'; // Reuse same CSS class

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
    z-index: 50000;
    display: none;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  `;

  // Populate menu with template options
  function populateMenu() {
    menu.innerHTML = '';

    // Add default option
    const defaultOption = createDropdownOption('', 'Select a template...', selectElement);
    menu.appendChild(defaultOption);

    // Add all template options
    Array.from(selectElement.options).forEach((option) => {
      if (option.value !== '') {
        const dropdownOption = createDropdownOption(option.value, option.textContent, selectElement);
        menu.appendChild(dropdownOption);
      }
    });
  }

  // Create dropdown option
  function createDropdownOption(value, text, selectElement) {
    const option = document.createElement('div');
    option.className = 'custom-pattern-dropdown-option'; // Reuse same CSS class
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

    option.addEventListener('mouseenter', () => {
      option.style.background = 'rgba(0, 255, 255, 0.1)';
      option.style.color = '#00ffff';
    });

    option.addEventListener('mouseleave', () => {
      option.style.background = '';
      option.style.color = '#ffffff';
    });

    option.addEventListener('click', () => {
      selectElement.value = value;
      selectElement.dispatchEvent(new Event('change', { bubbles: true }));
      isOpen = false;
      menu.style.display = 'none';
      // Remove menu from body when closed
      if (document.body.contains(menu)) {
        document.body.removeChild(menu);
      }
      button.style.borderColor = 'rgba(0, 255, 255, 0.3)';
      button.style.boxShadow = 'none';
      updateButtonText(button, selectElement);
      removeScrollPrevention();

      if (menuResizeHandler) {
        window.removeEventListener('resize', menuResizeHandler);
        menuResizeHandler = null;
      }
    });

    return option;
  }

  // Update button text
  function updateButtonText(button, selectElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const text = selectedOption ? selectedOption.textContent : 'Select a template...';
    button.querySelector('.dropdown-text').textContent = text;
  }

  // Prevent page scroll when scrolling within dropdown menu
  let wheelHandler = null;

  function setupScrollPrevention() {
    if (wheelHandler) return;

    wheelHandler = (e) => {
      if (!isOpen) return;
      if (!menu) return;

      const isWithinMenu = menu.contains(e.target) || e.target === menu;

      if (isWithinMenu) {
        const { scrollTop, scrollHeight, clientHeight } = menu;
        const isAtTop = scrollTop === 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

        if (e.deltaY < 0 && isAtTop) {
          return;
        }

        if (e.deltaY > 0 && isAtBottom) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        menu.scrollTop += e.deltaY;
      }
    };

    window.addEventListener('wheel', wheelHandler, { passive: false });
  }

  function removeScrollPrevention() {
    if (wheelHandler) {
      window.removeEventListener('wheel', wheelHandler);
      wheelHandler = null;
    }
  }

  // Toggle dropdown
  function toggleDropdown() {
    isOpen = !isOpen;

    if (isOpen) {
      populateMenu();
      // Append menu to body to escape stacking context
      if (!document.body.contains(menu)) {
        document.body.appendChild(menu);
      }
      updateMenuHeight();
      menu.style.display = 'block';
      button.style.borderColor = 'rgba(0, 255, 255, 0.6)';
      button.style.boxShadow = '0 0 8px rgba(0, 255, 255, 0.2)';
      button.classList.add('active');
      setupScrollPrevention();

      menuResizeHandler = () => {
        updateMenuHeight();
      };
      window.addEventListener('resize', menuResizeHandler);
    } else {
      menu.style.display = 'none';
      // Remove menu from body when closed
      if (document.body.contains(menu)) {
        document.body.removeChild(menu);
      }
      button.style.borderColor = 'rgba(0, 255, 255, 0.3)';
      button.style.boxShadow = 'none';
      button.classList.remove('active');
      removeScrollPrevention();

      if (menuResizeHandler) {
        window.removeEventListener('resize', menuResizeHandler);
        menuResizeHandler = null;
      }
    }
  }

  // Button click handler
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (isOpen && !wrapper.contains(e.target) && !menu.contains(e.target)) {
      isOpen = false;
      menu.style.display = 'none';
      // Remove menu from body when closed
      if (document.body.contains(menu)) {
        document.body.removeChild(menu);
      }
      button.style.borderColor = 'rgba(0, 255, 255, 0.3)';
      button.style.boxShadow = 'none';
      button.classList.remove('active');
      removeScrollPrevention();

      if (menuResizeHandler) {
        window.removeEventListener('resize', menuResizeHandler);
        menuResizeHandler = null;
      }
    }
  });

  // Close dropdown on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      menu.style.display = 'none';
      // Remove menu from body when closed
      if (document.body.contains(menu)) {
        document.body.removeChild(menu);
      }
      button.style.borderColor = 'rgba(0, 255, 255, 0.3)';
      button.style.boxShadow = 'none';
      button.classList.remove('active');
      removeScrollPrevention();

      if (menuResizeHandler) {
        window.removeEventListener('resize', menuResizeHandler);
        menuResizeHandler = null;
      }
    }
  });

  // Watch for changes to the select element (from external updates)
  const observer = new MutationObserver(() => {
    if (!isOpen) {
      populateMenu();
    }
    updateButtonText(button, selectElement);
  });

  observer.observe(selectElement, {
    childList: true,
    attributes: true,
    attributeFilter: ['selected'],
    subtree: true
  });

  // Also listen for programmatic value changes
  let lastValue = selectElement.value;
  setInterval(() => {
    if (selectElement.value !== lastValue) {
      lastValue = selectElement.value;
      updateButtonText(button, selectElement);
      if (!isOpen) {
        populateMenu();
      }
    }
  }, 100);

  // Hide native select (same approach as pattern dropdown - position absolutely with opacity 0)
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

  // Insert custom dropdown wrapper before select
  selectElement.parentNode.insertBefore(wrapper, selectElement);

  // Assemble dropdown - append only button to wrapper
  // Menu will be appended to body when opened to escape stacking context
  wrapper.appendChild(button);

  // Store reference
  customDropdown = {
    wrapper,
    button,
    menu,
    selectElement
  };

  // Initial button text update
  updateButtonText(button, selectElement);
}

/**
 * Initialize custom dropdown
 */
export function initCustomTemplateDropdown() {
  const selectElement = document.getElementById('templateSelect');
  if (selectElement) {
    createCustomTemplateDropdown(selectElement);
  }
}


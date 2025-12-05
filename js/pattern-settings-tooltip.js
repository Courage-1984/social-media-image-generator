/**
 * Pattern Settings Tooltip Module
 * Shows tooltips for Background Pattern settings
 */

// Tooltip descriptions for each setting
const settingDescriptions = {
  'Pattern Color': 'The base color used for the pattern. Choose from the color palette.',
  'Pattern Opacity': 'Controls the transparency of the pattern (0 = fully transparent, 100 = fully opaque).',
  'Pattern Size': 'Adjusts the overall size of pattern elements. Larger values create bigger pattern features.',
  'Pattern Rotation': 'Rotates the pattern by the specified angle in degrees (0-360).',
  'Pattern Blend Mode': {
    description: 'Determines how the pattern blends with the background. Different modes create various visual effects.',
    options: [
      { value: 'normal', desc: 'Default blending - pattern appears as-is' },
      { value: 'multiply', desc: 'Darkens the background - creates darker, richer colors' },
      { value: 'screen', desc: 'Lightens the background - creates brighter, washed-out effects' },
      { value: 'overlay', desc: 'Combines multiply and screen - enhances contrast' },
      { value: 'soft-light', desc: 'Soft lighting effect - subtle color mixing' },
      { value: 'hard-light', desc: 'Strong lighting effect - more dramatic than soft-light' },
      { value: 'difference', desc: 'Inverts colors - creates high-contrast, artistic effects' },
      { value: 'exclusion', desc: 'Similar to difference but with lower contrast' },
      { value: 'color-dodge', desc: 'Brightens and saturates - creates vibrant, glowing effects' },
      { value: 'color-burn', desc: 'Darkens and intensifies - creates deep, rich shadows' },
    ]
  },
  'Pattern Density': 'Controls how densely packed the pattern elements are. Higher values create more elements.',
  'Pattern Spacing': 'Adds space between pattern elements. Useful for creating gaps or breathing room.',
  'Pattern Offset X': 'Shifts the pattern horizontally. Positive values move right, negative values move left.',
  'Pattern Offset Y': 'Shifts the pattern vertically. Positive values move down, negative values move up.',
  'Pattern Blur': 'Applies a blur effect to the pattern. Higher values create softer, more diffused patterns.',
  'Pattern Scale': 'Scales the entire pattern. Values above 100% enlarge, below 100% shrink the pattern.',
  'Pattern Repeat': {
    description: 'Controls how the pattern repeats across the background.',
    options: [
      { value: 'repeat', desc: 'Repeats in both X and Y directions - fills entire area' },
      { value: 'no-repeat', desc: 'Shows pattern only once - no repetition' },
      { value: 'repeat-x', desc: 'Repeats only horizontally (left to right)' },
      { value: 'repeat-y', desc: 'Repeats only vertically (top to bottom)' },
      { value: 'space', desc: 'Repeats with even spacing - no clipping at edges' },
      { value: 'round', desc: 'Repeats and scales to fit - no partial patterns' },
    ]
  },
  'Pattern Intensity': 'Controls the overall intensity or strength of the pattern effect. Higher values make the pattern more prominent.',
};

let tooltipElement = null;
let tooltipTimeout = null;

/**
 * Create tooltip element
 */
function createTooltip() {
  if (tooltipElement) return tooltipElement;

  tooltipElement = document.createElement('div');
  tooltipElement.className = 'pattern-setting-tooltip';
  tooltipElement.style.cssText = `
    position: fixed;
    background: #1a1a2e;
    border: 1px solid rgba(0, 255, 255, 0.4);
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    color: #ffffff;
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.75rem;
    line-height: 1.4;
    max-width: 250px;
    z-index: 999999;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 16px rgba(0, 255, 255, 0.2);
  `;
  document.body.appendChild(tooltipElement);
  return tooltipElement;
}

/**
 * Show tooltip
 * @param {HTMLElement} triggerElement - The info icon that triggered the tooltip
 * @param {string|object} content - Tooltip text or object with description and options
 */
export function showSettingTooltip(triggerElement, content) {
  if (!triggerElement || !content) return;

  const tooltip = createTooltip();

  // Clear previous content
  tooltip.innerHTML = '';

  // Handle object format (for dropdowns with options)
  if (typeof content === 'object' && content.description && content.options) {
    // Add description
    const desc = document.createElement('div');
    desc.textContent = content.description;
    desc.style.marginBottom = '0.5rem';
    tooltip.appendChild(desc);

    // Add options list
    const list = document.createElement('ul');
    list.style.cssText = `
      margin: 0;
      padding-left: 1.25rem;
      list-style-type: disc;
    `;

    content.options.forEach(option => {
      const item = document.createElement('li');
      item.style.cssText = `
        margin-bottom: 0.25rem;
        line-height: 1.3;
      `;

      const value = document.createElement('strong');
      value.textContent = option.value + ': ';
      value.style.color = '#00ffff';

      const desc = document.createTextNode(option.desc);

      item.appendChild(value);
      item.appendChild(desc);
      list.appendChild(item);
    });

    tooltip.appendChild(list);
  } else {
    // Simple text content
    tooltip.textContent = typeof content === 'string' ? content : content.description || '';
  }

  tooltip.style.display = 'block';

  // Position tooltip
  const rect = triggerElement.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  // Position to the right of the icon, or to the left if not enough space
  let left = rect.right + 8;
  let top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);

  // Adjust if tooltip would go off screen to the right
  if (left + tooltipRect.width > window.innerWidth - 10) {
    left = rect.left - tooltipRect.width - 8;
  }

  // Adjust if tooltip would go off screen at bottom
  if (top + tooltipRect.height > window.innerHeight - 10) {
    top = window.innerHeight - tooltipRect.height - 10;
  }

  // Adjust if tooltip would go off screen at top
  if (top < 10) {
    top = 10;
  }

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;

  // Fade in
  requestAnimationFrame(() => {
    tooltip.style.opacity = '1';
  });
}

/**
 * Hide tooltip
 */
export function hideSettingTooltip() {
  if (tooltipElement) {
    tooltipElement.style.opacity = '0';
    setTimeout(() => {
      if (tooltipElement) {
        tooltipElement.style.display = 'none';
      }
    }, 200);
  }
}

/**
 * Get description for a setting
 * @param {string} settingName - Name of the setting
 * @returns {string|object} Description text or object with description and options
 */
export function getSettingDescription(settingName) {
  return settingDescriptions[settingName] || 'No description available.';
}

// Track if tooltips have been initialized to avoid duplicates
let tooltipsInitialized = false;

/**
 * Initialize tooltips for pattern settings
 */
export function initPatternSettingsTooltips() {
  // Find all pattern setting labels
  const patternSettingsContainer = document.getElementById('patternCustomization');
  if (!patternSettingsContainer) return;

  const labels = patternSettingsContainer.querySelectorAll('label');

  labels.forEach(label => {
    // Skip if this label already has an info icon
    if (label.querySelector('.pattern-setting-info')) return;

    const labelText = label.textContent.trim();

    // Check if this is a pattern setting (starts with "Pattern ")
    if (labelText.startsWith('Pattern ')) {
      const description = getSettingDescription(labelText);

      if (description) {
        // Create info icon
        const infoIcon = document.createElement('span');
        infoIcon.className = 'pattern-setting-info';
        infoIcon.textContent = 'i';
        infoIcon.setAttribute('aria-label', `Info about ${labelText}`);

        // Add hover effects
        infoIcon.addEventListener('mouseenter', () => {
          showSettingTooltip(infoIcon, description);
        });

        infoIcon.addEventListener('mouseleave', () => {
          hideSettingTooltip();
        });

        // Append to label
        label.appendChild(infoIcon);
      }
    }
  });

  tooltipsInitialized = true;
}


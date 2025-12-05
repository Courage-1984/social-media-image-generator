/**
 * Preset Storage Module
 * Handles saving and loading presets to/from localStorage
 */

const STORAGE_KEY = 'logiInkGeneratorPresets';
const MAX_PRESETS = 20;

/**
 * Get all saved presets
 * @returns {Array} Array of saved presets
 */
export function getSavedPresets() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading presets:', error);
    return [];
  }
}

/**
 * Save a preset
 * @param {string} name - Preset name
 * @param {Object} state - Generator state to save
 * @returns {boolean} Success status
 */
export function savePreset(name, state) {
  try {
    const presets = getSavedPresets();

    // Check if name already exists
    const existingIndex = presets.findIndex(p => p.name === name);
    const presetData = {
      name,
      state,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Update existing
      presets[existingIndex] = presetData;
    } else {
      // Add new
      if (presets.length >= MAX_PRESETS) {
        // Remove oldest
        presets.shift();
      }
      presets.push(presetData);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    return true;
  } catch (error) {
    console.error('Error saving preset:', error);
    return false;
  }
}

/**
 * Load a preset
 * @param {string} name - Preset name
 * @returns {Object|null} Preset state or null if not found
 */
export function loadPreset(name) {
  try {
    const presets = getSavedPresets();
    const preset = presets.find(p => p.name === name);
    return preset ? preset.state : null;
  } catch (error) {
    console.error('Error loading preset:', error);
    return null;
  }
}

/**
 * Delete a preset
 * @param {string} name - Preset name
 * @returns {boolean} Success status
 */
export function deletePreset(name) {
  try {
    const presets = getSavedPresets();
    const filtered = presets.filter(p => p.name !== name);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting preset:', error);
    return false;
  }
}

/**
 * Check if preset name exists
 * @param {string} name - Preset name
 * @returns {boolean} True if exists
 */
export function presetExists(name) {
  const presets = getSavedPresets();
  return presets.some(p => p.name === name);
}


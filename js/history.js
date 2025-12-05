/**
 * History Module
 * Undo/Redo functionality with history stack
 */

const MAX_HISTORY = 50;
let historyStack = [];
let historyIndex = -1;

/**
 * Add state to history
 * @param {Object} state - State to save
 */
export function addToHistory(state) {
  // Remove any future history if we're not at the end
  if (historyIndex < historyStack.length - 1) {
    historyStack = historyStack.slice(0, historyIndex + 1);
  }

  // Add new state
  historyStack.push(JSON.parse(JSON.stringify(state))); // Deep clone

  // Limit history size
  if (historyStack.length > MAX_HISTORY) {
    historyStack.shift();
  } else {
    historyIndex++;
  }
}

/**
 * Undo - Get previous state
 * @returns {Object|null} Previous state or null
 */
export function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    return JSON.parse(JSON.stringify(historyStack[historyIndex])); // Deep clone
  }
  return null;
}

/**
 * Redo - Get next state
 * @returns {Object|null} Next state or null
 */
export function redo() {
  if (historyIndex < historyStack.length - 1) {
    historyIndex++;
    return JSON.parse(JSON.stringify(historyStack[historyIndex])); // Deep clone
  }
  return null;
}

/**
 * Check if undo is available
 * @returns {boolean} True if undo available
 */
export function canUndo() {
  return historyIndex > 0;
}

/**
 * Check if redo is available
 * @returns {boolean} True if redo available
 */
export function canRedo() {
  return historyIndex < historyStack.length - 1;
}

/**
 * Clear history
 */
export function clearHistory() {
  historyStack = [];
  historyIndex = -1;
}

/**
 * Initialize history with initial state
 * @param {Object} initialState - Initial state
 */
export function initHistory(initialState) {
  clearHistory();
  addToHistory(initialState);
}

/**
 * Get full history array
 * @returns {Array} History stack
 */
export function getHistory() {
  return historyStack.map(state => JSON.parse(JSON.stringify(state))); // Deep clone all
}

/**
 * Get state at specific index
 * @param {number} index - History index
 * @returns {Object|null} State at index or null
 */
export function getStateAt(index) {
  if (index >= 0 && index < historyStack.length) {
    return JSON.parse(JSON.stringify(historyStack[index])); // Deep clone
  }
  return null;
}

/**
 * Set history index
 * @param {number} index - New history index
 */
export function setHistoryIndex(index) {
  if (index >= 0 && index < historyStack.length) {
    historyIndex = index;
  }
}


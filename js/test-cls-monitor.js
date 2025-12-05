/**
 * CLS Monitor for Export Testing
 *
 * This utility monitors Cumulative Layout Shift (CLS) during the export process
 * to verify that Phase 1 zero-CLS implementation is working correctly.
 *
 * Usage:
 * 1. Open generate.html in browser
 * 2. Open DevTools Console
 * 3. Import and initialize: import { initCLSMonitor } from './test-cls-monitor.js'; initCLSMonitor();
 * 4. Click Export button
 * 5. Check console for CLS metrics
 */

let clsObserver = null;
let clsEntries = [];
let clsValue = 0;
let monitoringActive = false;

/**
 * Initialize CLS monitoring
 */
export function initCLSMonitor() {
  if (monitoringActive) {
    console.warn('CLS Monitor already active');
    return;
  }

  console.log('🔍 CLS Monitor initialized - Ready to track layout shifts');
  console.log('📊 Click the Export button to start monitoring...');

  clsEntries = [];
  clsValue = 0;
  monitoringActive = true;

  // Use PerformanceObserver API for CLS
  if ('PerformanceObserver' in window) {
    try {
      clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Only count layout shifts that are not caused by user interaction
          if (!entry.hadRecentInput) {
            clsEntries.push(entry);
            clsValue += entry.value;

            console.log('⚠️ Layout Shift detected:', {
              value: entry.value.toFixed(4),
              cumulative: clsValue.toFixed(4),
              sources: entry.sources?.map(s => ({
                node: s.node?.tagName || 'unknown',
                previousRect: s.previousRect,
                currentRect: s.currentRect,
              })) || [],
              timestamp: entry.startTime.toFixed(2) + 'ms',
            });
          }
        }
      });

      clsObserver.observe({ type: 'layout-shift', buffered: true });
      console.log('✅ PerformanceObserver initialized for layout-shift events');
    } catch (e) {
      console.error('❌ Failed to initialize PerformanceObserver:', e);
      monitoringActive = false;
    }
  } else {
    console.warn('⚠️ PerformanceObserver not supported - CLS monitoring unavailable');
    monitoringActive = false;
  }
}

/**
 * Start monitoring for export (call before export starts)
 */
export function startExportMonitoring() {
  if (!monitoringActive) {
    initCLSMonitor();
  }

  clsEntries = [];
  clsValue = 0;
  console.log('🚀 Export monitoring started - CLS tracking active');
}

/**
 * Stop monitoring and report results
 */
export function stopExportMonitoring() {
  if (!monitoringActive) {
    console.warn('CLS Monitor not active');
    return;
  }

  console.log('\n📊 ===== EXPORT CLS REPORT =====');
  console.log(`Total Layout Shifts: ${clsEntries.length}`);
  console.log(`Cumulative Layout Shift (CLS): ${clsValue.toFixed(6)}`);

  if (clsValue === 0) {
    console.log('✅ SUCCESS: Zero CLS detected - Phase 1 implementation working!');
  } else if (clsValue < 0.01) {
    console.log('✅ GOOD: Minimal CLS detected (< 0.01)');
  } else if (clsValue < 0.1) {
    console.log('⚠️ WARNING: Moderate CLS detected (0.01 - 0.1)');
  } else {
    console.log('❌ FAIL: High CLS detected (> 0.1) - Phase 1 may need adjustment');
  }

  if (clsEntries.length > 0) {
    console.log('\n📋 Detailed Layout Shift Entries:');
    clsEntries.forEach((entry, index) => {
      console.log(`  ${index + 1}. Value: ${entry.value.toFixed(6)}, Time: ${entry.startTime.toFixed(2)}ms`);
    });
  }

  console.log('================================\n');

  return {
    totalShifts: clsEntries.length,
    clsValue: clsValue,
    entries: clsEntries,
  };
}

/**
 * Reset monitoring state
 */
export function resetCLSMonitor() {
  clsEntries = [];
  clsValue = 0;
  console.log('🔄 CLS Monitor reset');
}

/**
 * Cleanup and stop monitoring
 */
export function cleanupCLSMonitor() {
  if (clsObserver) {
    clsObserver.disconnect();
    clsObserver = null;
  }
  monitoringActive = false;
  clsEntries = [];
  clsValue = 0;
  console.log('🧹 CLS Monitor cleaned up');
}

// Auto-initialize if imported in browser console
if (typeof window !== 'undefined') {
  window.CLSMonitor = {
    init: initCLSMonitor,
    start: startExportMonitoring,
    stop: stopExportMonitoring,
    reset: resetCLSMonitor,
    cleanup: cleanupCLSMonitor,
    getValue: () => clsValue,
    getEntries: () => clsEntries,
  };

  console.log('💡 CLS Monitor available via window.CLSMonitor');
  console.log('   Usage: CLSMonitor.start() before export, CLSMonitor.stop() after');
}


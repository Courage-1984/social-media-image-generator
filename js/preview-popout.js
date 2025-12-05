/**
 * Preview Pop-out Module
 * Creates a separate browser window for the preview (can be moved to any monitor)
 */

let popoutWindow = null;
let isPopoutOpen = false;
let syncInterval = null;

/**
 * Create pop-out preview window (separate browser window)
 */
export function createPopoutPreview() {
  if (popoutWindow && !popoutWindow.closed) {
    // Window already exists and is open, just focus it
    popoutWindow.focus();
    syncPopoutPreview();
    return;
  }

  // Calculate window size and position (center of screen)
  // Set to 750px wide with appropriate height for preview
  const width = 750;
  const height = 800; // Enough height to show preview with some padding
  const left = Math.round((screen.width - width) / 2);
  const top = Math.round((screen.height - height) / 2);

  // Open new window (not tab) - use relative path from current location
  // Window features ensure it opens as a popup window, not a tab
  // Note: Some browsers require all features to be specified for size to work
  const features = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'resizable=yes',
    'scrollbars=yes',
    'toolbar=no',
    'menubar=no',
    'location=no',
    'status=no',
    'dependent=no'
  ].join(',');

  popoutWindow = window.open(
    './preview-popout-window.html',
    'previewPopout',
    features
  );

  if (!popoutWindow) {
    alert('Popup blocked! Please allow popups for this site to use the pop-out preview.');
    return;
  }

  // Wait for window to load, then sync and resize
  const checkReady = setInterval(() => {
    if (popoutWindow.closed) {
      clearInterval(checkReady);
      isPopoutOpen = false;
      if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
      }
      return;
    }

    try {
      // Try to send resize message to popout window
      popoutWindow.postMessage({
        type: 'resizeWindow',
        width: width,
        height: height,
        left: left,
        top: top
      }, '*');

      // Try to send a test message
      popoutWindow.postMessage({ type: 'test' }, '*');
      // If no error, window is ready
      clearInterval(checkReady);
      isPopoutOpen = true;
      syncPopoutPreview();

      // Set up periodic syncing
      if (syncInterval) {
        clearInterval(syncInterval);
      }
      syncInterval = setInterval(() => {
        if (popoutWindow && !popoutWindow.closed) {
          syncPopoutPreview();
        } else {
          clearInterval(syncInterval);
          syncInterval = null;
          isPopoutOpen = false;
        }
      }, 100); // Sync every 100ms
    } catch (e) {
      // Window not ready yet, keep checking
    }
  }, 50);

  // Listen for ready message from popout window
  window.addEventListener('message', (event) => {
    if (event.data.type === 'popoutReady') {
      clearInterval(checkReady);
      isPopoutOpen = true;
      syncPopoutPreview();
    }
  });

  // Handle window close
  const checkClosed = setInterval(() => {
    if (popoutWindow.closed) {
      clearInterval(checkClosed);
      if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
      }
      isPopoutOpen = false;
      popoutWindow = null;
    }
  }, 100);
}

/**
 * Setup event listeners for pop-out window
 */
function setupPopoutEvents(header, minimizeBtn, closeBtn, resizeHandle) {
  let isMinimized = false;
  let savedHeight = null;

  // Drag functionality
  header.addEventListener('mousedown', (e) => {
    if (e.target === minimizeBtn || e.target === closeBtn) return;
    isDragging = true;
    const rect = popoutWindow.getBoundingClientRect();
    // Use screen coordinates for multi-monitor support
    // Convert screen position to viewport position
    const windowScreenX = window.screenX || 0;
    const windowScreenY = window.screenY || 0;
    const popoutScreenX = rect.left + windowScreenX;
    const popoutScreenY = rect.top + windowScreenY;
    dragOffset.x = e.screenX - popoutScreenX;
    dragOffset.y = e.screenY - popoutScreenY;
    header.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging && popoutWindow) {
      // Use screen coordinates to support multi-monitor dragging
      // Convert screen coordinates to viewport-relative coordinates
      const windowScreenX = window.screenX || 0;
      const windowScreenY = window.screenY || 0;

      // Calculate position in viewport coordinates
      const x = (e.screenX - dragOffset.x) - windowScreenX;
      const y = (e.screenY - dragOffset.y) - windowScreenY;

      // No constraints - allow positioning anywhere, including off-screen
      popoutWindow.style.left = `${x}px`;
      popoutWindow.style.top = `${y}px`;
      popoutWindow.style.transform = 'none';
    }

    if (isResizing && popoutWindow) {
      // Use screen coordinates for resizing to support multi-monitor
      const windowScreenX = window.screenX || 0;
      const windowScreenY = window.screenY || 0;
      const popoutScreenLeft = popoutWindow.offsetLeft + windowScreenX;
      const popoutScreenTop = popoutWindow.offsetTop + windowScreenY;

      const width = e.screenX - popoutScreenLeft;
      const height = e.screenY - popoutScreenTop;

      const minWidth = 400;
      const minHeight = 300;
      // Allow resizing to very large sizes for multi-monitor support
      const maxWidth = 5000; // Large enough for multi-monitor setups
      const maxHeight = 5000;

      popoutWindow.style.width = `${Math.max(minWidth, Math.min(width, maxWidth))}px`;
      popoutWindow.style.height = `${Math.max(minHeight, Math.min(height, maxHeight))}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      header.style.cursor = 'move';
    }
    if (isResizing) {
      isResizing = false;
    }
  });

  // Resize functionality
  resizeHandle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isResizing = true;
    resizeStart.x = e.clientX;
    resizeStart.y = e.clientY;
    resizeStart.width = popoutWindow.offsetWidth;
    resizeStart.height = popoutWindow.offsetHeight;
  });

  // Minimize
  minimizeBtn.addEventListener('click', () => {
    isMinimized = !isMinimized;
    const content = popoutWindow.querySelector('.popout-content');
    if (isMinimized) {
      savedHeight = popoutWindow.style.height;
      popoutWindow.style.height = 'auto';
      content.style.display = 'none';
      minimizeBtn.innerHTML = '+';
      minimizeBtn.title = 'Restore';
    } else {
      if (savedHeight) {
        popoutWindow.style.height = savedHeight;
      }
      content.style.display = 'flex';
      minimizeBtn.innerHTML = '−';
      minimizeBtn.title = 'Minimize';
    }
  });

  // Close
  closeBtn.addEventListener('click', () => {
    hidePopoutPreview();
  });
}

/**
 * Show pop-out preview
 */
export function showPopoutPreview() {
  if (!popoutWindow || popoutWindow.closed) {
    createPopoutPreview();
  } else {
    popoutWindow.focus();
    syncPopoutPreview();
  }
}

/**
 * Hide pop-out preview
 */
export function hidePopoutPreview() {
  if (popoutWindow && !popoutWindow.closed) {
    popoutWindow.close();
  }
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  isPopoutOpen = false;
  popoutWindow = null;
}

/**
 * Toggle pop-out preview
 */
export function togglePopoutPreview() {
  if (isPopoutOpen) {
    hidePopoutPreview();
  } else {
    showPopoutPreview();
  }
}

/**
 * Sync pop-out preview with main preview
 */
export function syncPopoutPreview() {
  if (!popoutWindow || popoutWindow.closed || !isPopoutOpen) return;

  const mainCanvas = document.getElementById('canvasWrapper');
  if (!mainCanvas) return;

  try {
    // Get computed styles
    const computed = window.getComputedStyle(mainCanvas);

    // Send update to popout window
    popoutWindow.postMessage({
      type: 'updatePreview',
      html: mainCanvas.innerHTML,
      className: mainCanvas.className,
      styles: {
        width: computed.width,
        height: computed.height,
        background: computed.background,
        backgroundImage: computed.backgroundImage,
        backgroundSize: computed.backgroundSize,
        backgroundColor: computed.backgroundColor,
        backgroundPosition: computed.backgroundPosition,
        backgroundRepeat: computed.backgroundRepeat,
        transform: computed.transform,
      }
    }, '*');
  } catch (e) {
    // Window might be closed or cross-origin issue
    if (popoutWindow.closed) {
      isPopoutOpen = false;
      popoutWindow = null;
      if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
      }
    }
  }
}

/**
 * Check if pop-out is open
 */
export function isPopoutOpenState() {
  return isPopoutOpen;
}


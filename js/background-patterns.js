/**
 * Background Patterns Module
 * Additional background pattern options
 */

/**
 * Convert hex color to rgba
 * @param {string} hex - Hex color (#rrggbb)
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} rgba color string
 */
export function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Convert hex color to RGB array
 * @param {string} hex - Hex color (#rrggbb)
 * @returns {Array<number>} [r, g, b] values 0-255
 */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

/**
 * Create a canvas pattern tile
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Function} drawFunction - Function that draws the pattern on the canvas context
 * @returns {string} Data URL of the canvas
 */
function createPatternCanvas(width, height, drawFunction) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Fill with transparent background
  ctx.clearRect(0, 0, width, height);
  
  // Call the draw function
  drawFunction(ctx, width, height);
  
  return canvas.toDataURL('image/png');
}

/**
 * Default settings for each pattern type
 * Each pattern has optimized defaults for best visual appearance
 */
export const patternDefaults = {
  dots: {
    opacity: 25,
    size: 30,
    rotation: 0,
    blendMode: 'normal',
    offsetX: 0,
    offsetY: 0,
    spacing: 5,
    density: 2,
    blur: 0,
    scale: 100,
    repeat: 'repeat',
    intensity: 100,
    applicableSettings: ['opacity', 'size', 'spacing', 'density', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'dots-large': {
    opacity: 30,
    size: 60,
    rotation: 0,
    blendMode: 'normal',
    offsetX: 0,
    offsetY: 0,
    spacing: 10,
    density: 3,
    blur: 0,
    scale: 100,
    repeat: 'repeat',
    intensity: 100,
    applicableSettings: ['opacity', 'size', 'spacing', 'density', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'diagonal-lines': {
    opacity: 15,
    size: 50,
    rotation: 45,
    blendMode: 'normal',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 2,
    blur: 0,
    scale: 100,
    repeat: 'repeat',
    intensity: 100,
    applicableSettings: ['opacity', 'rotation', 'offsetX', 'offsetY', 'spacing', 'density', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'diagonal-lines-reverse': {
    opacity: 15,
    size: 50,
    rotation: 0,
    blendMode: 'normal',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 2,
    blur: 0,
    scale: 100,
    repeat: 'repeat',
    intensity: 100,
    applicableSettings: ['opacity', 'rotation', 'offsetX', 'offsetY', 'spacing', 'density', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'crosshatch': {
    opacity: 12,
    size: 50,
    rotation: 0,
    blendMode: 'normal',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 0,
    scale: 100,
    repeat: 'repeat',
    intensity: 100,
    applicableSettings: ['opacity', 'offsetX', 'offsetY', 'density', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'circular-waves': {
    opacity: 20,
    size: 50,
    rotation: 0,
    blendMode: 'screen',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 2,
    scale: 100,
    repeat: 'repeat',
    intensity: 120,
    applicableSettings: ['opacity', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'hexagon-grid': {
    opacity: 15,
    size: 60,
    rotation: 0,
    blendMode: 'normal',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 0,
    scale: 100,
    repeat: 'repeat',
    intensity: 100,
    applicableSettings: ['opacity', 'size', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'circuit-board': {
    opacity: 12,
    size: 50,
    rotation: 0,
    blendMode: 'normal',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 0,
    scale: 100,
    repeat: 'repeat',
    intensity: 100,
    applicableSettings: ['opacity', 'size', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'noise': {
    opacity: 15,
    size: 200,
    rotation: 0,
    blendMode: 'screen',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 1,
    scale: 100,
    repeat: 'repeat',
    intensity: 80,
    applicableSettings: ['opacity', 'size', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'stars': {
    opacity: 50,
    size: 50,
    rotation: 0,
    blendMode: 'screen',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 0,
    scale: 100,
    repeat: 'repeat',
    intensity: 120,
    applicableSettings: ['opacity', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'mesh-gradient': {
    opacity: 25,
    size: 50,
    rotation: 0,
    blendMode: 'overlay',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 3,
    scale: 100,
    repeat: 'no-repeat',
    intensity: 110,
    applicableSettings: ['opacity', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'stripes-vertical': {
    opacity: 12,
    size: 20,
    rotation: 0,
    blendMode: 'normal',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 2,
    blur: 0,
    scale: 100,
    repeat: 'repeat',
    intensity: 100,
    applicableSettings: ['opacity', 'size', 'offsetX', 'offsetY', 'spacing', 'density', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'stripes-horizontal': {
    opacity: 12,
    size: 20,
    rotation: 0,
    blendMode: 'normal',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 2,
    blur: 0,
    scale: 100,
    repeat: 'repeat',
    intensity: 100,
    applicableSettings: ['opacity', 'size', 'offsetX', 'offsetY', 'spacing', 'density', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'checkerboard': {
    opacity: 12,
    size: 40,
    rotation: 0,
    blendMode: 'normal',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 0,
    scale: 100,
    repeat: 'repeat',
    intensity: 100,
    applicableSettings: ['opacity', 'size', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'ripples': {
    opacity: 20,
    size: 50,
    rotation: 0,
    blendMode: 'screen',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 2,
    scale: 100,
    repeat: 'no-repeat',
    intensity: 110,
    applicableSettings: ['opacity', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'scanlines': {
    opacity: 8,
    size: 50,
    rotation: 0,
    blendMode: 'normal',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 0,
    scale: 100,
    repeat: 'repeat',
    intensity: 100,
    applicableSettings: ['opacity', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'neon-grid': {
    opacity: 20,
    size: 50,
    rotation: 0,
    blendMode: 'normal',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 0,
    scale: 100,
    repeat: 'repeat',
    intensity: 100,
    applicableSettings: ['opacity', 'size', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'circuit-lines': {
    opacity: 25,
    size: 50,
    rotation: 0,
    blendMode: 'normal',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 0,
    scale: 100,
    repeat: 'repeat',
    intensity: 100,
    applicableSettings: ['opacity', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'data-stream': {
    opacity: 35,
    size: 50,
    rotation: 0,
    blendMode: 'screen',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 1,
    scale: 100,
    repeat: 'repeat',
    intensity: 110,
    applicableSettings: ['opacity', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'holographic': {
    opacity: 25,
    size: 50,
    rotation: 0,
    blendMode: 'overlay',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 2,
    scale: 100,
    repeat: 'no-repeat',
    intensity: 120,
    applicableSettings: ['opacity', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'quantum-dots': {
    opacity: 45,
    size: 20,
    rotation: 0,
    blendMode: 'screen',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 0,
    scale: 100,
    repeat: 'repeat',
    intensity: 130,
    applicableSettings: ['opacity', 'size', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'wave-interference': {
    opacity: 18,
    size: 50,
    rotation: 0,
    blendMode: 'screen',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 3,
    scale: 100,
    repeat: 'no-repeat',
    intensity: 110,
    applicableSettings: ['opacity', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'pixelated': {
    opacity: 12,
    size: 8,
    rotation: 0,
    blendMode: 'normal',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 0,
    scale: 100,
    repeat: 'repeat',
    intensity: 100,
    applicableSettings: ['opacity', 'size', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'tech-mesh': {
    opacity: 15,
    size: 50,
    rotation: 0,
    blendMode: 'normal',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 0,
    scale: 100,
    repeat: 'repeat',
    intensity: 100,
    applicableSettings: ['opacity', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'energy-field': {
    opacity: 25,
    size: 50,
    rotation: 0,
    blendMode: 'screen',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 4,
    scale: 100,
    repeat: 'no-repeat',
    intensity: 115,
    applicableSettings: ['opacity', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'matrix-rain': {
    opacity: 18,
    size: 50,
    rotation: 0,
    blendMode: 'normal',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 0,
    scale: 100,
    repeat: 'repeat',
    intensity: 100,
    applicableSettings: ['opacity', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  },
  'cyber-grid': {
    opacity: 25,
    size: 40,
    rotation: 0,
    blendMode: 'normal',
    offsetX: 0,
    offsetY: 0,
    spacing: 0,
    density: 1,
    blur: 0,
    scale: 100,
    repeat: 'repeat',
    intensity: 100,
    applicableSettings: ['opacity', 'size', 'offsetX', 'offsetY', 'blur', 'scale', 'repeat', 'intensity', 'color', 'blendMode']
  }
};

export const backgroundPatterns = {
  dots: {
    name: 'Dots',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.2;
      let size = options.size || 30;
      const spacing = options.spacing !== undefined ? options.spacing : 0;
      const density = options.density !== undefined ? options.density : 1;
      const scale = options.scale !== undefined ? options.scale : 1;

      // Adjust size based on spacing
      const tileSize = Math.ceil((size + spacing) * scale);
      const dotRadius = density * scale;

      const [r, g, b] = hexToRgb(color);
      const patternUrl = createPatternCanvas(tileSize, tileSize, (ctx, width, height) => {
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${patternUrl})`,
        backgroundSize: `${tileSize}px ${tileSize}px`,
      };
    },
  },
  'dots-large': {
    name: 'Large Dots',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.3;
      const size = options.size || 60;
      const scale = options.scale !== undefined ? options.scale : 1;
      const tileSize = Math.ceil(size * scale);

      const [r, g, b] = hexToRgb(color);
      const patternUrl = createPatternCanvas(tileSize, tileSize, (ctx, width, height) => {
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${patternUrl})`,
        backgroundSize: `${tileSize}px ${tileSize}px`,
      };
    },
  },
  'diagonal-lines': {
    name: 'Diagonal Lines',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.1;
      const rotation = options.rotation !== undefined ? options.rotation : 45;
      const scale = options.scale !== undefined ? options.scale : 1;
      const lineSpacing = 20 * scale;
      const lineWidth = 10 * scale;
      const tileSize = Math.ceil(lineSpacing * 2);

      const [r, g, b] = hexToRgb(color);
      const patternUrl = createPatternCanvas(tileSize, tileSize, (ctx, width, height) => {
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-width / 2, -height / 2);
        
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.lineWidth = lineWidth;
        
        // Draw repeating diagonal lines
        for (let i = -tileSize; i < tileSize * 2; i += lineSpacing) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + tileSize, tileSize);
          ctx.stroke();
        }
        
        ctx.restore();
      });

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${patternUrl})`,
        backgroundSize: `${tileSize}px ${tileSize}px`,
      };
    },
  },
  'diagonal-lines-reverse': {
    name: 'Diagonal Lines (Reverse)',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.1;
      const rotation = options.rotation !== undefined ? -45 + options.rotation : -45;
      const scale = options.scale !== undefined ? options.scale : 1;
      const lineSpacing = 20 * scale;
      const lineWidth = 10 * scale;
      const tileSize = Math.ceil(lineSpacing * 2);

      const [r, g, b] = hexToRgb(color);
      const patternUrl = createPatternCanvas(tileSize, tileSize, (ctx, width, height) => {
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-width / 2, -height / 2);
        
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.lineWidth = lineWidth;
        
        // Draw repeating diagonal lines
        for (let i = -tileSize; i < tileSize * 2; i += lineSpacing) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + tileSize, tileSize);
          ctx.stroke();
        }
        
        ctx.restore();
      });

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${patternUrl})`,
        backgroundSize: `${tileSize}px ${tileSize}px`,
      };
    },
  },
  'crosshatch': {
    name: 'Crosshatch',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.1;
      const scale = options.scale !== undefined ? options.scale : 1;
      const tileSize = Math.ceil(10 * scale);

      const [r, g, b] = hexToRgb(color);
      const patternUrl = createPatternCanvas(tileSize, tileSize, (ctx, width, height) => {
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.lineWidth = 1 * scale;
        
        // Vertical lines
        for (let x = 0; x <= width; x += tileSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= height; y += tileSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      });

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${patternUrl})`,
        backgroundSize: `${tileSize}px ${tileSize}px`,
      };
    },
  },
  'circular-waves': {
    name: 'Circular Waves',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.15;
      return {
        background: '#0a0a0a',
        backgroundImage: `
          radial-gradient(circle at 20% 50%, ${hexToRgba(color, opacity)} 0%, transparent 50%),
          radial-gradient(circle at 80% 50%, ${hexToRgba(color, opacity)} 0%, transparent 50%),
          radial-gradient(circle at 50% 20%, ${hexToRgba(color, opacity)} 0%, transparent 50%),
          radial-gradient(circle at 50% 80%, ${hexToRgba(color, opacity)} 0%, transparent 50%)
        `,
        backgroundSize: '100% 100%',
      };
    },
  },
  'hexagon-grid': {
    name: 'Hexagon Grid',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.1;
      const size = options.size || 60;
      const scale = options.scale !== undefined ? options.scale : 1;
      const tileSize = Math.ceil(size * scale);

      const [r, g, b] = hexToRgb(color);
      
      // Helper function to draw a hexagon
      const drawHexagon = (ctx, centerX, centerY, radius) => {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      };
      
      const patternUrl = createPatternCanvas(tileSize, tileSize, (ctx, width, height) => {
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.lineWidth = 1 * scale;
        
        // Draw hexagon grid pattern
        const hexRadius = tileSize / 2;
        const hexHeight = hexRadius * Math.sqrt(3);
        
        for (let y = 0; y < height + hexHeight; y += hexHeight) {
          for (let x = 0; x < width + hexRadius * 2; x += hexRadius * 3) {
            const offsetX = (y / hexHeight) % 2 === 0 ? 0 : hexRadius * 1.5;
            drawHexagon(ctx, x + offsetX, y, hexRadius);
          }
        }
      });

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${patternUrl})`,
        backgroundSize: `${tileSize}px ${tileSize}px`,
      };
    },
  },
  'circuit-board': {
    name: 'Circuit Board',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.1;
      const size = options.size || 50;
      const scale = options.scale !== undefined ? options.scale : 1;
      const tileSize = Math.ceil(size * scale);
      const smallTileSize = Math.ceil((size / 5) * scale);

      const [r, g, b] = hexToRgb(color);
      const patternUrl = createPatternCanvas(tileSize, tileSize, (ctx, width, height) => {
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.lineWidth = 1 * scale;
        
        // Main grid
        for (let x = 0; x <= width; x += tileSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y <= height; y += tileSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        
        // Fine grid overlay
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.5})`;
        for (let x = 0; x <= width; x += smallTileSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y <= height; y += smallTileSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      });

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${patternUrl})`,
        backgroundSize: `${tileSize}px ${tileSize}px`,
      };
    },
  },
  'noise': {
    name: 'Noise',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.1;
      const size = options.size || 200;
      const scale = options.scale !== undefined ? options.scale : 1;
      const tileSize = Math.ceil(size * scale);
      
      // Create a canvas for noise with color tinting
      const [r, g, b] = hexToRgb(color);
      const patternUrl = createPatternCanvas(tileSize, tileSize, (ctx, width, height) => {
        const imageData = ctx.createImageData(width, height);

        for (let i = 0; i < imageData.data.length; i += 4) {
          const noiseValue = Math.random();
          // Apply color tint to noise
          imageData.data[i] = r * noiseValue;     // R
          imageData.data[i + 1] = g * noiseValue; // G
          imageData.data[i + 2] = b * noiseValue; // B
          imageData.data[i + 3] = opacity * 255;   // A
        }

        ctx.putImageData(imageData, 0, 0);
      });

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${patternUrl})`,
        backgroundSize: `${tileSize}px ${tileSize}px`,
        backgroundRepeat: 'repeat',
      };
    },
  },
  'stars': {
    name: 'Stars',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.4;
      return {
        background: '#0a0a0a',
        backgroundImage: `
          radial-gradient(circle 2px at 20% 30%, ${hexToRgba(color, opacity)}, transparent),
          radial-gradient(circle 2px at 60% 70%, ${hexToRgba(color, opacity)}, transparent),
          radial-gradient(circle 1px at 50% 50%, ${hexToRgba(color, opacity * 1.5)}, transparent),
          radial-gradient(circle 1px at 80% 10%, ${hexToRgba(color, opacity * 1.5)}, transparent),
          radial-gradient(circle 2px at 90% 60%, ${hexToRgba(color, opacity)}, transparent),
          radial-gradient(circle 1px at 33% 80%, ${hexToRgba(color, opacity * 1.5)}, transparent),
          radial-gradient(circle 1px at 70% 40%, ${hexToRgba(color, opacity * 1.5)}, transparent),
          radial-gradient(circle 1.5px at 10% 50%, ${hexToRgba(color, opacity)}, transparent),
          radial-gradient(circle 1.5px at 40% 20%, ${hexToRgba(color, opacity)}, transparent),
          radial-gradient(circle 2px at 75% 90%, ${hexToRgba(color, opacity)}, transparent)
        `,
        backgroundSize: '200% 200%',
      };
    },
  },
  'mesh-gradient': {
    name: 'Mesh Gradient',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.2;
      return {
        background: '#0a0a0a',
        backgroundImage: `
          radial-gradient(at 0% 0%, ${hexToRgba(color, opacity)} 0px, transparent 50%),
          radial-gradient(at 100% 0%, ${hexToRgba(color, opacity * 0.75)} 0px, transparent 50%),
          radial-gradient(at 100% 100%, ${hexToRgba(color, opacity)} 0px, transparent 50%),
          radial-gradient(at 0% 100%, ${hexToRgba(color, opacity * 0.75)} 0px, transparent 50%)
        `,
      };
    },
  },
  'stripes-vertical': {
    name: 'Vertical Stripes',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.1;
      const size = options.size || 20;
      const scale = options.scale !== undefined ? options.scale : 1;
      const tileSize = Math.ceil(size * scale);
      const stripeWidth = 2 * scale;

      const [r, g, b] = hexToRgb(color);
      const patternUrl = createPatternCanvas(tileSize, tileSize, (ctx, width, height) => {
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        for (let x = 0; x < width; x += tileSize) {
          ctx.fillRect(x, 0, stripeWidth, height);
        }
      });

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${patternUrl})`,
        backgroundSize: `${tileSize}px ${tileSize}px`,
      };
    },
  },
  'stripes-horizontal': {
    name: 'Horizontal Stripes',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.1;
      const size = options.size || 20;
      const scale = options.scale !== undefined ? options.scale : 1;
      const tileSize = Math.ceil(size * scale);
      const stripeWidth = 2 * scale;

      const [r, g, b] = hexToRgb(color);
      const patternUrl = createPatternCanvas(tileSize, tileSize, (ctx, width, height) => {
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        for (let y = 0; y < height; y += tileSize) {
          ctx.fillRect(0, y, width, stripeWidth);
        }
      });

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${patternUrl})`,
        backgroundSize: `${tileSize}px ${tileSize}px`,
      };
    },
  },
  'checkerboard': {
    name: 'Checkerboard',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.1;
      const size = options.size || 40;
      const scale = options.scale !== undefined ? options.scale : 1;
      const tileSize = Math.ceil(size * scale);
      const squareSize = Math.ceil(tileSize / 2);

      const [r, g, b] = hexToRgb(color);
      const patternUrl = createPatternCanvas(tileSize, tileSize, (ctx, width, height) => {
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        // Create checkerboard pattern
        for (let y = 0; y < height; y += squareSize) {
          for (let x = 0; x < width; x += squareSize) {
            if ((x / squareSize + y / squareSize) % 2 === 0) {
              ctx.fillRect(x, y, squareSize, squareSize);
            }
          }
        }
      });

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${patternUrl})`,
        backgroundSize: `${tileSize}px ${tileSize}px`,
      };
    },
  },
  'ripples': {
    name: 'Ripples',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.15;
      return {
        background: '#0a0a0a',
        backgroundImage: `
          radial-gradient(circle at 25% 25%, ${hexToRgba(color, opacity)} 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, ${hexToRgba(color, opacity)} 0%, transparent 50%)
        `,
        backgroundSize: '100% 100%',
      };
    },
  },
  'scanlines': {
    name: 'Scanlines',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.05;
      const scale = options.scale !== undefined ? options.scale : 1;
      const tileSize = Math.ceil(4 * scale);
      const lineHeight = 2 * scale;

      const [r, g, b] = hexToRgb(color);
      const patternUrl = createPatternCanvas(tileSize, tileSize, (ctx, width, height) => {
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        for (let y = 0; y < height; y += tileSize) {
          ctx.fillRect(0, y, width, lineHeight);
        }
      });

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${patternUrl})`,
        backgroundSize: `${tileSize}px ${tileSize}px`,
      };
    },
  },
  'neon-grid': {
    name: 'Neon Grid',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.15;
      const size = options.size || 50;
      const scale = options.scale !== undefined ? options.scale : 1;
      const tileSize = Math.ceil(size * scale);

      const [r, g, b] = hexToRgb(color);
      const patternUrl = createPatternCanvas(tileSize, tileSize, (ctx, width, height) => {
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.lineWidth = 1 * scale;
        
        // Vertical lines
        for (let x = 0; x <= width; x += tileSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= height; y += tileSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      });

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${patternUrl})`,
        backgroundSize: `${tileSize}px ${tileSize}px`,
      };
    },
  },
  'circuit-lines': {
    name: 'Circuit Lines',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.2;
      const scale = options.scale !== undefined ? options.scale : 1;
      const tileSize = Math.ceil(40 * scale);
      const dotTileSize = Math.ceil(200 * scale);

      const [r, g, b] = hexToRgb(color);
      const patternUrl = createPatternCanvas(tileSize, tileSize, (ctx, width, height) => {
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.lineWidth = 1 * scale;
        
        // Grid lines
        for (let x = 0; x <= width; x += tileSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y <= height; y += tileSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        
        // Dots at some intersections (sparse pattern)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 1.5})`;
        const dotSpacing = dotTileSize;
        for (let x = 0; x < width + dotSpacing; x += dotSpacing) {
          for (let y = 0; y < height + dotSpacing; y += dotSpacing) {
            if ((x + y) % (dotSpacing * 2) === 0) {
              ctx.beginPath();
              ctx.arc(x % width, y % height, 2 * scale, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      });

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${patternUrl})`,
        backgroundSize: `${tileSize}px ${tileSize}px`,
      };
    },
  },
  'data-stream': {
    name: 'Data Stream',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.3;
      const scale = options.scale !== undefined ? options.scale : 1;
      const tileSize = Math.ceil(20 * scale);
      const lineSpacing = 4 * scale;
      const lineWidth = 2 * scale;

      const [r, g, b] = hexToRgb(color);
      const patternUrl = createPatternCanvas(tileSize, tileSize, (ctx, width, height) => {
        // Horizontal lines
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        for (let x = 0; x < width; x += lineSpacing) {
          ctx.fillRect(x, 0, lineWidth, height);
        }
        
        // Vertical lines (sparse)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.5})`;
        for (let y = 0; y < height; y += tileSize) {
          ctx.fillRect(0, y, width, lineWidth);
        }
      });

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${patternUrl})`,
        backgroundSize: `${tileSize}px ${tileSize}px`,
      };
    },
  },
  'holographic': {
    name: 'Holographic',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.2;
      // Create a rainbow/holographic effect with multiple color shifts
      const hex = color.replace('#', '');
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      // Create shifted colors for holographic rainbow effect
      const color1 = hexToRgba(color, opacity);
      const color2 = hexToRgba(`#${Math.min(255, r + 60).toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${Math.min(255, b + 60).toString(16).padStart(2, '0')}`, opacity * 0.9);
      const color3 = hexToRgba(`#${r.toString(16).padStart(2, '0')}${Math.min(255, g + 60).toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`, opacity * 0.7);
      const color4 = hexToRgba(`#${Math.min(255, r + 40).toString(16).padStart(2, '0')}${Math.min(255, g + 40).toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`, opacity * 0.8);

      return {
        background: '#0a0a0a',
        backgroundImage: `
          repeating-linear-gradient(45deg, ${color1} 0%, ${color2} 20%, ${color3} 40%, ${color4} 60%, ${color1} 80%, ${color1} 100%),
          repeating-linear-gradient(135deg, ${color2} 0%, ${color3} 20%, ${color4} 40%, ${color1} 60%, ${color2} 80%, ${color2} 100%),
          repeating-linear-gradient(90deg, ${color1} 0%, transparent 2%, ${color2} 4%, transparent 6%, ${color3} 8%, transparent 10%)
        `,
        backgroundSize: '150px 150px, 150px 150px, 100px 100px',
        backgroundPosition: '0 0, 75px 75px, 0 0',
      };
    },
  },
  'quantum-dots': {
    name: 'Quantum Dots',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.4;
      const size = options.size || 20;
      return {
        background: '#0a0a0a',
        backgroundImage: `
          radial-gradient(circle at 10% 20%, ${hexToRgba(color, opacity)} 1px, transparent 1px),
          radial-gradient(circle at 30% 40%, ${hexToRgba(color, opacity)} 1px, transparent 1px),
          radial-gradient(circle at 50% 60%, ${hexToRgba(color, opacity)} 1px, transparent 1px),
          radial-gradient(circle at 70% 80%, ${hexToRgba(color, opacity)} 1px, transparent 1px),
          radial-gradient(circle at 90% 30%, ${hexToRgba(color, opacity)} 1px, transparent 1px)
        `,
        backgroundSize: `${size * 2}px ${size * 2}px`,
      };
    },
  },
  'wave-interference': {
    name: 'Wave Interference',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.15;
      return {
        background: '#0a0a0a',
        backgroundImage: `
          radial-gradient(ellipse at 0% 0%, ${hexToRgba(color, opacity)} 0%, transparent 50%),
          radial-gradient(ellipse at 100% 100%, ${hexToRgba(color, opacity)} 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, ${hexToRgba(color, opacity * 0.7)} 0%, transparent 70%)
        `,
        backgroundSize: '150% 150%, 150% 150%, 200% 200%',
      };
    },
  },
  'pixelated': {
    name: 'Pixelated',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.1;
      const size = options.size || 8;
      const scale = options.scale !== undefined ? options.scale : 1;
      const tileSize = Math.ceil(size * scale);
      const squareSize = Math.ceil(tileSize / 2);

      const [r, g, b] = hexToRgb(color);
      const patternUrl = createPatternCanvas(tileSize, tileSize, (ctx, width, height) => {
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        // Create pixelated checkerboard pattern
        for (let y = 0; y < height; y += squareSize) {
          for (let x = 0; x < width; x += squareSize) {
            if ((x / squareSize + y / squareSize) % 2 === 0) {
              ctx.fillRect(x, y, squareSize, squareSize);
            }
          }
        }
      });

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${patternUrl})`,
        backgroundSize: `${tileSize}px ${tileSize}px`,
      };
    },
  },
  'tech-mesh': {
    name: 'Tech Mesh',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.12;
      const size = options.size || 30;
      const scale = options.scale !== undefined ? options.scale : 1;
      const tileSize = Math.ceil(size * scale);

      const [r, g, b] = hexToRgb(color);
      const patternUrl = createPatternCanvas(tileSize, tileSize, (ctx, width, height) => {
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.lineWidth = 1 * scale;
        
        // Grid lines
        for (let x = 0; x <= width; x += tileSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y <= height; y += tileSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        
        // Dots at intersections
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.8})`;
        for (let x = 0; x <= width; x += tileSize) {
          for (let y = 0; y <= height; y += tileSize) {
            ctx.beginPath();
            ctx.arc(x, y, 2 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${patternUrl})`,
        backgroundSize: `${tileSize}px ${tileSize}px`,
      };
    },
  },
  'energy-field': {
    name: 'Energy Field',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.2;
      return {
        background: '#0a0a0a',
        backgroundImage: `
          radial-gradient(circle at 20% 30%, ${hexToRgba(color, opacity)} 0%, transparent 40%),
          radial-gradient(circle at 80% 70%, ${hexToRgba(color, opacity)} 0%, transparent 40%),
          radial-gradient(circle at 50% 50%, ${hexToRgba(color, opacity * 0.6)} 0%, transparent 60%)
        `,
        backgroundSize: '100% 100%',
      };
    },
  },
  'matrix-rain': {
    name: 'Matrix Rain',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.15;
      const scale = options.scale !== undefined ? options.scale : 1;
      const tileSize = Math.ceil(20 * scale);
      const lineSpacing = 4 * scale;
      const lineWidth = 2 * scale;

      const [r, g, b] = hexToRgb(color);
      const patternUrl = createPatternCanvas(tileSize, tileSize, (ctx, width, height) => {
        // Vertical lines (primary)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        for (let x = 0; x < width; x += lineSpacing) {
          ctx.fillRect(x, 0, lineWidth, height);
        }
        
        // Secondary vertical lines (sparse)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.5})`;
        for (let x = 0; x < width; x += tileSize) {
          ctx.fillRect(x, 0, lineWidth, height);
        }
      });

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${patternUrl})`,
        backgroundSize: `${tileSize}px ${tileSize}px`,
      };
    },
  },
  'cyber-grid': {
    name: 'Cyber Grid',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.2;
      const size = options.size || 40;
      const scale = options.scale !== undefined ? options.scale : 1;
      const tileSize = Math.ceil(size * scale);
      const smallTileSize = Math.ceil((size / 4) * scale);

      const [r, g, b] = hexToRgb(color);
      const patternUrl = createPatternCanvas(tileSize, tileSize, (ctx, width, height) => {
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.lineWidth = 1 * scale;
        
        // Main grid
        for (let x = 0; x <= width; x += tileSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y <= height; y += tileSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        
        // Fine grid overlay
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.5})`;
        for (let x = 0; x <= width; x += smallTileSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y <= height; y += smallTileSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      });

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${patternUrl})`,
        backgroundSize: `${tileSize}px ${tileSize}px`,
      };
    },
  },
};

/**
 * Apply background pattern to element
 * @param {HTMLElement} element - Element to apply pattern to
 * @param {string} patternKey - Pattern key from backgroundPatterns
 * @param {string} color - Color to use for pattern
 * @param {Object} options - Customization options (opacity, size, rotation, etc.)
 */
export function applyBackgroundPattern(element, patternKey, color, options = {}) {
  console.log('[applyBackgroundPattern] Called with:', { patternKey, color, options });

  if (!backgroundPatterns[patternKey]) {
    console.warn(`Pattern "${patternKey}" not found`);
    return;
  }

  const pattern = backgroundPatterns[patternKey].create(color, options);
  console.log('[applyBackgroundPattern] Pattern object:', pattern);

  // Ensure we have a valid pattern object
  if (!pattern || typeof pattern !== 'object') {
    console.error(`Pattern "${patternKey}" did not return a valid pattern object`);
    return;
  }

  // Apply pattern styles - use setProperty with 'important' to ensure they override any CSS
  Object.keys(pattern).forEach(key => {
    // Convert camelCase to kebab-case (e.g., backgroundImage -> background-image)
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    const value = pattern[key];
    if (value !== undefined && value !== null && value !== '') {
      console.log(`[applyBackgroundPattern] Setting ${cssKey} = ${value}`);
      element.style.setProperty(cssKey, value, 'important');
    }
  });

  // Verify styles were applied
  console.log('[applyBackgroundPattern] After application:', {
    background: element.style.background,
    backgroundImage: element.style.backgroundImage,
    backgroundSize: element.style.backgroundSize,
    computedBackground: window.getComputedStyle(element).background,
    computedBackgroundImage: window.getComputedStyle(element).backgroundImage
  });

  // Apply blend mode
  if (options.blendMode && options.blendMode !== 'normal') {
    element.style.mixBlendMode = options.blendMode;
  } else {
    element.style.mixBlendMode = 'normal';
  }

  // Apply offset using backgroundPosition
  if (options.offsetX !== undefined || options.offsetY !== undefined) {
    const offsetX = options.offsetX !== undefined ? options.offsetX : 0;
    const offsetY = options.offsetY !== undefined ? options.offsetY : 0;
    element.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
  }

  // Apply blur using filter
  if (options.blur !== undefined && options.blur > 0) {
    const existingFilter = element.style.filter || '';
    const blurFilter = `blur(${options.blur}px)`;
    element.style.filter = existingFilter ? `${existingFilter} ${blurFilter}` : blurFilter;
  } else if (options.blur === 0 || options.blur === undefined) {
    // Remove blur if set to 0
    const existingFilter = element.style.filter || '';
    if (existingFilter.includes('blur')) {
      element.style.filter = existingFilter.replace(/blur\([^)]+\)/g, '').trim();
      if (!element.style.filter) {
        element.style.filter = 'none';
      }
    }
  }

  // Apply scale - scale the background size
  // Note: Scale should be applied to the pattern's base size
  if (options.scale !== undefined && options.scale !== 1) {
    const scale = options.scale;
    // Get the backgroundSize from the pattern object (before it was applied)
    const patternSize = pattern.backgroundSize;
    // If not in pattern object, get from element (after it was applied)
    const currentSize = patternSize || element.style.getPropertyValue('background-size') || element.style.backgroundSize;

    if (currentSize && currentSize !== '') {
      // Try to parse and scale if it's in pixels (e.g., "30px 30px" or "30px")
      const sizeMatches = currentSize.match(/(\d+(?:\.\d+)?)px/g);
      if (sizeMatches && sizeMatches.length > 0) {
        const scaledSizes = sizeMatches.map(size => {
          const value = parseFloat(size);
          return `${value * scale}px`;
        });
        element.style.setProperty('background-size', scaledSizes.join(' '), 'important');
      } else if (currentSize.includes('%')) {
        // For percentage, convert to a scaled percentage
        const percentMatch = currentSize.match(/(\d+(?:\.\d+)?)%/g);
        if (percentMatch && percentMatch.length > 0) {
          const scaledPercents = percentMatch.map(percent => {
            const value = parseFloat(percent);
            return `${value * scale}%`;
          });
          element.style.setProperty('background-size', scaledPercents.join(' '), 'important');
        }
      } else if (currentSize.includes(',')) {
        // Handle multiple background sizes (e.g., "30px 30px, 10px 10px")
        const sizes = currentSize.split(',').map(s => s.trim());
        const scaledSizes = sizes.map(sizeStr => {
          const pxMatches = sizeStr.match(/(\d+(?:\.\d+)?)px/g);
          if (pxMatches) {
            return pxMatches.map(px => {
              const value = parseFloat(px);
              return `${value * scale}px`;
            }).join(' ');
          }
          const percentMatches = sizeStr.match(/(\d+(?:\.\d+)?)%/g);
          if (percentMatches) {
            return percentMatches.map(pct => {
              const value = parseFloat(pct);
              return `${value * scale}%`;
            }).join(' ');
          }
          return sizeStr; // Return as-is if we can't parse it
        });
        element.style.setProperty('background-size', scaledSizes.join(', '), 'important');
      }
    }
  }

  // Apply repeat
  if (options.repeat) {
    element.style.setProperty('background-repeat', options.repeat, 'important');
  }
}


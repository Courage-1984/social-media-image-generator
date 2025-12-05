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

      // Adjust size based on spacing
      size = size + spacing;

      return {
        background: '#0a0a0a',
        backgroundImage: `radial-gradient(circle, ${hexToRgba(color, opacity)} ${density}px, transparent ${density}px)`,
        backgroundSize: `${size}px ${size}px`,
      };
    },
  },
  'dots-large': {
    name: 'Large Dots',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.3;
      const size = options.size || 60;
      return {
        background: '#0a0a0a',
        backgroundImage: `radial-gradient(circle, ${hexToRgba(color, opacity)} 2px, transparent 2px)`,
        backgroundSize: `${size}px ${size}px`,
      };
    },
  },
  'diagonal-lines': {
    name: 'Diagonal Lines',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.1;
      const rotation = options.rotation !== undefined ? options.rotation : 45;
      return {
        background: '#0a0a0a',
        backgroundImage: `repeating-linear-gradient(${rotation}deg, transparent, transparent 10px, ${hexToRgba(color, opacity)} 10px, ${hexToRgba(color, opacity)} 20px)`,
      };
    },
  },
  'diagonal-lines-reverse': {
    name: 'Diagonal Lines (Reverse)',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.1;
      const rotation = options.rotation !== undefined ? -45 + options.rotation : -45;
      return {
        background: '#0a0a0a',
        backgroundImage: `repeating-linear-gradient(${rotation}deg, transparent, transparent 10px, ${hexToRgba(color, opacity)} 10px, ${hexToRgba(color, opacity)} 20px)`,
      };
    },
  },
  'crosshatch': {
    name: 'Crosshatch',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.1;
      return {
        background: '#0a0a0a',
        backgroundImage: `
          repeating-linear-gradient(0deg, ${hexToRgba(color, opacity)} 0px, ${hexToRgba(color, opacity)} 1px, transparent 1px, transparent 10px),
          repeating-linear-gradient(90deg, ${hexToRgba(color, opacity)} 0px, ${hexToRgba(color, opacity)} 1px, transparent 1px, transparent 10px)
        `,
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
      return {
        background: '#0a0a0a',
        backgroundImage: `
          linear-gradient(30deg, ${hexToRgba(color, opacity)} 12%, transparent 12.5%, transparent 87%, ${hexToRgba(color, opacity)} 87.5%, ${hexToRgba(color, opacity)}),
          linear-gradient(150deg, ${hexToRgba(color, opacity)} 12%, transparent 12.5%, transparent 87%, ${hexToRgba(color, opacity)} 87.5%, ${hexToRgba(color, opacity)}),
          linear-gradient(90deg, ${hexToRgba(color, opacity)} 12%, transparent 12.5%, transparent 87%, ${hexToRgba(color, opacity)} 87.5%, ${hexToRgba(color, opacity)})
        `,
        backgroundSize: `${size}px ${size}px`,
      };
    },
  },
  'circuit-board': {
    name: 'Circuit Board',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.1;
      const size = options.size || 50;
      return {
        background: '#0a0a0a',
        backgroundImage: `
          linear-gradient(${hexToRgba(color, opacity)} 1px, transparent 1px),
          linear-gradient(90deg, ${hexToRgba(color, opacity)} 1px, transparent 1px),
          linear-gradient(${hexToRgba(color, opacity * 0.5)} 1px, transparent 1px),
          linear-gradient(90deg, ${hexToRgba(color, opacity * 0.5)} 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px, ${size}px ${size}px, ${size / 5}px ${size / 5}px, ${size / 5}px ${size / 5}px`,
      };
    },
  },
  'noise': {
    name: 'Noise',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.1;
      const size = options.size || 200;
      // Create a canvas for noise with color tinting
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.createImageData(size, size);

      // Parse color to RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      for (let i = 0; i < imageData.data.length; i += 4) {
        const noiseValue = Math.random();
        // Apply color tint to noise
        imageData.data[i] = r * noiseValue;     // R
        imageData.data[i + 1] = g * noiseValue; // G
        imageData.data[i + 2] = b * noiseValue; // B
        imageData.data[i + 3] = opacity * 255;   // A
      }

      ctx.putImageData(imageData, 0, 0);

      return {
        background: '#0a0a0a',
        backgroundImage: `url(${canvas.toDataURL()})`,
        backgroundSize: `${size}px ${size}px`,
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
      // 0deg = vertical (top to bottom) in repeating-linear-gradient
      return {
        background: '#0a0a0a',
        backgroundImage: `repeating-linear-gradient(0deg, ${hexToRgba(color, opacity)} 0px, ${hexToRgba(color, opacity)} 2px, transparent 2px, transparent ${size}px)`,
      };
    },
  },
  'stripes-horizontal': {
    name: 'Horizontal Stripes',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.1;
      const size = options.size || 20;
      // 90deg = horizontal (left to right) in repeating-linear-gradient
      return {
        background: '#0a0a0a',
        backgroundImage: `repeating-linear-gradient(90deg, ${hexToRgba(color, opacity)} 0px, ${hexToRgba(color, opacity)} 2px, transparent 2px, transparent ${size}px)`,
      };
    },
  },
  'checkerboard': {
    name: 'Checkerboard',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.1;
      const size = options.size || 40;
      return {
        background: '#0a0a0a',
        backgroundImage: `
          linear-gradient(45deg, ${hexToRgba(color, opacity)} 25%, transparent 25%),
          linear-gradient(-45deg, ${hexToRgba(color, opacity)} 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, ${hexToRgba(color, opacity)} 75%),
          linear-gradient(-45deg, transparent 75%, ${hexToRgba(color, opacity)} 75%)
        `,
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: '0 0, 0 ' + (size / 2) + 'px, ' + (size / 2) + 'px -' + (size / 2) + 'px, -' + (size / 2) + 'px 0px',
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
      return {
        background: '#0a0a0a',
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${hexToRgba(color, opacity)} 2px, ${hexToRgba(color, opacity)} 4px)`,
      };
    },
  },
  'neon-grid': {
    name: 'Neon Grid',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.15;
      const size = options.size || 50;
      return {
        background: '#0a0a0a',
        backgroundImage: `
          linear-gradient(${hexToRgba(color, opacity)} 1px, transparent 1px),
          linear-gradient(90deg, ${hexToRgba(color, opacity)} 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
      };
    },
  },
  'circuit-lines': {
    name: 'Circuit Lines',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.2;
      return {
        background: '#0a0a0a',
        backgroundImage: `
          linear-gradient(${hexToRgba(color, opacity)} 1px, transparent 1px),
          linear-gradient(90deg, ${hexToRgba(color, opacity)} 1px, transparent 1px),
          radial-gradient(circle at 25% 25%, ${hexToRgba(color, opacity * 1.5)} 2px, transparent 2px),
          radial-gradient(circle at 75% 75%, ${hexToRgba(color, opacity * 1.5)} 2px, transparent 2px)
        `,
        backgroundSize: '40px 40px, 40px 40px, 200px 200px, 200px 200px',
      };
    },
  },
  'data-stream': {
    name: 'Data Stream',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.3;
      return {
        background: '#0a0a0a',
        backgroundImage: `
          repeating-linear-gradient(90deg, transparent, transparent 2px, ${hexToRgba(color, opacity)} 2px, ${hexToRgba(color, opacity)} 4px),
          repeating-linear-gradient(0deg, transparent, transparent 8px, ${hexToRgba(color, opacity * 0.5)} 8px, ${hexToRgba(color, opacity * 0.5)} 10px)
        `,
        backgroundSize: '100% 100%, 20px 20px',
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
      return {
        background: '#0a0a0a',
        backgroundImage: `
          linear-gradient(45deg, ${hexToRgba(color, opacity)} 25%, transparent 25%),
          linear-gradient(-45deg, ${hexToRgba(color, opacity)} 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, ${hexToRgba(color, opacity)} 75%),
          linear-gradient(-45deg, transparent 75%, ${hexToRgba(color, opacity)} 75%)
        `,
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: '0 0, 0 0, 0 0, 0 0',
      };
    },
  },
  'tech-mesh': {
    name: 'Tech Mesh',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.12;
      const size = options.size || 30;
      return {
        background: '#0a0a0a',
        backgroundImage: `
          linear-gradient(${hexToRgba(color, opacity)} 1px, transparent 1px),
          linear-gradient(90deg, ${hexToRgba(color, opacity)} 1px, transparent 1px),
          radial-gradient(circle 2px at 25% 25%, ${hexToRgba(color, opacity * 0.8)}, transparent),
          radial-gradient(circle 2px at 75% 75%, ${hexToRgba(color, opacity * 0.8)}, transparent),
          radial-gradient(circle 1.5px at 50% 50%, ${hexToRgba(color, opacity * 0.6)}, transparent)
        `,
        backgroundSize: `${size}px ${size}px, ${size}px ${size}px, ${size * 2}px ${size * 2}px, ${size * 2}px ${size * 2}px, ${size * 3}px ${size * 3}px`,
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
      return {
        background: '#0a0a0a',
        backgroundImage: `
          repeating-linear-gradient(90deg, transparent, transparent 2px, ${hexToRgba(color, opacity)} 2px, ${hexToRgba(color, opacity)} 4px),
          repeating-linear-gradient(90deg, transparent, transparent 8px, ${hexToRgba(color, opacity * 0.5)} 8px, ${hexToRgba(color, opacity * 0.5)} 10px)
        `,
        backgroundSize: '100% 100%, 100% 100%',
      };
    },
  },
  'cyber-grid': {
    name: 'Cyber Grid',
    create: (color, options = {}) => {
      const opacity = options.opacity !== undefined ? options.opacity : 0.2;
      const size = options.size || 40;
      return {
        background: '#0a0a0a',
        backgroundImage: `
          linear-gradient(${hexToRgba(color, opacity)} 1px, transparent 1px),
          linear-gradient(90deg, ${hexToRgba(color, opacity)} 1px, transparent 1px),
          linear-gradient(${hexToRgba(color, opacity * 0.5)} 1px, transparent 1px),
          linear-gradient(90deg, ${hexToRgba(color, opacity * 0.5)} 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px, ${size}px ${size}px, ${size / 4}px ${size / 4}px, ${size / 4}px ${size / 4}px`,
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


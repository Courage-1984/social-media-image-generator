/**
 * Configuration
 * Color palette, presets, and constants
 */

export const IMAGE_TYPES = {
  OG: {
    name: 'OG Image',
    width: 1200,
    height: 630,
    aspectRatio: '1.91:1',
  },
  TWITTER: {
    name: 'Twitter Card',
    width: 1200,
    height: 675,
    aspectRatio: '16:9',
  },
};

export const colorPalette = {
  cyan: { hex: '#00ffff', name: 'Cyan' },
  'cyan-dark': { hex: '#00cccc', name: 'Cyan Dark' },
  magenta: { hex: '#ff00ff', name: 'Magenta' },
  'magenta-light': { hex: '#ed12ff', name: 'Magenta Light' },
  'magenta-dark': { hex: '#cc00cc', name: 'Magenta Dark' },
  green: { hex: '#00ff00', name: 'Green' },
  'green-dark': { hex: '#00cc00', name: 'Green Dark' },
  blue: { hex: '#0066ff', name: 'Blue' },
  'blue-dark': { hex: '#0052cc', name: 'Blue Dark' },
  pink: { hex: '#ff0080', name: 'Pink' },
  'pink-dark': { hex: '#cc0066', name: 'Pink Dark' },
  yellow: { hex: '#ffff00', name: 'Yellow' },
  gold: { hex: '#ffb347', name: 'Gold' },
  white: { hex: '#ffffff', name: 'White' },
  'text-secondary': { hex: '#b0b0b0', name: 'Light Gray' },
  'text-muted': { hex: '#666666', name: 'Gray' },
};

export const glowColors = {
  cyan: 'rgba(0, 255, 255, 0.5)',
  magenta: 'rgba(255, 0, 255, 0.5)',
  green: 'rgba(0, 255, 0, 0.5)',
  blue: 'rgba(0, 102, 255, 0.5)',
  pink: 'rgba(255, 0, 128, 0.5)',
  yellow: 'rgba(255, 255, 0, 0.5)',
  gold: 'rgba(255, 179, 71, 0.45)',
  white: 'rgba(255, 255, 255, 0.3)',
};

export const presets = {
  hero: {
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
    hasBlobs: true,
    hasParticles: false,
    hasGrid: false,
    hasWaves: false,
    hasMatrix: false,
  },
  service: {
    bg: '#1a1a2e',
    border: '2px solid rgba(0, 255, 255, 0.2)',
    hasBlobs: false,
    hasParticles: false,
    hasGrid: false,
    hasWaves: false,
    hasMatrix: false,
  },
  minimal: {
    bg: '#0a0a0a',
    hasBlobs: false,
    hasParticles: false,
    hasGrid: false,
    hasWaves: false,
    hasMatrix: false,
  },
  gradient: {
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0a0a0a 100%)',
    hasBlobs: false,
    hasParticles: false,
    hasGrid: false,
    hasWaves: false,
    hasMatrix: false,
  },
  particles: {
    bg: '#0a0a0a',
    hasBlobs: false,
    hasParticles: true,
    hasGrid: false,
    hasWaves: false,
    hasMatrix: false,
  },
  cyberpunk: {
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 30%, #16213e 60%, #1a1a2e 100%)',
    hasBlobs: true,
    hasParticles: true,
    hasGrid: true,
    hasWaves: false,
    hasMatrix: false,
  },
  neon: {
    bg: '#0a0a0a',
    hasBlobs: false,
    hasParticles: false,
    hasGrid: true,
    hasWaves: false,
    hasMatrix: false,
  },
  geometric: {
    bg: 'linear-gradient(45deg, #0a0a0a 25%, #1a1a2e 25%, #1a1a2e 50%, #0a0a0a 50%, #0a0a0a 75%, #1a1a2e 75%)',
    backgroundSize: '40px 40px',
    hasBlobs: false,
    hasParticles: false,
    hasGrid: false,
    hasWaves: false,
    hasMatrix: false,
  },
  wave: {
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
    hasBlobs: false,
    hasParticles: false,
    hasGrid: false,
    hasWaves: true,
    hasMatrix: false,
  },
  matrix: {
    bg: '#0a0a0a',
    hasBlobs: false,
    hasParticles: false,
    hasGrid: false,
    hasWaves: false,
    hasMatrix: true,
  },
  dark: {
    bg: '#000000',
    hasBlobs: false,
    hasParticles: false,
    hasGrid: false,
    hasWaves: false,
    hasMatrix: false,
  },
  space: {
    bg: 'linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #1a1a2e 100%)',
    hasBlobs: true,
    hasParticles: true,
    hasGrid: false,
    hasWaves: false,
    hasMatrix: false,
  },
  glow: {
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #001a1a 50%, #0a0a0a 100%)',
    hasBlobs: true,
    hasParticles: false,
    hasGrid: false,
    hasWaves: false,
    hasMatrix: false,
  },
  tech: {
    bg: 'linear-gradient(45deg, #0a0a0a 0%, #16213e 50%, #0a0a0a 100%)',
    hasBlobs: false,
    hasParticles: false,
    hasGrid: true,
    hasWaves: false,
    hasMatrix: false,
  },
  electric: {
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #003333 30%, #0a0a0a 60%, #003333 90%, #0a0a0a 100%)',
    hasBlobs: true,
    hasParticles: true,
    hasGrid: true,
    hasWaves: false,
    hasMatrix: false,
  },
  void: {
    bg: 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a0a 50%, #000000 100%)',
    hasBlobs: true,
    hasParticles: false,
    hasGrid: false,
    hasWaves: true,
    hasMatrix: false,
  },
};

export const logoPositions = [
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
  'hidden',
];

export const logoPositionLabels = {
  'top-left': 'Top Left',
  'top-center': 'Top Center',
  'top-right': 'Top Right',
  'center-left': 'Center Left',
  'center': 'Center',
  'center-right': 'Center Right',
  'bottom-left': 'Bottom Left',
  'bottom-center': 'Bottom Center',
  'bottom-right': 'Bottom Right',
  'hidden': 'Hidden',
};


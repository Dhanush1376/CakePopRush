import { describe, it, expect } from 'vitest';

/**
 * HEX Color & Contrast Validation Suite
 * Verifies color fidelity, WCAG accessibility, and visual border distinction
 * for custom order builder cards and UI components.
 */

// Core Design System HEX Palette
export const HEX_THEME = {
  // Brand & Accent
  brandPink: '#F20D6F',
  brandPinkDark: '#D90860',
  brandPinkLight: '#FFF0F5',
  
  // Card & Border Colors (matching user's screenshot)
  cardBorder: '#FFCCD8',
  cardBorderHover: '#F20D6F',
  cardBg: '#FFFFFF',
  containerBg: '#FAF7F5',
  stepCardBorder: '#F0D5DA',
  
  // Typography
  textPrimary: '#381E10',
  textMuted: '#8E7A6E',
  
  // Badges & Status
  badgeBg: '#FFF0F5',
  badgeBorder: '#FFAEC8',
  badgeText: '#F20D6F',
  
  // Controls
  inputBorder: '#E0D2CB',
  inputFocusBorder: '#F20D6F',
};

// Helper: Convert HEX to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
}

// Helper: Calculate relative luminance
function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const normalize = (val: number) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * normalize(rgb.r) + 0.7152 * normalize(rgb.g) + 0.0722 * normalize(rgb.b);
}

// Helper: Calculate contrast ratio between two HEX colors
function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hexToRgb(hex1));
  const l2 = getRelativeLuminance(hexToRgb(hex2));
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

describe('HEX Color Palette & Contrast Test Suite', () => {
  it('should ensure all palette colors are valid 7-character HEX format', () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    Object.entries(HEX_THEME).forEach(([key, color]) => {
      expect(color).toMatch(hexPattern);
    });
  });

  it('should ensure primary text (#381E10) has high contrast on card background (#FFFFFF)', () => {
    const contrast = getContrastRatio(HEX_THEME.textPrimary, HEX_THEME.cardBg);
    // WCAG AAA requires >= 7:1 for normal text
    expect(contrast).toBeGreaterThan(7.0);
  });

  it('should ensure brand pink (#F20D6F) has sufficient contrast against white', () => {
    const contrast = getContrastRatio(HEX_THEME.brandPink, HEX_THEME.cardBg);
    // WCAG AA for UI components requires >= 3:1
    expect(contrast).toBeGreaterThan(3.0);
  });

  it('should ensure question card border (#FFCCD8) has clear visual distinction from container background', () => {
    const borderRgb = hexToRgb(HEX_THEME.cardBorder);
    const containerRgb = hexToRgb(HEX_THEME.containerBg);
    
    // Perceptual distance check between border and background
    const diff = Math.sqrt(
      Math.pow(borderRgb.r - containerRgb.r, 2) +
      Math.pow(borderRgb.g - containerRgb.g, 2) +
      Math.pow(borderRgb.b - containerRgb.b, 2)
    );
    expect(diff).toBeGreaterThan(20);
  });

  it('should ensure hover border (#F20D6F) creates an unmistakable highlight state', () => {
    const hoverContrast = getContrastRatio(HEX_THEME.cardBorderHover, HEX_THEME.cardBg);
    expect(hoverContrast).toBeGreaterThan(3.5);
  });
});

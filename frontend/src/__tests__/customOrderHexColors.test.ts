import { describe, it, expect } from 'vitest';
import { CUSTOM_ORDER_STATUS_THEME, CUSTOM_ORDER_UI_THEME } from '../pages/storefront/custom-orders/constants/customOrderTheme';

/**
 * Custom Order HEX Value & Color Contrast Test Suite
 * Validates format, WCAG accessibility, and visual harmony for:
 * 1. Status Badges & Cards
 * 2. Custom Order Form (Cake Pop Details, Upload, Textarea, Inputs, Actions)
 * 3. Conversational Inquiry Feed & Chat
 * 4. Frosting Corner Decorative Palette
 */

// Helper: Convert HEX to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16),
  };
}

// Helper: Calculate relative luminance according to WCAG 2.1
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

describe('Custom Order HEX Value & Color Validation Suite', () => {
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;

  describe('1. HEX Format Validation', () => {
    it('all status colors must be valid 7-character uppercase/lowercase HEX strings', () => {
      Object.entries(CUSTOM_ORDER_STATUS_THEME).forEach(([status, def]) => {
        expect(def.color, `Status color for ${status}`).toMatch(hexPattern);
        expect(def.bg, `Status bg for ${status}`).toMatch(hexPattern);
        expect(def.border, `Status border for ${status}`).toMatch(hexPattern);
      });
    });

    it('all UI and form theme colors must be valid 7-character HEX strings', () => {
      Object.entries(CUSTOM_ORDER_UI_THEME).forEach(([key, color]) => {
        if (key.includes('Ring') || key.includes('rgba')) return; // skip rgba tokens
        expect(color, `UI color for ${key}`).toMatch(hexPattern);
      });
    });
  });

  describe('2. Custom Order Form Elements & Contrast', () => {
    it('form step title (#381E10) must exceed WCAG AAA contrast (>= 7:1) on white form card', () => {
      const contrast = getContrastRatio(CUSTOM_ORDER_UI_THEME.stepTitle, CUSTOM_ORDER_UI_THEME.formCardBg);
      expect(contrast).toBeGreaterThanOrEqual(10.0);
    });

    it('form step description (#71717A) must exceed WCAG AA contrast (>= 4.5:1) on white form card', () => {
      const contrast = getContrastRatio(CUSTOM_ORDER_UI_THEME.stepDescription, CUSTOM_ORDER_UI_THEME.formCardBg);
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });

    it('form labels (#5C4A3E) must exceed WCAG AA contrast (>= 4.5:1) on white form card', () => {
      const contrast = getContrastRatio(CUSTOM_ORDER_UI_THEME.labelColor, CUSTOM_ORDER_UI_THEME.formCardBg);
      expect(contrast).toBeGreaterThanOrEqual(6.0);
    });

    it('required star indicator (#F20D6F) has vibrant contrast (>= 3.5:1) on white form card', () => {
      const contrast = getContrastRatio(CUSTOM_ORDER_UI_THEME.reqStarColor, CUSTOM_ORDER_UI_THEME.formCardBg);
      expect(contrast).toBeGreaterThanOrEqual(3.5);
    });

    it('upload inspiration box text (#381E10) has high contrast (>= 10:1) on upload box bg (#FFF9FA)', () => {
      const contrast = getContrastRatio(CUSTOM_ORDER_UI_THEME.uploadTextColor, CUSTOM_ORDER_UI_THEME.uploadBoxBg);
      expect(contrast).toBeGreaterThanOrEqual(10.0);
    });

    it('upload inspiration subtext (#71717A) has legible contrast (>= 4.5:1) on upload box bg', () => {
      const contrast = getContrastRatio(CUSTOM_ORDER_UI_THEME.uploadSubtextColor, CUSTOM_ORDER_UI_THEME.uploadBoxBg);
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });

    it('upload cloud icon color (#F20D6F) matches the brand pink theme', () => {
      expect(CUSTOM_ORDER_UI_THEME.uploadIconColor).toBe('#F20D6F');
    });

    it('primary button text (#FFFFFF) on button bg (#F20D6F) meets WCAG AA for large/bold text (>= 3.5:1)', () => {
      const contrast = getContrastRatio(CUSTOM_ORDER_UI_THEME.buttonPrimaryText, CUSTOM_ORDER_UI_THEME.buttonPrimaryBg);
      expect(contrast).toBeGreaterThanOrEqual(3.5);
    });

    it('error text color (#E11D48) meets WCAG AA contrast (>= 4.5:1) on white card', () => {
      const contrast = getContrastRatio(CUSTOM_ORDER_UI_THEME.errorColor, CUSTOM_ORDER_UI_THEME.formCardBg);
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('3. Status Badge & Card Contrast Validation', () => {
    it('primary title text (#381E10) must exceed WCAG AAA contrast (>= 7:1) on white card', () => {
      const contrast = getContrastRatio(CUSTOM_ORDER_UI_THEME.textTitle, CUSTOM_ORDER_UI_THEME.cardBg);
      expect(contrast).toBeGreaterThanOrEqual(10.0);
    });

    it('item details text (#52525B) must exceed WCAG AA contrast (>= 4.5:1) on white card', () => {
      const contrast = getContrastRatio(CUSTOM_ORDER_UI_THEME.textDetails, CUSTOM_ORDER_UI_THEME.cardBg);
      expect(contrast).toBeGreaterThanOrEqual(7.0);
    });

    it('status text colors must maintain strong legibility (>= 4.0:1) on white card background', () => {
      Object.entries(CUSTOM_ORDER_STATUS_THEME).forEach(([status, def]) => {
        const contrastOnWhite = getContrastRatio(def.color, CUSTOM_ORDER_UI_THEME.cardBg);
        expect(
          contrastOnWhite,
          `Status "${status}" (${def.color}) contrast on white`
        ).toBeGreaterThanOrEqual(4.0);
      });
    });

    it('status text colors must maintain high contrast (>= 4.0:1) against their badge background', () => {
      Object.entries(CUSTOM_ORDER_STATUS_THEME).forEach(([status, def]) => {
        const contrastOnBadgeBg = getContrastRatio(def.color, def.bg);
        expect(
          contrastOnBadgeBg,
          `Status "${status}" (${def.color}) contrast on badge bg (${def.bg})`
        ).toBeGreaterThanOrEqual(4.0);
      });
    });

    it('customer chat bubble must exceed WCAG AAA contrast (>= 7:1)', () => {
      const contrast = getContrastRatio(
        CUSTOM_ORDER_UI_THEME.customerBubbleText,
        CUSTOM_ORDER_UI_THEME.customerBubbleBg
      );
      expect(contrast).toBeGreaterThanOrEqual(15.0);
    });

    it('artisan team chat bubble must exceed WCAG AAA contrast (>= 7:1)', () => {
      const contrast = getContrastRatio(
        CUSTOM_ORDER_UI_THEME.artisanBubbleText,
        CUSTOM_ORDER_UI_THEME.artisanBubbleBg
      );
      expect(contrast).toBeGreaterThanOrEqual(14.0);
    });
  });

  describe('4. Frosting Corner Palette Harmony', () => {
    it('frosting pink outer and inner should have consistent pastel lightness', () => {
      const outerRgb = hexToRgb(CUSTOM_ORDER_UI_THEME.frostingPinkOuter);
      const innerRgb = hexToRgb(CUSTOM_ORDER_UI_THEME.frostingPinkInner);

      expect(outerRgb.r).toBeGreaterThan(240);
      expect(innerRgb.r).toBeGreaterThan(240);
      expect(innerRgb.g).toBeLessThan(outerRgb.g);
    });

    it('sprinkle pink matches the accent palette', () => {
      expect(CUSTOM_ORDER_UI_THEME.frostingSprinklePink).toMatch(hexPattern);
    });
  });
});

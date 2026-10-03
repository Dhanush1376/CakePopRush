import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Admin Portal HEX Color & Accessibility Validation Suite
 * Validates:
 * 1. 7-Character Standard HEX format integrity (#RRGGBB)
 * 2. WCAG 2.1 Contrast ratios across Admin Portal surfaces, typography, actions, and badges
 * 3. Token fidelity in tokens.css (--admin-pink: #F20D6F, --admin-brown: #381E10, etc.)
 * 4. Codebase-wide color correctness across all admin pages and components (no off-brand pinks, no shorthand hexes)
 */

export const ADMIN_PORTAL_HEX_PALETTE = {
  // Brand & Accent
  brandPink: '#F20D6F',
  brandPinkHover: '#D80860',
  brandPinkLight: '#FFF0F5',

  // Core Neutrals
  chocolateBrown: '#381E10',
  textMuted: '#524037',
  adminBg: '#F8F9FA',
  sidebarBg: '#FFFCF7',
  cardBg: '#FFFFFF',
  borderDefault: '#E8DFD3',
  borderSubtle: '#E2E8F0',

  // Status & Badges (Delivery Fleet & Order Operations)
  statusEmeraldTrack: '#10B981',
  statusEmeraldText: '#047857',
  statusEmeraldBg: '#ECFDF5',

  statusAmberTrack: '#F59E0B',
  statusAmberText: '#B45309',
  statusAmberBg: '#FEF3C7',

  statusDangerTrack: '#EF4444',
  statusDangerText: '#B91C1C',
  statusDangerBg: '#FEF2F2',

  statusInactiveTrack: '#CBD5E1',
  statusInactiveText: '#64748B',
  statusInactiveBg: '#F1F5F9',
};

// Helper: Convert HEX to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
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

// Helper: Recursively collect all files with specific extensions
function getAdminFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAdminFiles(fullPath, fileList);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.css'))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

describe('Admin Portal HEX Color & Accessibility Validation Suite', () => {
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;

  describe('1. Standard 7-Character HEX Format Integrity', () => {
    it('all colors in ADMIN_PORTAL_HEX_PALETTE must be valid 7-character uppercase HEX codes (#RRGGBB)', () => {
      Object.entries(ADMIN_PORTAL_HEX_PALETTE).forEach(([name, hex]) => {
        expect(hex, `Color ${name} must match #RRGGBB format`).toMatch(hexPattern);
      });
    });
  });

  describe('2. WCAG 2.1 Contrast Ratios', () => {
    it('primary text (#381E10) should have AAA high contrast (>= 7.0:1) on white card background (#FFFFFF)', () => {
      const contrast = getContrastRatio(ADMIN_PORTAL_HEX_PALETTE.chocolateBrown, ADMIN_PORTAL_HEX_PALETTE.cardBg);
      expect(contrast).toBeGreaterThan(7.0);
    });

    it('primary text (#381E10) should have AAA high contrast (>= 7.0:1) on admin page background (#F8F9FA)', () => {
      const contrast = getContrastRatio(ADMIN_PORTAL_HEX_PALETTE.chocolateBrown, ADMIN_PORTAL_HEX_PALETTE.adminBg);
      expect(contrast).toBeGreaterThan(7.0);
    });

    it('primary text (#381E10) should have AAA high contrast (>= 7.0:1) on admin sidebar background (#FFFCF7)', () => {
      const contrast = getContrastRatio(ADMIN_PORTAL_HEX_PALETTE.chocolateBrown, ADMIN_PORTAL_HEX_PALETTE.sidebarBg);
      expect(contrast).toBeGreaterThan(7.0);
    });

    it('muted text (#524037) should have AAA high contrast (>= 7.0:1) on white surface (#FFFFFF)', () => {
      const contrast = getContrastRatio(ADMIN_PORTAL_HEX_PALETTE.textMuted, ADMIN_PORTAL_HEX_PALETTE.cardBg);
      expect(contrast).toBeGreaterThan(7.0);
    });

    it('muted text (#524037) should have AAA high contrast (>= 7.0:1) on admin page background (#F8F9FA)', () => {
      const contrast = getContrastRatio(ADMIN_PORTAL_HEX_PALETTE.textMuted, ADMIN_PORTAL_HEX_PALETTE.adminBg);
      expect(contrast).toBeGreaterThan(7.0);
    });

    it('brand pink (#F20D6F) should achieve >= 3.0:1 contrast against white background for UI accents', () => {
      const contrast = getContrastRatio(ADMIN_PORTAL_HEX_PALETTE.brandPink, ADMIN_PORTAL_HEX_PALETTE.cardBg);
      expect(contrast).toBeGreaterThanOrEqual(3.0);
    });

    it('white text (#FFFFFF) on brand pink primary button (#F20D6F) should achieve >= 3.0:1 contrast', () => {
      const contrast = getContrastRatio(ADMIN_PORTAL_HEX_PALETTE.cardBg, ADMIN_PORTAL_HEX_PALETTE.brandPink);
      expect(contrast).toBeGreaterThanOrEqual(3.0);
    });

    it('white text (#FFFFFF) on hover brand pink button (#D80860) should achieve >= 3.5:1 contrast', () => {
      const contrast = getContrastRatio(ADMIN_PORTAL_HEX_PALETTE.cardBg, ADMIN_PORTAL_HEX_PALETTE.brandPinkHover);
      expect(contrast).toBeGreaterThanOrEqual(3.5);
    });

    it('emerald status text (#047857) on light background (#ECFDF5) should achieve >= 4.5:1 contrast', () => {
      const contrast = getContrastRatio(ADMIN_PORTAL_HEX_PALETTE.statusEmeraldText, ADMIN_PORTAL_HEX_PALETTE.statusEmeraldBg);
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });

    it('danger red text (#B91C1C) on light background (#FEF2F2) should achieve >= 4.5:1 contrast', () => {
      const contrast = getContrastRatio(ADMIN_PORTAL_HEX_PALETTE.statusDangerText, ADMIN_PORTAL_HEX_PALETTE.statusDangerBg);
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });

    it('warning amber text (#B45309) on light background (#FEF3C7) should achieve >= 4.0:1 contrast', () => {
      const contrast = getContrastRatio(ADMIN_PORTAL_HEX_PALETTE.statusAmberText, ADMIN_PORTAL_HEX_PALETTE.statusAmberBg);
      expect(contrast).toBeGreaterThanOrEqual(4.0);
    });
  });

  describe('3. Admin Portal Design Tokens (tokens.css)', () => {
    it('tokens.css must declare canonical --admin-pink: #F20D6F', () => {
      const tokensPath = path.resolve(__dirname, '../styles/tokens.css');
      const content = fs.readFileSync(tokensPath, 'utf8');
      expect(content).toContain('--admin-pink: #F20D6F;');
    });

    it('tokens.css must declare canonical --admin-pink-hover: #D80860', () => {
      const tokensPath = path.resolve(__dirname, '../styles/tokens.css');
      const content = fs.readFileSync(tokensPath, 'utf8');
      expect(content).toContain('--admin-pink-hover: #D80860;');
    });

    it('tokens.css must declare canonical --admin-brown: #381E10', () => {
      const tokensPath = path.resolve(__dirname, '../styles/tokens.css');
      const content = fs.readFileSync(tokensPath, 'utf8');
      expect(content).toContain('--admin-brown: #381E10;');
    });

    it('tokens.css must declare accessible --color-text-muted: #524037', () => {
      const tokensPath = path.resolve(__dirname, '../styles/tokens.css');
      const content = fs.readFileSync(tokensPath, 'utf8');
      expect(content).toContain('--color-text-muted: #524037;');
    });
  });

  describe('4. Entire Admin Portal Codebase Color Audit', () => {
    const adminPagesDir = path.resolve(__dirname, '../pages/admin');
    const adminFeaturesDir = path.resolve(__dirname, '../features/admin');
    const allAdminFiles = [
      ...getAdminFiles(adminPagesDir),
      ...getAdminFiles(adminFeaturesDir),
    ];

    it('should verify all admin files exist and are discovered for scanning', () => {
      expect(allAdminFiles.length).toBeGreaterThan(30);
    });

    it('should ensure NO off-palette pinks (#F21B5B, #FF69B4, #E15A75, #F72567) exist in any admin file', () => {
      const offPaletteRegex = /#(F21B5B|FF69B4|E15A75|F72567)\b/i;
      const violations: string[] = [];

      for (const file of allAdminFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const match = content.match(offPaletteRegex);
        if (match) {
          violations.push(`${path.basename(file)}: found off-palette color ${match[0]}`);
        }
      }

      expect(violations, `Off-palette colors found in admin files: \n${violations.join('\n')}`).toEqual([]);
    });

    it('should ensure all HEX color literals in admin styles & components are standard 6-digit hex codes', () => {
      // Matches 3-character hex shortcuts like #FFF, #666, #CCC
      const shorthandHexRegex = /#([0-9a-fA-F]{3})\b(?![0-9a-fA-F])/;
      const violations: string[] = [];

      for (const file of allAdminFiles) {
        // Exclude svg paths or test files
        if (file.endsWith('.test.ts')) continue;
        const content = fs.readFileSync(file, 'utf8');
        const match = content.match(shorthandHexRegex);
        if (match) {
          violations.push(`${path.basename(file)}: found shorthand hex ${match[0]}`);
        }
      }

      expect(violations, `Shorthand 3-digit hex codes should be normalized: \n${violations.join('\n')}`).toEqual([]);
    });

    it('should ensure NO washed-out #8E7A6E exists in any admin file', () => {
      const lowContrastRegex = /#8E7A6E\b/i;
      const violations: string[] = [];

      for (const file of allAdminFiles) {
        if (file.endsWith('.test.ts')) continue;
        const content = fs.readFileSync(file, 'utf8');
        const match = content.match(lowContrastRegex);
        if (match) {
          violations.push(`${path.basename(file)}: found low-contrast color ${match[0]}`);
        }
      }

      expect(violations, `Low-contrast #8E7A6E found in admin files: \n${violations.join('\n')}`).toEqual([]);
    });
  });
});

/**
 * CAKEPOPRUSH CANONICAL MASCOT v1.0
 *
 * Visual geometry is locked.
 * Do not modify geometry for animation convenience.
 * 
 * All coordinates are in exact SVG user units for viewBox="0 0 300 360".
 * Derived exactly from the approved mascot HTML/SVG implementation.
 */

// ─── Canvas ─────────────────────────────────────────────
export const VIEWBOX = '0 0 300 360';
export const VIEWBOX_WIDTH  = 300;
export const VIEWBOX_HEIGHT = 360;

// ─── Body ───────────────────────────────────────────────
export const BODY = {
  cx: 150,
  cy: 150,
  r:  99,
} as const;

export const SHEEN = {
  cx: 115,
  cy: 85,
  rx: 40,
  ry: 24,
  opacity: 0.05,
} as const;

// ─── Eyes ────────────────────────────────────────────────
export const LEFT_EYE = {
  cx: 115,
  cy: 148,
  scleraR:  27,
  pupilDx:  1,
  pupilDy:  4,
  pupilR:   19,
  highlight1Dx: -6,
  highlight1Dy: -3,
  highlight1R:  6.2,
  highlight2Dx: 7,
  highlight2Dy: 12,
  highlight2R:  2.6,
  highlight2Opacity: 0.85,
} as const;

export const RIGHT_EYE = {
  cx: 185,
  cy: 148,
  scleraR:  27,
  pupilDx:  -1,
  pupilDy:  4,
  pupilR:   19,
  highlight1Dx: -8,
  highlight1Dy: -3,
  highlight1R:  6.2,
  highlight2Dx: 5,
  highlight2Dy: 12,
  highlight2R:  2.6,
  highlight2Opacity: 0.85,
} as const;

// ─── Eyebrows ─────────────────────────────────────────────
export const BROW = {
  strokeWidth: 5,
} as const;

// ─── Mouth ────────────────────────────────────────────────
export const MOUTH = {
  cx: 149.5, // approximate visual center of mouth for non-happy states
  cy: 185,
} as const;

// ─── Cheeks ─────────────────────────────────────────────
export const LEFT_CHEEK = {
  cx: 90,
  cy: 190,
  rx: 12,
  ry: 7.5,
} as const;

export const RIGHT_CHEEK = {
  cx: 210,
  cy: 190,
  rx: 12,
  ry: 7.5,
} as const;

// ─── Arms ───────────────────────────────────────────────
export const LEFT_SHOULDER = {
  x: 95,
  y: 178,
} as const;

export const RIGHT_SHOULDER = {
  x: 205,
  y: 178,
} as const;

export const ARM = {
  strokeWidth: 13,
} as const;

// ─── Legs ───────────────────────────────────────────────
export const LEFT_HIP = {
  x: 133,
  y: 236,
} as const;

export const RIGHT_HIP = {
  x: 167,
  y: 236,
} as const;

export const LEG = {
  strokeWidth: 13,
} as const;

// ─── Stick ──────────────────────────────────────────────
export const STICK = {
  x: 139,
  y: 238,
  width: 22,
  height: 66,
  rx: 7,
  highlightX: 139,
  highlightY: 238,
  highlightWidth: 8,
  highlightHeight: 66,
  highlightRx: 4,
} as const;

// ─── Shadow ─────────────────────────────────────────────
export const SHADOW = {
  cx: 150,
  cy: 316,
  rx: 46,
  ry: 8,
  opacity: 0.08,
} as const;

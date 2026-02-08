import { describe, it, expect } from 'vitest';
import {
  colors,
  withOpacity,
  lightColors,
  spacing,
  borderRadius,
  fontSize,
  lineHeight,
  fontWeight,
  shadows,
} from './index';

// ---------------------------------------------------------------------------
// colors.ts
// ---------------------------------------------------------------------------
describe('colors (dark theme)', () => {
  const expectedKeys: (keyof typeof colors)[] = [
    'bgPrimary',
    'bgSecondary',
    'bgTertiary',
    'bgCard',
    'accent',
    'accentHover',
    'accentMuted',
    'textPrimary',
    'textSecondary',
    'textMuted',
    'border',
    'borderLight',
    'error',
    'warning',
    'warningMuted',
    'success',
    'overlay',
    'overlayLight',
    'shadowColor',
  ];

  it('has all expected keys', () => {
    for (const key of expectedKeys) {
      expect(colors).toHaveProperty(key);
    }
  });

  it('has no extra keys beyond the expected set', () => {
    expect(Object.keys(colors).sort()).toEqual([...expectedKeys].sort());
  });

  it('all values are strings', () => {
    for (const value of Object.values(colors)) {
      expect(typeof value).toBe('string');
    }
  });

  it('contains the correct specific values for background colors', () => {
    expect(colors.bgPrimary).toBe('#0a0b14');
    expect(colors.bgSecondary).toBe('#111320');
    expect(colors.bgTertiary).toBe('#1a1d2e');
    expect(colors.bgCard).toBe('#0d0e18');
  });

  it('contains the correct specific values for accent colors', () => {
    expect(colors.accent).toBe('#6366f1');
    expect(colors.accentHover).toBe('#818cf8');
    expect(colors.accentMuted).toBe('rgba(99, 102, 241, 0.15)');
  });

  it('contains the correct specific values for text colors', () => {
    expect(colors.textPrimary).toBe('#e2e8f0');
    expect(colors.textSecondary).toBe('#94a3b8');
    expect(colors.textMuted).toBe('#64748b');
  });

  it('contains the correct specific values for border colors', () => {
    expect(colors.border).toBe('#1e2038');
    expect(colors.borderLight).toBe('rgba(99, 102, 241, 0.2)');
  });

  it('contains the correct specific values for status colors', () => {
    expect(colors.error).toBe('#f87171');
    expect(colors.warning).toBe('#fbbf24');
    expect(colors.warningMuted).toBe('rgba(251, 191, 36, 0.15)');
    expect(colors.success).toBe('#10b981');
  });

  it('contains the correct specific values for overlay and shadow', () => {
    expect(colors.overlay).toBe('rgba(0, 0, 0, 0.7)');
    expect(colors.overlayLight).toBe('rgba(0, 0, 0, 0.5)');
    expect(colors.shadowColor).toBe('#000000');
  });
});

// ---------------------------------------------------------------------------
// withOpacity
// ---------------------------------------------------------------------------
describe('withOpacity', () => {
  it('converts a hex color to rgba with the given opacity', () => {
    expect(withOpacity('#6366f1', 0.5)).toBe('rgba(99, 102, 241, 0.5)');
  });

  it('converts #000000 to rgba(0, 0, 0, opacity)', () => {
    expect(withOpacity('#000000', 0.3)).toBe('rgba(0, 0, 0, 0.3)');
  });

  it('converts #ffffff to rgba(255, 255, 255, opacity)', () => {
    expect(withOpacity('#ffffff', 1)).toBe('rgba(255, 255, 255, 1)');
  });

  it('handles opacity of 0', () => {
    expect(withOpacity('#ff0000', 0)).toBe('rgba(255, 0, 0, 0)');
  });

  it('returns the color unchanged when it is already rgba', () => {
    const rgba = 'rgba(99, 102, 241, 0.15)';
    expect(withOpacity(rgba, 0.5)).toBe(rgba);
  });

  it('returns the color unchanged for rgb format', () => {
    const rgb = 'rgb(10, 20, 30)';
    expect(withOpacity(rgb, 0.8)).toBe(rgb);
  });

  it('returns the color unchanged for named colors', () => {
    expect(withOpacity('red', 0.5)).toBe('red');
  });
});

// ---------------------------------------------------------------------------
// lightColors.ts
// ---------------------------------------------------------------------------
describe('lightColors (light theme)', () => {
  const expectedKeys: (keyof typeof lightColors)[] = [
    'bgPrimary',
    'bgSecondary',
    'bgTertiary',
    'bgCard',
    'accent',
    'accentHover',
    'accentMuted',
    'textPrimary',
    'textSecondary',
    'textMuted',
    'border',
    'borderLight',
    'error',
    'warning',
    'warningMuted',
    'success',
    'overlay',
    'overlayLight',
    'shadowColor',
  ];

  it('has all expected keys', () => {
    for (const key of expectedKeys) {
      expect(lightColors).toHaveProperty(key);
    }
  });

  it('has no extra keys beyond the expected set', () => {
    expect(Object.keys(lightColors).sort()).toEqual([...expectedKeys].sort());
  });

  it('all values are strings', () => {
    for (const value of Object.values(lightColors)) {
      expect(typeof value).toBe('string');
    }
  });

  it('has the same set of keys as the dark colors', () => {
    expect(Object.keys(lightColors).sort()).toEqual(
      Object.keys(colors).sort()
    );
  });

  it('contains the correct specific values for background colors', () => {
    expect(lightColors.bgPrimary).toBe('#ffffff');
    expect(lightColors.bgSecondary).toBe('#f8f8fd');
    expect(lightColors.bgTertiary).toBe('#f0f0f8');
    expect(lightColors.bgCard).toBe('#ffffff');
  });

  it('contains the correct specific values for accent colors', () => {
    expect(lightColors.accent).toBe('#6366f1');
    expect(lightColors.accentHover).toBe('#4f46e5');
    expect(lightColors.accentMuted).toBe('rgba(99, 102, 241, 0.12)');
  });

  it('contains the correct specific values for text colors', () => {
    expect(lightColors.textPrimary).toBe('#1a1b2e');
    expect(lightColors.textSecondary).toBe('#4b5563');
    expect(lightColors.textMuted).toBe('#6b7280');
  });

  it('contains the correct specific values for border colors', () => {
    expect(lightColors.border).toBe('#e5e7eb');
    expect(lightColors.borderLight).toBe('rgba(99, 102, 241, 0.25)');
  });

  it('contains the correct specific values for status colors', () => {
    expect(lightColors.error).toBe('#dc2626');
    expect(lightColors.warning).toBe('#d97706');
    expect(lightColors.warningMuted).toBe('rgba(217, 119, 6, 0.12)');
    expect(lightColors.success).toBe('#059669');
  });

  it('contains the correct specific values for overlay and shadow', () => {
    expect(lightColors.overlay).toBe('rgba(0, 0, 0, 0.5)');
    expect(lightColors.overlayLight).toBe('rgba(0, 0, 0, 0.3)');
    expect(lightColors.shadowColor).toBe('#000000');
  });
});

// ---------------------------------------------------------------------------
// spacing.ts
// ---------------------------------------------------------------------------
describe('spacing', () => {
  it('has expected keys with correct numeric values', () => {
    expect(spacing.xs).toBe(4);
    expect(spacing.sm).toBe(8);
    expect(spacing.md).toBe(16);
    expect(spacing.lg).toBe(24);
    expect(spacing.xl).toBe(32);
    expect(spacing['2xl']).toBe(48);
  });

  it('all values are numbers', () => {
    for (const value of Object.values(spacing)) {
      expect(typeof value).toBe('number');
    }
  });

  it('has exactly 6 keys', () => {
    expect(Object.keys(spacing)).toHaveLength(6);
  });
});

describe('borderRadius', () => {
  it('has expected keys with correct numeric values', () => {
    expect(borderRadius.sm).toBe(4);
    expect(borderRadius.md).toBe(8);
    expect(borderRadius.lg).toBe(12);
    expect(borderRadius.xl).toBe(16);
    expect(borderRadius.full).toBe(9999);
  });

  it('all values are numbers', () => {
    for (const value of Object.values(borderRadius)) {
      expect(typeof value).toBe('number');
    }
  });

  it('has exactly 5 keys', () => {
    expect(Object.keys(borderRadius)).toHaveLength(5);
  });
});

describe('fontSize', () => {
  it('has expected keys with correct numeric values', () => {
    expect(fontSize.xs).toBe(12);
    expect(fontSize.sm).toBe(14);
    expect(fontSize.base).toBe(16);
    expect(fontSize.lg).toBe(18);
    expect(fontSize.xl).toBe(22);
    expect(fontSize['2xl']).toBe(26);
    expect(fontSize['3xl']).toBe(36);
    expect(fontSize['4xl']).toBe(48);
  });

  it('all values are numbers', () => {
    for (const value of Object.values(fontSize)) {
      expect(typeof value).toBe('number');
    }
  });

  it('has exactly 8 keys', () => {
    expect(Object.keys(fontSize)).toHaveLength(8);
  });
});

describe('lineHeight', () => {
  it('has expected keys with correct numeric values', () => {
    expect(lineHeight.tight).toBe(1.25);
    expect(lineHeight.normal).toBe(1.5);
    expect(lineHeight.relaxed).toBe(1.625);
  });

  it('all values are numbers', () => {
    for (const value of Object.values(lineHeight)) {
      expect(typeof value).toBe('number');
    }
  });

  it('has exactly 3 keys', () => {
    expect(Object.keys(lineHeight)).toHaveLength(3);
  });
});

describe('fontWeight', () => {
  it('has expected keys with correct string values', () => {
    expect(fontWeight.normal).toBe('400');
    expect(fontWeight.medium).toBe('500');
    expect(fontWeight.semibold).toBe('600');
    expect(fontWeight.bold).toBe('700');
  });

  it('all values are strings', () => {
    for (const value of Object.values(fontWeight)) {
      expect(typeof value).toBe('string');
    }
  });

  it('has exactly 4 keys', () => {
    expect(Object.keys(fontWeight)).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// index.ts - shadows
// ---------------------------------------------------------------------------
describe('shadows', () => {
  it('exists and is an object', () => {
    expect(shadows).toBeDefined();
    expect(typeof shadows).toBe('object');
  });

  it('has the expected keys: sm, md, lg, xl, glow', () => {
    const expectedKeys = ['sm', 'md', 'lg', 'xl', 'glow'];
    for (const key of expectedKeys) {
      expect(shadows).toHaveProperty(key);
    }
    expect(Object.keys(shadows).sort()).toEqual(expectedKeys.sort());
  });

  it('each shadow value is an empty object', () => {
    for (const key of Object.keys(shadows)) {
      expect(shadows[key]).toEqual({});
    }
  });
});

// ---------------------------------------------------------------------------
// index.ts - re-exports
// ---------------------------------------------------------------------------
describe('index.ts re-exports', () => {
  it('re-exports colors from colors.ts', () => {
    expect(colors).toBeDefined();
    expect(colors.accent).toBe('#6366f1');
  });

  it('re-exports withOpacity from colors.ts', () => {
    expect(withOpacity).toBeDefined();
    expect(typeof withOpacity).toBe('function');
  });

  it('re-exports lightColors from lightColors.ts', () => {
    expect(lightColors).toBeDefined();
    expect(lightColors.accent).toBe('#6366f1');
  });

  it('re-exports spacing from spacing.ts', () => {
    expect(spacing).toBeDefined();
    expect(spacing.md).toBe(16);
  });

  it('re-exports borderRadius from spacing.ts', () => {
    expect(borderRadius).toBeDefined();
    expect(borderRadius.md).toBe(8);
  });

  it('re-exports fontSize from spacing.ts', () => {
    expect(fontSize).toBeDefined();
    expect(fontSize.base).toBe(16);
  });

  it('re-exports lineHeight from spacing.ts', () => {
    expect(lineHeight).toBeDefined();
    expect(lineHeight.normal).toBe(1.5);
  });

  it('re-exports fontWeight from spacing.ts', () => {
    expect(fontWeight).toBeDefined();
    expect(fontWeight.bold).toBe('700');
  });
});

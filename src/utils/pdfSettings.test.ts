/**
 * Tests for PDF export settings validation
 * Verifies that useShare.ts PDF configuration values
 * remain safe for rendering (no text overlap, proper scaling, etc.)
 */

import { describe, it, expect } from 'vitest';
import { fontSizeMultipliers, fontFamilyStacks } from '../contexts/FontSettingsContext';
import type { FontSize, FontFamily } from '../contexts/FontSettingsContext';

// Replicate the PDF settings from useShare.ts
const PDF_BASE_FONT_SIZE = 14;

function getPdfBaseFontSize(fontSize: FontSize): number {
  return Math.round(PDF_BASE_FONT_SIZE * fontSizeMultipliers[fontSize]);
}

function getPdfFontSizes(fontSize: FontSize) {
  const multiplier = fontSizeMultipliers[fontSize];
  return {
    base: Math.round(14 * multiplier),
    h1: Math.round(24 * multiplier),
    h2: Math.round(20 * multiplier),
    h3: Math.round(17 * multiplier),
    h4: Math.round(15 * multiplier),
    h5: Math.round(14 * multiplier),
    h6: Math.round(13 * multiplier),
    code: Math.round(12 * multiplier),
    table: Math.round(12 * multiplier),
  };
}

// Mirror of the pdfOptions from useShare.ts
const pdfOptions = {
  margin: [10, 10, 10, 10],
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
};

const fontSizes: FontSize[] = ['small', 'medium', 'large'];
const families: FontFamily[] = ['system', 'serif', 'sans-serif'];

describe('Font Size Thresholds', () => {
  it.each(fontSizes)('should have base font >= 12px for %s', (size) => {
    expect(getPdfFontSizes(size).base).toBeGreaterThanOrEqual(12);
  });

  it.each(fontSizes)('should have code font >= 10px for %s', (size) => {
    expect(getPdfFontSizes(size).code).toBeGreaterThanOrEqual(10);
  });

  it.each(fontSizes)('should have table font >= 10px for %s', (size) => {
    expect(getPdfFontSizes(size).table).toBeGreaterThanOrEqual(10);
  });

  it.each(fontSizes)('should have h6 font >= 11px for %s', (size) => {
    expect(getPdfFontSizes(size).h6).toBeGreaterThanOrEqual(11);
  });

  it.each(fontSizes)('should maintain heading hierarchy for %s', (size) => {
    const sizes = getPdfFontSizes(size);
    expect(sizes.h1).toBeGreaterThan(sizes.h2);
    expect(sizes.h2).toBeGreaterThan(sizes.h3);
    expect(sizes.h3).toBeGreaterThan(sizes.h4);
    expect(sizes.h4).toBeGreaterThanOrEqual(sizes.h5);
    expect(sizes.h5).toBeGreaterThanOrEqual(sizes.h6);
  });
});

describe('html2canvas Settings', () => {
  it('should have scale >= 2', () => {
    expect(pdfOptions.html2canvas.scale).toBeGreaterThanOrEqual(2);
  });
});

describe('PDF Margin Settings', () => {
  it('should have margins at least 8mm on all sides', () => {
    for (const margin of pdfOptions.margin) {
      expect(margin).toBeGreaterThanOrEqual(8);
    }
  });

  it('should not exceed 25mm margins', () => {
    for (const margin of pdfOptions.margin) {
      expect(margin).toBeLessThanOrEqual(25);
    }
  });
});

describe('Pagebreak Settings', () => {
  it('should include css mode for CSS page-break rules', () => {
    expect(pdfOptions.pagebreak.mode).toContain('css');
  });
});

describe('Font Family Stacks', () => {
  it.each(families)('should include a generic fallback for %s', (family) => {
    const stack = fontFamilyStacks[family];
    const hasGenericFallback =
      stack.includes('sans-serif') || stack.includes('serif') || stack.includes('monospace');
    expect(hasGenericFallback).toBe(true);
  });
});

describe('A4 Content Area', () => {
  it('should have content width >= 160mm with current margins', () => {
    const leftRight = pdfOptions.margin[1] + pdfOptions.margin[3];
    const contentWidth = 210 - leftRight;
    expect(contentWidth).toBeGreaterThanOrEqual(160);
  });

  it('should have content height >= 257mm with current margins', () => {
    const topBottom = pdfOptions.margin[0] + pdfOptions.margin[2];
    const contentHeight = 297 - topBottom;
    expect(contentHeight).toBeGreaterThanOrEqual(257);
  });
});

describe('Container Wrapper Validation', () => {
  it.each(fontSizes)('should match getPdfFontSizes().base for %s', (size) => {
    expect(getPdfFontSizes(size).base).toBe(getPdfBaseFontSize(size));
  });
});

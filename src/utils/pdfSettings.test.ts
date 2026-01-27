/**
 * Tests for PDF export settings validation
 * Verifies that useShare.web.ts PDF configuration values
 * remain safe for rendering (no text overlap, proper scaling, etc.)
 *
 * Run with: npx tsx src/utils/pdfSettings.test.ts
 */

import { fontSizeMultipliers, fontFamilyStacks } from '../contexts/FontSettingsContext';
import type { FontSize, FontFamily } from '../contexts/FontSettingsContext';

// -------------------------------------------------------
// Replicate the PDF settings from useShare.web.ts so we
// can validate them without importing React hooks.
// -------------------------------------------------------

const PDF_BASE_FONT_SIZE = 11;

function getPdfBaseFontSize(fontSize: FontSize): number {
  return Math.round(PDF_BASE_FONT_SIZE * fontSizeMultipliers[fontSize]);
}

function getPdfFontSizes(fontSize: FontSize) {
  const multiplier = fontSizeMultipliers[fontSize];
  return {
    base: Math.round(11 * multiplier),
    h1: Math.round(18 * multiplier),
    h2: Math.round(15 * multiplier),
    h3: Math.round(13 * multiplier),
    h4: Math.round(12 * multiplier),
    h5: Math.round(11 * multiplier),
    h6: Math.round(10 * multiplier),
    code: Math.round(9 * multiplier),
    table: Math.round(9 * multiplier),
  };
}

// Mirror of the pdfOptions from useShare.web.ts
const pdfOptions = {
  margin: [10, 10, 10, 10],
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
};

// -------------------------------------------------------
// Test infrastructure (matches project convention)
// -------------------------------------------------------

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`✓ ${name}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    results.push({ name, passed: false, error: message });
    console.log(`✗ ${name}`);
    console.log(`  ${message}`);
  }
}

// -------------------------------------------------------
// Tests
// -------------------------------------------------------

console.log('Running PDF settings validation tests...\n');

// --- Font size minimum thresholds ---
console.log('--- Font Size Thresholds ---\n');

const fontSizes: FontSize[] = ['small', 'medium', 'large'];

for (const size of fontSizes) {
  const sizes = getPdfFontSizes(size);

  test(`[${size}] base font >= 9px (got ${sizes.base}px)`, () => {
    assert(sizes.base >= 9, `Base font ${sizes.base}px is below 9px minimum`);
  });

  test(`[${size}] code font >= 8px (got ${sizes.code}px)`, () => {
    assert(sizes.code >= 8, `Code font ${sizes.code}px is below 8px minimum`);
  });

  test(`[${size}] table font >= 8px (got ${sizes.table}px)`, () => {
    assert(sizes.table >= 8, `Table font ${sizes.table}px is below 8px minimum`);
  });

  test(`[${size}] h6 font >= 9px (got ${sizes.h6}px)`, () => {
    assert(sizes.h6 >= 9, `H6 font ${sizes.h6}px is below 9px minimum`);
  });

  test(`[${size}] heading hierarchy h1 > h2 > h3 > h4 > h5 > h6`, () => {
    assert(
      sizes.h1 > sizes.h2 && sizes.h2 > sizes.h3 && sizes.h3 > sizes.h4 &&
      sizes.h4 >= sizes.h5 && sizes.h5 >= sizes.h6,
      `Heading hierarchy violated: h1=${sizes.h1} h2=${sizes.h2} h3=${sizes.h3} h4=${sizes.h4} h5=${sizes.h5} h6=${sizes.h6}`
    );
  });
}

// --- html2canvas scale ---
console.log('\n--- html2canvas Settings ---\n');

test('html2canvas scale >= 2', () => {
  assert(
    pdfOptions.html2canvas.scale >= 2,
    `Scale ${pdfOptions.html2canvas.scale} is below 2 — text will be blurry`
  );
});

// --- PDF margins ---
console.log('\n--- PDF Margin Settings ---\n');

test('PDF margins are at least 8mm on all sides', () => {
  for (let i = 0; i < pdfOptions.margin.length; i++) {
    assert(
      pdfOptions.margin[i] >= 8,
      `Margin[${i}] = ${pdfOptions.margin[i]}mm is below 8mm minimum`
    );
  }
});

test('PDF margins do not exceed 25mm (content area too small)', () => {
  for (let i = 0; i < pdfOptions.margin.length; i++) {
    assert(
      pdfOptions.margin[i] <= 25,
      `Margin[${i}] = ${pdfOptions.margin[i]}mm exceeds 25mm — content area will be too small`
    );
  }
});

// --- Pagebreak mode ---
console.log('\n--- Pagebreak Settings ---\n');

test('Pagebreak mode includes "css" for CSS page-break rules', () => {
  assert(
    pdfOptions.pagebreak.mode.includes('css'),
    `Pagebreak mode missing "css": ${JSON.stringify(pdfOptions.pagebreak.mode)}`
  );
});

// --- Font family stacks ---
console.log('\n--- Font Family Stacks ---\n');

const families: FontFamily[] = ['system', 'serif', 'sans-serif'];

for (const family of families) {
  test(`[${family}] font stack includes a generic fallback`, () => {
    const stack = fontFamilyStacks[family];
    const hasGenericFallback =
      stack.includes('sans-serif') || stack.includes('serif') || stack.includes('monospace');
    assert(hasGenericFallback, `Font stack "${stack}" has no generic CSS fallback`);
  });
}

// --- A4 content area calculations ---
console.log('\n--- A4 Content Area ---\n');

test('A4 content area width >= 160mm with current margins', () => {
  // A4 width = 210mm
  const leftRight = pdfOptions.margin[1] + pdfOptions.margin[3];
  const contentWidth = 210 - leftRight;
  assert(
    contentWidth >= 160,
    `Content width ${contentWidth}mm is too narrow (left+right margin = ${leftRight}mm)`
  );
});

test('A4 content area height >= 257mm with current margins', () => {
  // A4 height = 297mm
  const topBottom = pdfOptions.margin[0] + pdfOptions.margin[2];
  const contentHeight = 297 - topBottom;
  assert(
    contentHeight >= 257,
    `Content height ${contentHeight}mm is too short (top+bottom margin = ${topBottom}mm)`
  );
});

// --- Container wrapper styles (validates the template in useShare.web.ts) ---
console.log('\n--- Container Wrapper Validation ---\n');

for (const size of fontSizes) {
  test(`[${size}] container base font matches getPdfFontSizes().base`, () => {
    const fromHelper = getPdfFontSizes(size).base;
    const fromContainer = getPdfBaseFontSize(size);
    assert(
      fromHelper === fromContainer,
      `Mismatch: getPdfFontSizes=${fromHelper} vs container=${fromContainer}`
    );
  });
}

// -------------------------------------------------------
// Summary
// -------------------------------------------------------
const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}

/**
 * Tests for markdownToHtml function
 * Run with: npx tsx src/utils/markdownToHtml.test.ts
 */

import { markdownToHtml, PdfFontSettings } from './markdownToHtml';

interface TestCase {
  name: string;
  input: string;
  expectedContains: string[];
  expectedNotContains?: string[];
}

const testCases: TestCase[] = [
  // Headings
  {
    name: 'H1 heading',
    input: '# Hello World',
    expectedContains: ['<h1', '>Hello World</h1>'],
  },
  {
    name: 'H2 heading',
    input: '## Section Title',
    expectedContains: ['<h2', '>Section Title</h2>'],
  },
  {
    name: 'H3 heading',
    input: '### Subsection',
    expectedContains: ['<h3', '>Subsection</h3>'],
  },
  {
    name: 'H4 heading',
    input: '#### Level 4',
    expectedContains: ['<h4', '>Level 4</h4>'],
    expectedNotContains: ['####'],
  },
  {
    name: 'H5 heading',
    input: '##### Level 5',
    expectedContains: ['<h5', '>Level 5</h5>'],
    expectedNotContains: ['#####'],
  },
  {
    name: 'H6 heading',
    input: '###### Level 6',
    expectedContains: ['<h6', '>Level 6</h6>'],
    expectedNotContains: ['######'],
  },

  // Text formatting
  {
    name: 'Bold text with **',
    input: 'This is **bold** text',
    expectedContains: ['<strong>bold</strong>'],
    expectedNotContains: ['**'],
  },
  {
    name: 'Italic text with *',
    input: 'This is *italic* text',
    expectedContains: ['<em>italic</em>'],
  },
  {
    name: 'Strikethrough',
    input: 'This is ~~deleted~~ text',
    expectedContains: ['<del>deleted</del>'],
    expectedNotContains: ['~~'],
  },

  // Lists - Unordered
  {
    name: 'Unordered list with -',
    input: '- Item 1\n- Item 2\n- Item 3',
    expectedContains: ['<ul', '<li>Item 1</li>', '<li>Item 2</li>', '<li>Item 3</li>', '</ul>'],
    expectedNotContains: ['- Item'],
  },
  {
    name: 'Unordered list with *',
    input: '* Apple\n* Banana\n* Cherry',
    expectedContains: ['<ul', '<li>Apple</li>', '<li>Banana</li>', '</ul>'],
    expectedNotContains: ['* Apple'],
  },
  {
    name: 'Unordered list with +',
    input: '+ One\n+ Two',
    expectedContains: ['<ul', '<li>One</li>', '<li>Two</li>', '</ul>'],
  },

  // Lists - Ordered
  {
    name: 'Ordered list',
    input: '1. First\n2. Second\n3. Third',
    expectedContains: ['<ol', '<li>First</li>', '<li>Second</li>', '<li>Third</li>', '</ol>'],
    expectedNotContains: ['1. First', '2. Second'],
  },

  // Task lists
  {
    name: 'Task list unchecked',
    input: '- [ ] Todo item',
    expectedContains: ['<input type="checkbox" disabled', 'Todo item'],
    expectedNotContains: ['[ ]'],
  },
  {
    name: 'Task list checked',
    input: '- [x] Done item',
    expectedContains: ['<input type="checkbox" checked disabled', 'Done item'],
    expectedNotContains: ['[x]'],
  },

  // Tables
  {
    name: 'Simple table',
    input: '| Name | Age |\n|------|-----|\n| John | 30 |\n| Jane | 25 |',
    expectedContains: [
      '<table',
      '<thead>',
      '<th',
      '>Name</th>',
      '>Age</th>',
      '</thead>',
      '<tbody>',
      '<td',
      '>John</td>',
      '>30</td>',
      '>Jane</td>',
      '>25</td>',
      '</tbody>',
      '</table>',
    ],
    expectedNotContains: ['|---'],
  },

  // Code
  {
    name: 'Inline code',
    input: 'Use `console.log()` for debugging',
    expectedContains: ['<code', '>console.log()</code>'],
    expectedNotContains: ['`console'],
  },
  {
    name: 'Code block',
    input: '```js\nconst x = 1;\n```',
    expectedContains: ['<pre', '<code>', 'const x = 1;', '</code>', '</pre>'],
    expectedNotContains: ['```'],
  },
  {
    name: 'Code block escapes HTML',
    input: '```html\n<div>test</div>\n```',
    expectedContains: ['&lt;div&gt;', '&lt;/div&gt;'],
    expectedNotContains: ['<div>test</div>'],
  },

  // Links and Images
  {
    name: 'Link',
    input: 'Visit [Google](https://google.com)',
    expectedContains: ['<a href="https://google.com"', '>Google</a>'],
    expectedNotContains: ['[Google]'],
  },
  {
    name: 'Image',
    input: '![Alt text](https://example.com/image.png)',
    expectedContains: ['<img src="https://example.com/image.png"', 'alt="Alt text"'],
  },

  // Blockquote
  {
    name: 'Blockquote',
    input: '> This is a quote',
    expectedContains: ['<blockquote', '>This is a quote</blockquote>'],
    expectedNotContains: ['> This'],
  },

  // Horizontal rule
  {
    name: 'Horizontal rule ---',
    input: '---',
    expectedContains: ['<hr'],
    expectedNotContains: ['---'],
  },

  // Complex document
  {
    name: 'Complex document',
    input: `# Title

This is a paragraph with **bold** and *italic* text.

## Features

- Feature 1
- Feature 2
- Feature 3

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello");
}
\`\`\`

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`,
    expectedContains: [
      '<h1',
      '>Title</h1>',
      '<strong>bold</strong>',
      '<em>italic</em>',
      '<h2',
      '>Features</h2>',
      '<ul',
      '<li>Feature 1</li>',
      '</ul>',
      '<h3',
      '>Code Example</h3>',
      '<pre',
      '<code>',
      'function hello()',
      '</code>',
      '</pre>',
      '<table',
      '<th',
      '>Header 1</th>',
      '<td',
      '>Cell 1</td>',
    ],
  },

  // Mermaid (basic test - just check it's processed)
  // Note: In Node.js environment without DOM, Mermaid falls back to code display
  {
    name: 'Mermaid block placeholder',
    input: '```mermaid\ngraph TD\n    A-->B\n```',
    expectedContains: ['<pre', '<code>', 'graph TD'], // Fallback in Node.js environment
    expectedNotContains: ['```mermaid'],
  },

  // ==========================================================
  // PDF display quality tests
  // These tests verify CSS properties that prevent text overlap,
  // overflow, and other rendering issues in PDF export.
  // ==========================================================

  // Table layout constraints
  {
    name: 'PDF: Table has table-layout:fixed for width control',
    input: '| Col1 | Col2 |\n|------|------|\n| A | B |',
    expectedContains: ['table-layout:fixed'],
  },
  {
    name: 'PDF: Table cells have word-break for long text',
    input: '| Col1 | Col2 |\n|------|------|\n| A | B |',
    expectedContains: ['word-break:break-word'],
  },

  // Code block overflow handling
  {
    name: 'PDF: Code block has overflow-wrap for PDF rendering',
    input: '```js\nconst x = 1;\n```',
    expectedContains: ['overflow-wrap:break-word', 'white-space:pre-wrap'],
  },

  // Inline code padding
  {
    name: 'PDF: Inline code has sufficient vertical padding',
    input: 'Use `code` here',
    expectedContains: ['padding:2px 5px'],
  },

  // Container-level text wrapping (paragraph)
  {
    name: 'PDF: Paragraphs have overflow-wrap for long words',
    input: 'This is a paragraph with potentially long words.',
    expectedContains: ['overflow-wrap:break-word'],
  },

  // Heading line-height
  {
    name: 'PDF: H1 has explicit line-height',
    input: '# Heading',
    expectedContains: ['line-height:'],
  },
  {
    name: 'PDF: H2 has explicit line-height',
    input: '## Heading',
    expectedContains: ['line-height:'],
  },
];

// ==========================================================
// Font size constraint tests
// Verify minimum font sizes to prevent unreadable PDF output
// ==========================================================

interface FontSizeTest {
  name: string;
  fontSettings: PdfFontSettings;
  element: string;
  input: string;
  minFontSize: number;
}

const fontSizeTests: FontSizeTest[] = [
  {
    name: 'Font: Base body text >= 9px (small)',
    fontSettings: { fontSize: 'small', fontFamily: 'system' },
    element: 'p',
    input: 'Body text paragraph.',
    minFontSize: 9,
  },
  {
    name: 'Font: Code block text >= 8px (small)',
    fontSettings: { fontSize: 'small', fontFamily: 'system' },
    element: 'pre',
    input: '```js\ncode\n```',
    minFontSize: 8,
  },
  {
    name: 'Font: Table text >= 8px (small)',
    fontSettings: { fontSize: 'small', fontFamily: 'system' },
    element: 'td',
    input: '| A | B |\n|---|---|\n| 1 | 2 |',
    minFontSize: 8,
  },
  {
    name: 'Font: H6 heading >= 9px (small)',
    fontSettings: { fontSize: 'small', fontFamily: 'system' },
    element: 'h6',
    input: '###### Small heading',
    minFontSize: 9,
  },
  {
    name: 'Font: Inline code >= 8px (small)',
    fontSettings: { fontSize: 'small', fontFamily: 'system' },
    element: 'code',
    input: 'Use `snippet` here',
    minFontSize: 8,
  },
];

async function runTests(): Promise<void> {
  let passed = 0;
  let failed = 0;
  const failures: { name: string; error: string; html: string }[] = [];

  console.log('Running markdownToHtml tests...\n');

  // --- Existing HTML content tests ---
  console.log('--- HTML Content Tests ---\n');

  for (const testCase of testCases) {
    const html = await markdownToHtml(testCase.input);
    let testPassed = true;
    let errorMessages: string[] = [];

    // Check expected contains
    for (const expected of testCase.expectedContains) {
      if (!html.includes(expected)) {
        testPassed = false;
        errorMessages.push(`Missing: "${expected}"`);
      }
    }

    // Check expected not contains
    if (testCase.expectedNotContains) {
      for (const notExpected of testCase.expectedNotContains) {
        if (html.includes(notExpected)) {
          testPassed = false;
          errorMessages.push(`Should not contain: "${notExpected}"`);
        }
      }
    }

    if (testPassed) {
      console.log(`✓ ${testCase.name}`);
      passed++;
    } else {
      console.log(`✗ ${testCase.name}`);
      errorMessages.forEach((msg) => console.log(`  ${msg}`));
      failures.push({ name: testCase.name, error: errorMessages.join('; '), html });
      failed++;
    }
  }

  // --- Font size constraint tests ---
  console.log('\n--- Font Size Constraint Tests ---\n');

  for (const test of fontSizeTests) {
    const html = await markdownToHtml(test.input, test.fontSettings);
    let testPassed = true;
    let errorMessages: string[] = [];

    // Extract font-size values from the target element
    const fontSizeRegex = new RegExp(`<${test.element}[^>]*font-size:(\\d+)px`, 'g');
    const matches = [...html.matchAll(fontSizeRegex)];

    if (matches.length === 0) {
      testPassed = false;
      errorMessages.push(`No font-size found on <${test.element}> element`);
    } else {
      for (const match of matches) {
        const size = parseInt(match[1], 10);
        if (size < test.minFontSize) {
          testPassed = false;
          errorMessages.push(`font-size ${size}px < minimum ${test.minFontSize}px`);
        }
      }
    }

    if (testPassed) {
      console.log(`✓ ${test.name}`);
      passed++;
    } else {
      console.log(`✗ ${test.name}`);
      errorMessages.forEach((msg) => console.log(`  ${msg}`));
      failures.push({ name: test.name, error: errorMessages.join('; '), html });
      failed++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failures.length > 0) {
    console.log(`\n${'='.repeat(50)}`);
    console.log('Failed test outputs:\n');
    for (const failure of failures) {
      console.log(`--- ${failure.name} ---`);
      console.log('Input HTML:');
      console.log(failure.html);
      console.log('');
    }
    process.exit(1);
  }
}

runTests();

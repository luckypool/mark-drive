/**
 * Tests for markdownToHtml function
 */

import { describe, it, expect, vi } from 'vitest';
import { markdownToHtml, PdfFontSettings } from './markdownToHtml';

describe('markdownToHtml - HTML Content', () => {
  // Headings
  it.each([
    { name: 'H1', input: '# Hello World', contains: ['<h1', '>Hello World</h1>'] },
    { name: 'H2', input: '## Section Title', contains: ['<h2', '>Section Title</h2>'] },
    { name: 'H3', input: '### Subsection', contains: ['<h3', '>Subsection</h3>'] },
    { name: 'H4', input: '#### Level 4', contains: ['<h4', '>Level 4</h4>'] },
    { name: 'H5', input: '##### Level 5', contains: ['<h5', '>Level 5</h5>'] },
    { name: 'H6', input: '###### Level 6', contains: ['<h6', '>Level 6</h6>'] },
  ])('$name heading', async ({ input, contains }) => {
    const html = await markdownToHtml(input);
    for (const expected of contains) {
      expect(html).toContain(expected);
    }
  });

  it('should not leave raw markdown markers for H4+', async () => {
    expect(await markdownToHtml('#### Level 4')).not.toContain('####');
    expect(await markdownToHtml('##### Level 5')).not.toContain('#####');
    expect(await markdownToHtml('###### Level 6')).not.toContain('######');
  });

  // Text formatting
  it('should render bold text', async () => {
    const html = await markdownToHtml('This is **bold** text');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).not.toContain('**');
  });

  it('should render italic text', async () => {
    const html = await markdownToHtml('This is *italic* text');
    expect(html).toContain('<em>italic</em>');
  });

  it('should render strikethrough text', async () => {
    const html = await markdownToHtml('This is ~~deleted~~ text');
    expect(html).toContain('<del>deleted</del>');
    expect(html).not.toContain('~~');
  });

  // Lists
  it('should render unordered list with -', async () => {
    const html = await markdownToHtml('- Item 1\n- Item 2\n- Item 3');
    expect(html).toContain('<ul');
    expect(html).toContain('>Item 1</li>');
    expect(html).toContain('>Item 2</li>');
    expect(html).toContain('>Item 3</li>');
    expect(html).toContain('</ul>');
    expect(html).not.toContain('- Item');
  });

  it('should render unordered list with *', async () => {
    const html = await markdownToHtml('* Apple\n* Banana\n* Cherry');
    expect(html).toContain('<ul');
    expect(html).toContain('>Apple</li>');
    expect(html).not.toContain('* Apple');
  });

  it('should render unordered list with +', async () => {
    const html = await markdownToHtml('+ One\n+ Two');
    expect(html).toContain('<ul');
    expect(html).toContain('>One</li>');
  });

  it('should render ordered list', async () => {
    const html = await markdownToHtml('1. First\n2. Second\n3. Third');
    expect(html).toContain('<ol');
    expect(html).toContain('>First</li>');
    expect(html).toContain('>Second</li>');
    expect(html).not.toContain('1. First');
  });

  // Task lists
  it('should render unchecked task list item', async () => {
    const html = await markdownToHtml('- [ ] Todo item');
    expect(html).toContain('<input type="checkbox" disabled');
    expect(html).toContain('Todo item');
    expect(html).not.toContain('[ ]');
  });

  it('should render checked task list item', async () => {
    const html = await markdownToHtml('- [x] Done item');
    expect(html).toContain('<input type="checkbox" checked disabled');
    expect(html).toContain('Done item');
    expect(html).not.toContain('[x]');
  });

  // Tables
  it('should render simple table', async () => {
    const html = await markdownToHtml('| Name | Age |\n|------|-----|\n| John | 30 |\n| Jane | 25 |');
    expect(html).toContain('<table');
    expect(html).toContain('<thead>');
    expect(html).toContain('>Name</th>');
    expect(html).toContain('>Age</th>');
    expect(html).toContain('>John</td>');
    expect(html).toContain('>30</td>');
    expect(html).toContain('</table>');
    expect(html).not.toContain('|---');
  });

  // Code
  it('should render inline code', async () => {
    const html = await markdownToHtml('Use `console.log()` for debugging');
    expect(html).toContain('<code');
    expect(html).toContain('>console.log()</code>');
    expect(html).not.toContain('`console');
  });

  it('should render code block', async () => {
    const html = await markdownToHtml('```js\nconst x = 1;\n```');
    expect(html).toContain('<pre');
    expect(html).toContain('<code');
    // With syntax highlighting, tokens may be wrapped in spans
    expect(html).toContain('const');
    expect(html).toContain('x =');
    expect(html).not.toContain('```');
  });

  it('should escape HTML in code blocks without language', async () => {
    const html = await markdownToHtml('```\n<div>test</div>\n```');
    expect(html).toContain('&lt;div&gt;');
    expect(html).not.toContain('<div>test</div>');
  });

  // Links and Images
  it('should render link', async () => {
    const html = await markdownToHtml('Visit [Google](https://google.com)');
    expect(html).toContain('<a href="https://google.com"');
    expect(html).toContain('>Google</a>');
    expect(html).not.toContain('[Google]');
  });

  it('should render image', async () => {
    const html = await markdownToHtml('![Alt text](https://example.com/image.png)');
    expect(html).toContain('<img src="https://example.com/image.png"');
    expect(html).toContain('alt="Alt text"');
  });

  // Blockquote
  it('should render blockquote', async () => {
    const html = await markdownToHtml('> This is a quote');
    expect(html).toContain('<blockquote');
    expect(html).toContain('>This is a quote</blockquote>');
    expect(html).not.toContain('> This');
  });

  // Horizontal rule
  it('should render horizontal rule', async () => {
    const html = await markdownToHtml('---');
    expect(html).toContain('<hr');
    expect(html).not.toContain('---');
  });

  // Mermaid
  it('should render mermaid block as code fallback', async () => {
    const html = await markdownToHtml('```mermaid\ngraph TD\n    A-->B\n```');
    expect(html).toContain('<pre');
    expect(html).toContain('graph TD');
    expect(html).not.toContain('```mermaid');
  });

  // Complex document
  it('should render a complex document', async () => {
    const input = `# Title

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
`;
    const html = await markdownToHtml(input);
    expect(html).toContain('>Title</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
    expect(html).toContain('>Features</h2>');
    expect(html).toContain('>Feature 1</li>');
    expect(html).toContain('>Code Example</h3>');
    expect(html).toContain('function');
    expect(html).toContain('>Header 1</th>');
    expect(html).toContain('>Cell 1</td>');
  });
});

describe('markdownToHtml - PDF display quality', () => {
  it('should have table-layout:fixed for width control', async () => {
    const html = await markdownToHtml('| Col1 | Col2 |\n|------|------|\n| A | B |');
    expect(html).toContain('table-layout:fixed');
  });

  it('should have word-break for table cells', async () => {
    const html = await markdownToHtml('| Col1 | Col2 |\n|------|------|\n| A | B |');
    expect(html).toContain('word-break:break-word');
  });

  it('should have overflow-wrap for code blocks', async () => {
    const html = await markdownToHtml('```js\nconst x = 1;\n```');
    expect(html).toContain('overflow-wrap:break-word');
    expect(html).toContain('white-space:pre-wrap');
  });

  it('should have sufficient padding for inline code', async () => {
    const html = await markdownToHtml('Use `code` here');
    expect(html).toContain('padding:2px 5px');
  });

  it('should have overflow-wrap for paragraphs', async () => {
    const html = await markdownToHtml('This is a paragraph with potentially long words.');
    expect(html).toContain('overflow-wrap:break-word');
  });

  it('should have explicit line-height for H1', async () => {
    const html = await markdownToHtml('# Heading');
    expect(html).toContain('line-height:');
  });

  it('should have explicit line-height for H2', async () => {
    const html = await markdownToHtml('## Heading');
    expect(html).toContain('line-height:');
  });
});

describe('markdownToHtml - Font size constraints', () => {
  const smallFont: PdfFontSettings = { fontSize: 'small', fontFamily: 'system' };

  it('should have base body text >= 12px for small font', async () => {
    const html = await markdownToHtml('Body text paragraph.', smallFont);
    const matches = [...html.matchAll(/<p[^>]*font-size:(\d+)px/g)];
    expect(matches.length).toBeGreaterThan(0);
    for (const match of matches) {
      expect(parseInt(match[1], 10)).toBeGreaterThanOrEqual(12);
    }
  });

  it('should have code block text >= 10px for small font', async () => {
    const html = await markdownToHtml('```js\ncode\n```', smallFont);
    const matches = [...html.matchAll(/<pre[^>]*font-size:(\d+)px/g)];
    expect(matches.length).toBeGreaterThan(0);
    for (const match of matches) {
      expect(parseInt(match[1], 10)).toBeGreaterThanOrEqual(10);
    }
  });

  it('should have table text >= 10px for small font', async () => {
    const html = await markdownToHtml('| A | B |\n|---|---|\n| 1 | 2 |', smallFont);
    const matches = [...html.matchAll(/<td[^>]*font-size:(\d+)px/g)];
    expect(matches.length).toBeGreaterThan(0);
    for (const match of matches) {
      expect(parseInt(match[1], 10)).toBeGreaterThanOrEqual(10);
    }
  });

  it('should have H6 heading >= 11px for small font', async () => {
    const html = await markdownToHtml('###### Small heading', smallFont);
    const matches = [...html.matchAll(/<h6[^>]*font-size:(\d+)px/g)];
    expect(matches.length).toBeGreaterThan(0);
    for (const match of matches) {
      expect(parseInt(match[1], 10)).toBeGreaterThanOrEqual(11);
    }
  });

  it('should have inline code >= 10px for small font', async () => {
    const html = await markdownToHtml('Use `snippet` here', smallFont);
    const matches = [...html.matchAll(/<code[^>]*font-size:(\d+)px/g)];
    expect(matches.length).toBeGreaterThan(0);
    for (const match of matches) {
      expect(parseInt(match[1], 10)).toBeGreaterThanOrEqual(10);
    }
  });
});

describe('markdownToHtml - Syntax highlighting', () => {
  it('should apply syntax highlighting to code blocks with language', async () => {
    const html = await markdownToHtml('```javascript\nconst x = 1;\n```');
    expect(html).toContain('<pre');
    expect(html).toContain('<code');
    // highlight.js should produce inline styles for keywords
    expect(html).toContain('style="color:');
  });

  it('should fallback to escaped HTML for unknown languages', async () => {
    const html = await markdownToHtml('```unknownlang123\nsome code\n```');
    expect(html).toContain('<pre');
    expect(html).toContain('some code');
  });

  it('should escape HTML in code blocks without highlighting', async () => {
    const html = await markdownToHtml('```\n<script>alert("xss")</script>\n```');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>alert');
  });
});

describe('markdownToHtml - Nested blockquotes', () => {
  it('should render nested blockquote (> >)', async () => {
    const html = await markdownToHtml('> > Nested quote');
    expect(html).toContain('<blockquote');
    // Should have two blockquote elements (nested)
    const blockquoteCount = (html.match(/<blockquote/g) || []).length;
    expect(blockquoteCount).toBe(2);
    expect(html).toContain('Nested quote');
  });

  it('should have font-size on blockquote', async () => {
    const html = await markdownToHtml('> Simple quote');
    expect(html).toContain('font-size:');
    expect(html).toContain('<blockquote');
  });

  it('should render single-level blockquote correctly', async () => {
    const html = await markdownToHtml('> Single level');
    const blockquoteCount = (html.match(/<blockquote/g) || []).length;
    expect(blockquoteCount).toBe(1);
    expect(html).toContain('Single level');
  });
});

describe('markdownToHtml - Nested lists', () => {
  it('should render nested unordered list', async () => {
    const html = await markdownToHtml('- Item 1\n  - Sub item 1\n  - Sub item 2\n- Item 2');
    // Should have two <ul tags (outer + nested)
    const ulCount = (html.match(/<ul /g) || []).length;
    expect(ulCount).toBe(2);
    expect(html).toContain('>Item 1</li>');
    expect(html).toContain('>Sub item 1</li>');
    expect(html).toContain('>Sub item 2</li>');
    expect(html).toContain('>Item 2</li>');
  });

  it('should render nested ordered list', async () => {
    const html = await markdownToHtml('1. First\n  1. Sub first\n2. Second');
    const olCount = (html.match(/<ol /g) || []).length;
    expect(olCount).toBe(2);
    expect(html).toContain('>First</li>');
    expect(html).toContain('>Sub first</li>');
    expect(html).toContain('>Second</li>');
  });

  it('should have font-size on list items', async () => {
    const html = await markdownToHtml('- Item 1\n- Item 2');
    // Check that <li has font-size
    expect(html).toMatch(/<li[^>]*font-size:\d+px/);
  });

  it('should have font-size on ul/ol tags', async () => {
    const html = await markdownToHtml('- Item 1\n- Item 2');
    expect(html).toMatch(/<ul[^>]*font-size:\d+px/);

    const html2 = await markdownToHtml('1. Item 1\n2. Item 2');
    expect(html2).toMatch(/<ol[^>]*font-size:\d+px/);
  });

  it('should render 3-level nested list', async () => {
    const html = await markdownToHtml('- Level 1\n  - Level 2\n    - Level 3');
    const ulCount = (html.match(/<ul /g) || []).length;
    expect(ulCount).toBe(3);
    expect(html).toContain('>Level 1</li>');
    expect(html).toContain('>Level 2</li>');
    expect(html).toContain('>Level 3</li>');
  });
});

describe('markdownToHtml - Math (KaTeX)', () => {
  it('should render inline math with $...$', async () => {
    const html = await markdownToHtml('The formula $E=mc^2$ is famous.');
    expect(html).toContain('katex');
    expect(html).not.toContain('$E=mc^2$');
  });

  it('should render block math with $$...$$', async () => {
    const html = await markdownToHtml('$$\n\\sum_{i=1}^{n} i\n$$');
    expect(html).toContain('katex');
    expect(html).not.toContain('$$');
  });

  it('should render inline math with \\(...\\)', async () => {
    const html = await markdownToHtml('The formula \\(E=mc^2\\) is famous.');
    expect(html).toContain('katex');
    expect(html).not.toContain('\\(');
  });

  it('should render block math with \\[...\\]', async () => {
    const html = await markdownToHtml('\\[\n\\sum_{i=1}^{n} i\n\\]');
    expect(html).toContain('katex');
    expect(html).not.toContain('\\[');
  });

  it('should not treat $ inside code blocks as math', async () => {
    const html = await markdownToHtml('```\nconst price = $100;\n```');
    // Should be in a code block, not rendered as math
    expect(html).toContain('<pre');
    expect(html).toContain('<code');
  });

  it('should not treat $ inside inline code as math', async () => {
    const html = await markdownToHtml('Use `$variable` in shell');
    expect(html).toContain('<code');
    expect(html).toContain('$variable');
  });

  it('should handle invalid math expressions gracefully', async () => {
    const html = await markdownToHtml('$\\invalidcommandxyz$');
    // Should not throw, should contain some fallback
    expect(html).toBeTruthy();
  });

  it('should render multiple math expressions in one document', async () => {
    const input = 'Inline $a^2$ and block:\n\n$$b^2$$';
    const html = await markdownToHtml(input);
    const katexCount = (html.match(/katex/g) || []).length;
    expect(katexCount).toBeGreaterThanOrEqual(2);
  });
});

describe('markdownToHtml - Math error fallback', () => {
  it('should fallback to code display when katex.renderToString throws for block $$', async () => {
    const katex = await import('katex');
    const spy = vi.spyOn(katex.default, 'renderToString').mockImplementation(() => { throw new Error('mock error'); });
    const html = await markdownToHtml('$$x^2$$');
    expect(html).toContain('<pre');
    expect(html).toContain('x^2');
    expect(html).toContain('color:#ef4444');
    spy.mockRestore();
  });

  it('should fallback to code display when katex.renderToString throws for block \\[\\]', async () => {
    const katex = await import('katex');
    const spy = vi.spyOn(katex.default, 'renderToString').mockImplementation(() => { throw new Error('mock error'); });
    const html = await markdownToHtml('\\[x^2\\]');
    expect(html).toContain('<pre');
    expect(html).toContain('x^2');
    expect(html).toContain('color:#ef4444');
    spy.mockRestore();
  });

  it('should fallback to inline code when katex.renderToString throws for inline $', async () => {
    const katex = await import('katex');
    const spy = vi.spyOn(katex.default, 'renderToString').mockImplementation(() => { throw new Error('mock error'); });
    const html = await markdownToHtml('formula $x^2$ here');
    expect(html).toContain('<code');
    expect(html).toContain('x^2');
    expect(html).toContain('color:#ef4444');
    spy.mockRestore();
  });

  it('should fallback to inline code when katex.renderToString throws for \\(\\)', async () => {
    const katex = await import('katex');
    const spy = vi.spyOn(katex.default, 'renderToString').mockImplementation(() => { throw new Error('mock error'); });
    const html = await markdownToHtml('formula \\(x^2\\) here');
    expect(html).toContain('<code');
    expect(html).toContain('x^2');
    expect(html).toContain('color:#ef4444');
    spy.mockRestore();
  });
});

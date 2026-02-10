/**
 * Markdown to HTML converter for PDF export
 */

import type { FontSize, FontFamily } from '../contexts/FontSettingsContext';
import { fontSizeMultipliers, fontFamilyStacks } from '../contexts/FontSettingsContext';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface MermaidBlock {
  index: number;
  code: string;
}

export interface PdfFontSettings {
  fontSize: FontSize;
  fontFamily: FontFamily;
}

// Default PDF font settings
const defaultPdfFontSettings: PdfFontSettings = {
  fontSize: 'medium',
  fontFamily: 'system',
};

// highlight.js class → inline color mapping (GitHub Light theme)
const HLJS_COLORS: Record<string, string> = {
  'hljs-keyword': '#cf222e',
  'hljs-built_in': '#0550ae',
  'hljs-type': '#953800',
  'hljs-literal': '#0550ae',
  'hljs-number': '#0550ae',
  'hljs-operator': '#cf222e',
  'hljs-punctuation': '#24292f',
  'hljs-property': '#0550ae',
  'hljs-regex': '#0a3069',
  'hljs-string': '#0a3069',
  'hljs-char.escape': '#0a3069',
  'hljs-subst': '#24292f',
  'hljs-symbol': '#0550ae',
  'hljs-variable': '#953800',
  'hljs-selector-class': '#953800',
  'hljs-selector-tag': '#116329',
  'hljs-selector-attr': '#0550ae',
  'hljs-selector-pseudo': '#0550ae',
  'hljs-comment': '#6e7781',
  'hljs-name': '#116329',
  'hljs-tag': '#116329',
  'hljs-attr': '#0550ae',
  'hljs-attribute': '#0a3069',
  'hljs-function': '#8250df',
  'hljs-title': '#8250df',
  'hljs-title.class_': '#953800',
  'hljs-title.function_': '#8250df',
  'hljs-params': '#24292f',
  'hljs-meta': '#6e7781',
  'hljs-meta keyword': '#cf222e',
  'hljs-meta string': '#0a3069',
  'hljs-section': '#0550ae',
  'hljs-addition': '#116329',
  'hljs-deletion': '#82071e',
};

function hljsToInlineStyles(html: string): string {
  return html.replace(
    /class="([^"]+)"/g,
    (_, classes: string) => {
      const color = HLJS_COLORS[classes] || HLJS_COLORS[classes.split(' ')[0]];
      return color ? `style="color:${color}"` : '';
    }
  );
}

// Get PDF-specific font sizes based on settings
function getPdfFontSizes(settings: PdfFontSettings) {
  const multiplier = fontSizeMultipliers[settings.fontSize];
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

export async function markdownToHtml(content: string, fontSettings?: PdfFontSettings): Promise<string> {
  const settings = fontSettings || defaultPdfFontSettings;
  const sizes = getPdfFontSizes(settings);
  let html = content;

  // Store code blocks and mermaid blocks separately
  const codeBlocks: string[] = [];
  const mermaidBlocks: MermaidBlock[] = [];

  // Extract mermaid blocks first
  html = html.replace(/```mermaid\n([\s\S]*?)```/g, (_, code) => {
    const index = mermaidBlocks.length;
    mermaidBlocks.push({ index, code: code.trim() });
    return `\n<<<MERMAID${index}>>>\n`;
  });

  // Load highlight.js for syntax highlighting (dynamic import, PDF export only)
  let hljs: HLJSApi | null = null;
  try {
    const mod = await import('highlight.js');
    hljs = (mod as { default: HLJSApi }).default || (mod as unknown as HLJSApi);
  } catch { /* fallback to no highlighting */ }

  // Extract other code blocks with syntax highlighting
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const index = codeBlocks.length;
    const langLabel = lang ? `<div style="font-size:${sizes.code - 1}px;color:#555;margin-bottom:4px;">${lang}</div>` : '';

    let codeHtml: string;
    if (hljs && lang) {
      try {
        const result = hljs.highlight(code.trimEnd(), { language: lang });
        codeHtml = hljsToInlineStyles(result.value);
      } catch {
        codeHtml = escapeHtml(code.trimEnd());
      }
    } else {
      codeHtml = escapeHtml(code.trimEnd());
    }

    codeBlocks.push(
      `<pre style="background:#f5f5f5;padding:10px;border-radius:4px;overflow-wrap:break-word;white-space:pre-wrap;font-size:${sizes.code}px;color:#333;page-break-inside:avoid;">${langLabel}<code style="color:#333;">${codeHtml}</code></pre>`
    );
    return `\n<<<CODEBLOCK${index}>>>\n`;
  });

  // Tables
  html = html.replace(
    /^\|(.+)\|[ \t]*\n\|[ \t]*[-:]+[-:| \t]*\|[ \t]*\n((?:\|.+\|[ \t]*\n?)+)/gm,
    (_, header, body) => {
      const headerCells = header
        .split('|')
        .map((c: string) => c.trim())
        .filter(Boolean);
      const headerRow = headerCells
        .map(
          (c: string) =>
            `<th style="border:1px solid #ddd;padding:6px;background:#f5f5f5;text-align:left;font-size:${sizes.table}px;color:#111;word-break:break-word;">${c}</th>`
        )
        .join('');

      const bodyRows = body
        .trim()
        .split('\n')
        .map((row: string) => {
          const cells = row
            .split('|')
            .map((c: string) => c.trim())
            .filter(Boolean);
          return `<tr>${cells.map((c: string) => `<td style="border:1px solid #ddd;padding:6px;font-size:${sizes.table}px;color:#111;word-break:break-word;">${c}</td>`).join('')}</tr>`;
        })
        .join('');

      return `\n<table style="border-collapse:collapse;margin:12px 0;width:100%;table-layout:fixed;page-break-inside:avoid;"><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>\n`;
    }
  );

  // Inline code (before other inline formatting)
  html = html.replace(
    /`([^`]+)`/g,
    `<code style="background:#f0f0f0;padding:2px 5px;border-radius:3px;font-size:${sizes.code}px;color:#333;">$1</code>`
  );

  // Headings (order matters: h6 to h1)
  // page-break-after: avoid prevents heading from being at bottom of page without content
  html = html.replace(/^###### (.+)$/gm, `<h6 style="color:#000;margin:10px 0 5px;font-size:${sizes.h6}px;line-height:1.5;page-break-after:avoid;">$1</h6>`);
  html = html.replace(/^##### (.+)$/gm, `<h5 style="color:#000;margin:10px 0 5px;font-size:${sizes.h5}px;line-height:1.5;page-break-after:avoid;">$1</h5>`);
  html = html.replace(/^#### (.+)$/gm, `<h4 style="color:#000;margin:12px 0 6px;font-size:${sizes.h4}px;line-height:1.5;page-break-after:avoid;">$1</h4>`);
  html = html.replace(/^### (.+)$/gm, `<h3 style="color:#000;margin:14px 0 7px;font-size:${sizes.h3}px;line-height:1.5;page-break-after:avoid;">$1</h3>`);
  html = html.replace(
    /^## (.+)$/gm,
    `<h2 style="color:#000;margin:16px 0 8px;font-size:${sizes.h2}px;line-height:1.5;border-bottom:1px solid #ddd;padding-bottom:3px;page-break-after:avoid;">$1</h2>`
  );
  html = html.replace(
    /^# (.+)$/gm,
    `<h1 style="color:#000;margin:18px 0 9px;font-size:${sizes.h1}px;line-height:1.5;border-bottom:2px solid #ddd;padding-bottom:4px;page-break-after:avoid;">$1</h1>`
  );

  // Blockquotes (before list processing)
  // Process nested blockquotes first (deeper levels first)
  const bqStyle = `border-left:3px solid #ddd;margin:10px 0;padding:6px 12px;color:#444;font-size:${sizes.base}px;page-break-inside:avoid;`;
  const bqNestedStyle = `border-left:3px solid #ccc;margin:4px 0;padding:4px 10px;color:#444;font-size:${sizes.base}px;`;
  html = html.replace(
    /^> > (.+)$/gm,
    `<blockquote style="${bqStyle}"><blockquote style="${bqNestedStyle}">$1</blockquote></blockquote>`
  );
  html = html.replace(
    /^> (.+)$/gm,
    `<blockquote style="${bqStyle}">$1</blockquote>`
  );

  // Horizontal rule (before list processing to avoid * conflicts)
  html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #ddd;margin:12px 0;">');
  html = html.replace(/^\*\*\*$/gm, '<hr style="border:none;border-top:1px solid #ddd;margin:12px 0;">');
  html = html.replace(/^___$/gm, '<hr style="border:none;border-top:1px solid #ddd;margin:12px 0;">');

  // Process lists BEFORE bold/italic (to avoid * conflicts)
  // Supports nested lists via indentation
  const lines = html.split('\n');
  const processedLines: string[] = [];
  // Stack tracks: { type: 'ul' | 'ol' | 'task', level: number }
  const listStack: Array<{ type: 'ul' | 'ol' | 'task'; level: number }> = [];

  const ulOpenTag = `<ul style="margin:10px 0;padding-left:20px;color:#111;font-size:${sizes.base}px;">`;
  const ulNestedTag = `<ul style="margin:2px 0;padding-left:20px;color:#111;font-size:${sizes.base}px;">`;
  const olOpenTag = `<ol style="margin:10px 0;padding-left:20px;color:#111;font-size:${sizes.base}px;">`;
  const olNestedTag = `<ol style="margin:2px 0;padding-left:20px;color:#111;font-size:${sizes.base}px;">`;
  const taskOpenTag = `<ul style="margin:10px 0;padding-left:20px;list-style:none;color:#111;font-size:${sizes.base}px;">`;
  const taskNestedTag = `<ul style="margin:2px 0;padding-left:20px;list-style:none;color:#111;font-size:${sizes.base}px;">`;

  function closeListsToLevel(targetLevel: number) {
    while (listStack.length > 0 && listStack[listStack.length - 1].level >= targetLevel) {
      const popped = listStack.pop()!;
      processedLines.push(popped.type === 'ol' ? '</ol>' : '</ul>');
    }
  }

  function closeAllLists() {
    closeListsToLevel(0);
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const taskMatch = line.match(/^(\s*)[-*+] \[([ xX])\] (.+)$/);
    const orderedMatch = line.match(/^(\s*)(\d+)\. (.+)$/);
    const unorderedMatch = line.match(/^(\s*)[-*+] (.+)$/);

    if (taskMatch) {
      const indent = taskMatch[1].length;
      const level = Math.floor(indent / 2) + 1;
      const currentLevel = listStack.length > 0 ? listStack[listStack.length - 1].level : 0;

      if (level > currentLevel) {
        processedLines.push(level === 1 ? taskOpenTag : taskNestedTag);
        listStack.push({ type: 'task', level });
      } else if (level < currentLevel) {
        closeListsToLevel(level);
      }

      const checked = taskMatch[2].toLowerCase() === 'x';
      const checkbox = checked
        ? '<input type="checkbox" checked disabled style="margin-right:6px;">'
        : '<input type="checkbox" disabled style="margin-right:6px;">';
      processedLines.push(`<li style="list-style:none;color:#111;font-size:${sizes.base}px;">${checkbox}${taskMatch[3]}</li>`);
    } else if (orderedMatch) {
      const indent = orderedMatch[1].length;
      const level = Math.floor(indent / 2) + 1;
      const currentLevel = listStack.length > 0 ? listStack[listStack.length - 1].level : 0;

      if (level > currentLevel) {
        processedLines.push(level === 1 ? olOpenTag : olNestedTag);
        listStack.push({ type: 'ol', level });
      } else if (level < currentLevel) {
        closeListsToLevel(level);
      }

      processedLines.push(`<li style="color:#111;font-size:${sizes.base}px;">${orderedMatch[3]}</li>`);
    } else if (unorderedMatch) {
      const indent = unorderedMatch[1].length;
      const level = Math.floor(indent / 2) + 1;
      const currentLevel = listStack.length > 0 ? listStack[listStack.length - 1].level : 0;

      if (level > currentLevel) {
        processedLines.push(level === 1 ? ulOpenTag : ulNestedTag);
        listStack.push({ type: 'ul', level });
      } else if (level < currentLevel) {
        closeListsToLevel(level);
      }

      processedLines.push(`<li style="color:#111;font-size:${sizes.base}px;">${unorderedMatch[2]}</li>`);
    } else {
      closeAllLists();
      processedLines.push(line);
    }
  }

  // Close any remaining open lists
  closeAllLists();

  html = processedLines.join('\n');

  // Bold and Italic (AFTER list processing)
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/(?<!_)_([^_\n]+)_(?!_)/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Images (before links)
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" style="max-width:100%;height:auto;margin:8px 0;">'
  );

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#0066cc;">$1</a>');

  // Restore code blocks
  codeBlocks.forEach((block, index) => {
    html = html.replace(`<<<CODEBLOCK${index}>>>`, block);
  });

  // Render mermaid blocks
  if (mermaidBlocks.length > 0) {
    try {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'loose',
      });

      for (const block of mermaidBlocks) {
        try {
          const { svg } = await mermaid.render(`mermaid-${block.index}`, block.code);
          // Darken text in SVG for PDF readability
          // Safe with 'neutral' theme since all backgrounds are light
          // - SVG text elements: text, tspan use 'fill'
          // - stateDiagram/classDiagram use <foreignObject> with HTML elements that need 'color'
          const darkTextCss = [
            'text, text tspan { fill: #1a1a1a !important; }',
            'foreignObject div, foreignObject span, foreignObject p { color: #1a1a1a !important; }',
            '.nodeLabel, .edgeLabel, .label { color: #1a1a1a !important; }',
          ].join(' ');
          let darkenedSvg: string;
          if (svg.includes('</style>')) {
            darkenedSvg = svg.replace('</style>', `${darkTextCss}</style>`);
          } else {
            // If no <style> block exists, inject one after the opening <svg> tag
            darkenedSvg = svg.replace(/(<svg[^>]*>)/, `$1<style>${darkTextCss}</style>`);
          }
          // Wrap SVG in a container with proper styling
          const wrappedSvg = `<div style="margin:12px 0;text-align:center;overflow-x:auto;page-break-inside:avoid;">${darkenedSvg}</div>`;
          html = html.replace(`<<<MERMAID${block.index}>>>`, wrappedSvg);
        } catch (err) {
          console.error(`Mermaid render error for block ${block.index}:`, err);
          // Fallback to showing the code
          const fallback = `<pre style="background:#fff3cd;padding:10px;border-radius:4px;border:1px solid #ffc107;font-size:10px;color:#333;page-break-inside:avoid;"><code style="color:#333;">${escapeHtml(block.code)}</code></pre>`;
          html = html.replace(`<<<MERMAID${block.index}>>>`, fallback);
        }
      }
    } catch (err) {
      console.error('Failed to load mermaid:', err);
      // Fallback all mermaid blocks to code
      for (const block of mermaidBlocks) {
        const fallback = `<pre style="background:#f5f5f5;padding:10px;border-radius:4px;font-size:10px;color:#333;page-break-inside:avoid;"><code style="color:#333;">${escapeHtml(block.code)}</code></pre>`;
        html = html.replace(`<<<MERMAID${block.index}>>>`, fallback);
      }
    }
  }

  // Convert double newlines to paragraph breaks
  html = html.split('\n\n').map(para => {
    const trimmed = para.trim();
    if (!trimmed) return '';
    // Don't wrap block elements in paragraphs
    if (trimmed.startsWith('<h') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<ol') ||
        trimmed.startsWith('<table') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<hr') ||
        trimmed.startsWith('<div')) {
      return trimmed;
    }
    return `<p style="margin:0 0 12px;line-height:1.7;overflow-wrap:break-word;font-size:${sizes.base}px;color:#111;">${trimmed.replace(/\n/g, '<br>')}</p>`;
  }).filter(Boolean).join('\n');

  return html;
}

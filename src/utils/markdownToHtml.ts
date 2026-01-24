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

// Get PDF-specific font sizes based on settings
function getPdfFontSizes(settings: PdfFontSettings) {
  const multiplier = fontSizeMultipliers[settings.fontSize];
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

  // Extract other code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const index = codeBlocks.length;
    const langLabel = lang ? `<div style="font-size:${sizes.code - 1}px;color:#666;margin-bottom:4px;">${lang}</div>` : '';
    codeBlocks.push(
      `<pre style="background:#f5f5f5;padding:10px;border-radius:4px;overflow-x:auto;font-size:${sizes.code}px;page-break-inside:avoid;">${langLabel}<code>${escapeHtml(code.trimEnd())}</code></pre>`
    );
    return `\n<<<CODEBLOCK${index}>>>\n`;
  });

  // Tables
  html = html.replace(
    /^\|(.+)\|\s*\n\|[-:\s|]+\|\s*\n((?:\|.+\|\s*\n?)+)/gm,
    (_, header, body) => {
      const headerCells = header
        .split('|')
        .map((c: string) => c.trim())
        .filter(Boolean);
      const headerRow = headerCells
        .map(
          (c: string) =>
            `<th style="border:1px solid #ddd;padding:6px;background:#f5f5f5;text-align:left;font-size:${sizes.table}px;">${c}</th>`
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
          return `<tr>${cells.map((c: string) => `<td style="border:1px solid #ddd;padding:6px;font-size:${sizes.table}px;">${c}</td>`).join('')}</tr>`;
        })
        .join('');

      return `\n<table style="border-collapse:collapse;margin:12px 0;width:100%;page-break-inside:avoid;"><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>\n`;
    }
  );

  // Inline code (before other inline formatting)
  html = html.replace(
    /`([^`]+)`/g,
    `<code style="background:#f0f0f0;padding:1px 4px;border-radius:3px;font-size:${sizes.code}px;">$1</code>`
  );

  // Headings (order matters: h6 to h1)
  // page-break-after: avoid prevents heading from being at bottom of page without content
  html = html.replace(/^###### (.+)$/gm, `<h6 style="color:#000;margin:8px 0 4px;font-size:${sizes.h6}px;page-break-after:avoid;">$1</h6>`);
  html = html.replace(/^##### (.+)$/gm, `<h5 style="color:#000;margin:8px 0 4px;font-size:${sizes.h5}px;page-break-after:avoid;">$1</h5>`);
  html = html.replace(/^#### (.+)$/gm, `<h4 style="color:#000;margin:10px 0 5px;font-size:${sizes.h4}px;page-break-after:avoid;">$1</h4>`);
  html = html.replace(/^### (.+)$/gm, `<h3 style="color:#000;margin:12px 0 6px;font-size:${sizes.h3}px;page-break-after:avoid;">$1</h3>`);
  html = html.replace(
    /^## (.+)$/gm,
    `<h2 style="color:#000;margin:14px 0 7px;font-size:${sizes.h2}px;border-bottom:1px solid #ddd;padding-bottom:3px;page-break-after:avoid;">$1</h2>`
  );
  html = html.replace(
    /^# (.+)$/gm,
    `<h1 style="color:#000;margin:16px 0 8px;font-size:${sizes.h1}px;border-bottom:2px solid #ddd;padding-bottom:4px;page-break-after:avoid;">$1</h1>`
  );

  // Blockquotes (before list processing)
  html = html.replace(
    /^> (.+)$/gm,
    '<blockquote style="border-left:3px solid #ddd;margin:8px 0;padding:6px 12px;color:#666;page-break-inside:avoid;">$1</blockquote>'
  );

  // Horizontal rule (before list processing to avoid * conflicts)
  html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #ddd;margin:12px 0;">');
  html = html.replace(/^\*\*\*$/gm, '<hr style="border:none;border-top:1px solid #ddd;margin:12px 0;">');
  html = html.replace(/^___$/gm, '<hr style="border:none;border-top:1px solid #ddd;margin:12px 0;">');

  // Process lists BEFORE bold/italic (to avoid * conflicts)
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inOrderedList = false;
  let inUnorderedList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const taskMatch = line.match(/^[-*+] \[([ xX])\] (.+)$/);
    const orderedMatch = line.match(/^(\d+)\. (.+)$/);
    const unorderedMatch = line.match(/^[-*+] (.+)$/);

    if (taskMatch) {
      // Task list item
      if (inOrderedList) {
        processedLines.push('</ol>');
        inOrderedList = false;
      }
      if (!inUnorderedList) {
        processedLines.push('<ul style="margin:8px 0;padding-left:20px;list-style:none;">');
        inUnorderedList = true;
      }
      const checked = taskMatch[1].toLowerCase() === 'x';
      const checkbox = checked
        ? '<input type="checkbox" checked disabled style="margin-right:6px;">'
        : '<input type="checkbox" disabled style="margin-right:6px;">';
      processedLines.push(`<li style="list-style:none;">${checkbox}${taskMatch[2]}</li>`);
    } else if (orderedMatch) {
      // Ordered list item
      if (inUnorderedList) {
        processedLines.push('</ul>');
        inUnorderedList = false;
      }
      if (!inOrderedList) {
        processedLines.push('<ol style="margin:8px 0;padding-left:20px;">');
        inOrderedList = true;
      }
      processedLines.push(`<li>${orderedMatch[2]}</li>`);
    } else if (unorderedMatch) {
      // Unordered list item
      if (inOrderedList) {
        processedLines.push('</ol>');
        inOrderedList = false;
      }
      if (!inUnorderedList) {
        processedLines.push('<ul style="margin:8px 0;padding-left:20px;">');
        inUnorderedList = true;
      }
      processedLines.push(`<li>${unorderedMatch[1]}</li>`);
    } else {
      // Close any open lists
      if (inOrderedList) {
        processedLines.push('</ol>');
        inOrderedList = false;
      }
      if (inUnorderedList) {
        processedLines.push('</ul>');
        inUnorderedList = false;
      }
      processedLines.push(line);
    }
  }

  // Close any remaining open lists
  if (inOrderedList) {
    processedLines.push('</ol>');
  }
  if (inUnorderedList) {
    processedLines.push('</ul>');
  }

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
        theme: 'default',
        securityLevel: 'loose',
      });

      for (const block of mermaidBlocks) {
        try {
          const { svg } = await mermaid.render(`mermaid-${block.index}`, block.code);
          // Wrap SVG in a container with proper styling
          const wrappedSvg = `<div style="margin:12px 0;text-align:center;overflow-x:auto;page-break-inside:avoid;">${svg}</div>`;
          html = html.replace(`<<<MERMAID${block.index}>>>`, wrappedSvg);
        } catch (err) {
          console.error(`Mermaid render error for block ${block.index}:`, err);
          // Fallback to showing the code
          const fallback = `<pre style="background:#fff3cd;padding:10px;border-radius:4px;border:1px solid #ffc107;font-size:10px;page-break-inside:avoid;"><code>${escapeHtml(block.code)}</code></pre>`;
          html = html.replace(`<<<MERMAID${block.index}>>>`, fallback);
        }
      }
    } catch (err) {
      console.error('Failed to load mermaid:', err);
      // Fallback all mermaid blocks to code
      for (const block of mermaidBlocks) {
        const fallback = `<pre style="background:#f5f5f5;padding:10px;border-radius:4px;font-size:10px;page-break-inside:avoid;"><code>${escapeHtml(block.code)}</code></pre>`;
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
    return `<p style="margin:0 0 8px;line-height:1.5;">${trimmed.replace(/\n/g, '<br>')}</p>`;
  }).filter(Boolean).join('\n');

  return html;
}

import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked defaults for clean, readable rendering
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Pre-processes content to fix common LLM formatting artifacts
 * such as `<p>## Heading</p>` or misplaced line breaks.
 */
function normalizeMarkdownInput(content) {
  if (!content || typeof content !== 'string') return '';

  let text = content;

  // Unpack outer <h[1-6]> if it swallowed content
  text = text.replace(/^<h([1-6])>(.*)<\/h\1>$/gis, '$2');

  // Unpack headings wrapped inside <p> tags: <p>## Title</p> -> \n\n## Title\n\n
  text = text.replace(/<p>\s*(#{1,6}\s+[^\n<]+)\s*<\/p>/gi, '\n\n$1\n\n');

  // Ensure newlines before any ## heading marker
  text = text.replace(/\s*(#{1,6}\s+)/g, '\n\n$1');

  // If a heading ends with '?' and continues with sentence: e.g. "## What is X? Body text..."
  text = text.replace(/^(#{1,6}\s+[^?\n]+\?)\s+([A-Za-z0-9])/gm, '$1\n\n$2');

  // If common supplement headings have body text on the same line
  text = text.replace(/^(#{1,6}\s+(?:Why you should use|Reviews of|[^\n]+ benefits|[^\n]+ guarantee|[^\n]+ ingredients|[^\n]+ pros &amp; cons|[^\n]+ pros & cons)[^\n]*?)\s+([A-Za-z0-9\-<])/gim, '$1\n\n$2');

  // Separate inline bullets: " - Item 1 - Item 2" -> "\n- Item 1\n- Item 2"
  text = text.replace(/\s+-\s+([A-Za-z0-9])/g, '\n- $1');

  return text.trim();
}


/**
 * Renders full markdown or mixed markdown/HTML content into sanitized HTML.
 * Used for article body blocks, product descriptions, reviews, etc.
 */
export function renderMarkdown(content) {
  if (!content) return '';
  const normalized = normalizeMarkdownInput(content);
  try {
    const rawHtml = marked.parse(normalized);
    return DOMPurify.sanitize(rawHtml, {
      ADD_ATTR: ['target', 'rel'],
    });
  } catch (err) {
    console.warn('Markdown parsing error:', err);
    return DOMPurify.sanitize(content);
  }
}

/**
 * Renders inline markdown (bold, italic, links, code) without wrapping in <p> tags.
 * Used for headlines, card descriptions, callout subtitles, and FAQ answers.
 */
export function renderInlineMarkdown(content) {
  if (!content) return '';
  if (typeof content !== 'string') return String(content);

  // If content contains block-level markdown like headers, use full render
  if (/^#{1,6}\s+/m.test(content)) {
    return renderMarkdown(content);
  }

  try {
    const rawHtml = marked.parseInline(content);
    return DOMPurify.sanitize(rawHtml);
  } catch {
    return DOMPurify.sanitize(content);
  }
}

/**
 * Converts markdown to clean HTML suitable for the RichTextEditor (Quill).
 */
export function markdownToHtmlForEditor(content) {
  if (!content) return '<p></p>';
  // If it already looks like rich HTML and doesn't have raw markdown hashes or asterisks
  if (/<(h[1-6]|ul|ol|table|blockquote)[\s>]/i.test(content) && !/#{1,6}\s+/m.test(content) && !/\*\*[^*]+\*\*/.test(content)) {
    return content;
  }
  return renderMarkdown(content);
}

/**
 * Strips markdown symbols for plain text previews (e.g. meta tags, excerpts).
 */
export function stripMarkdown(content) {
  if (!content) return '';
  return content
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .trim();
}

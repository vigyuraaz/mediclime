/**
 * Converts structured content_blocks array to HTML for the rich text editor.
 * Supports: heading, paragraph, callout, nutrient_card, pull_quote, table
 */
export function contentBlocksToHtml(blocks) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return '<p></p>';
  }

  return blocks.map(block => {
    switch (block.type) {
      case 'heading':
        const level = block.level || 2;
        const Tag = `h${level}`;
        return `<${Tag}>${block.text || ''}</${Tag}>`;

      case 'paragraph':
        return `<p>${block.text || ''}</p>`;

      case 'callout':
        // Render callouts as styled blockquotes with a marker
        return `<blockquote data-callout="${block.variant || 'info'}"><strong>${block.title || 'Note'}:</strong> ${block.text || ''}</blockquote>`;

      case 'nutrient_card':
        if (block.data) {
          return `<blockquote data-type="nutrient_card"><strong>${block.data.name || ''}</strong> (${block.data.grade || ''})<br/>${block.data.description || ''}<br/><em>Dosage: ${block.data.dosage || ''}</em><br/><em>Mechanism: ${block.data.mechanism || ''}</em></blockquote>`;
        }
        return '';

      case 'pull_quote':
        return `<blockquote>${block.text || ''}</blockquote>`;

      case 'table':
        if (block.headers && block.rows) {
          let html = '<table><thead><tr>';
          block.headers.forEach(h => { html += `<th>${h}</th>`; });
          html += '</tr></thead><tbody>';
          block.rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => { html += `<td>${cell}</td>`; });
            html += '</tr>';
          });
          html += '</tbody></table>';
          return html;
        }
        return '';

      default:
        return `<p>${block.text || ''}</p>`;
    }
  }).join('\n');
}

/**
 * Converts HTML from the rich text editor back to structured content_blocks.
 * Parses HTML elements and maps them to the block schema.
 */
export function htmlToContentBlocks(html) {
  if (!html || html.trim() === '' || html.trim() === '<p></p>' || html.trim() === '<p><br></p>') {
    return [];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks = [];

  const childNodes = doc.body.childNodes;

  childNodes.forEach(node => {
    if (node.nodeType !== 1) return; // Skip text nodes

    const tagName = node.tagName.toLowerCase();

    if (/^h[1-6]$/.test(tagName)) {
      blocks.push({
        type: 'heading',
        level: parseInt(tagName[1]),
        text: node.textContent.trim()
      });
    } else if (tagName === 'p') {
      const text = node.innerHTML.trim();
      if (text && text !== '<br>') {
        blocks.push({
          type: 'paragraph',
          text: text
        });
      }
    } else if (tagName === 'blockquote') {
      const calloutType = node.getAttribute('data-callout');
      const dataType = node.getAttribute('data-type');

      if (dataType === 'nutrient_card') {
        // Try to parse nutrient card back from structured blockquote
        const strong = node.querySelector('strong');
        const name = strong ? strong.textContent.trim() : '';
        const emElements = node.querySelectorAll('em');
        const dosage = emElements[0] ? emElements[0].textContent.replace('Dosage: ', '') : '';
        const mechanism = emElements[1] ? emElements[1].textContent.replace('Mechanism: ', '') : '';

        // Extract grade from the parenthetical after the strong
        const fullText = node.textContent;
        const gradeMatch = fullText.match(/\(([^)]+)\)/);
        const grade = gradeMatch ? gradeMatch[1] : '';

        // Extract description (text between grade and first em)
        const description = fullText
          .replace(name, '')
          .replace(`(${grade})`, '')
          .replace(dosage ? `Dosage: ${dosage}` : '', '')
          .replace(mechanism ? `Mechanism: ${mechanism}` : '', '')
          .trim();

        blocks.push({
          type: 'nutrient_card',
          data: { name, grade, description, dosage, mechanism }
        });
      } else if (calloutType) {
        const strong = node.querySelector('strong');
        const title = strong ? strong.textContent.replace(':', '').trim() : 'Note';
        const text = node.textContent.replace(strong ? strong.textContent : '', '').trim();
        blocks.push({
          type: 'callout',
          variant: calloutType,
          title: title,
          text: text
        });
      } else {
        blocks.push({
          type: 'pull_quote',
          text: node.textContent.trim()
        });
      }
    } else if (tagName === 'table') {
      const headers = [];
      const rows = [];
      const ths = node.querySelectorAll('thead th');
      ths.forEach(th => headers.push(th.textContent.trim()));
      const trs = node.querySelectorAll('tbody tr');
      trs.forEach(tr => {
        const row = [];
        tr.querySelectorAll('td').forEach(td => row.push(td.textContent.trim()));
        rows.push(row);
      });
      blocks.push({ type: 'table', headers, rows });
    } else if (tagName === 'ul' || tagName === 'ol') {
      // Convert lists to paragraph blocks
      const items = [];
      node.querySelectorAll('li').forEach(li => items.push(li.textContent.trim()));
      blocks.push({
        type: 'paragraph',
        text: items.map(i => `• ${i}`).join('<br/>')
      });
    }
  });

  return blocks;
}

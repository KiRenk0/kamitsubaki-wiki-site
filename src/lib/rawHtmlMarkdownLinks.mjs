const INTERNAL_DESTINATION = /^(?:\/(?!\/)|#)[^\s<>"']+$/u;

function escapeAttribute(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeText(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function unescapeMarkdown(value) {
  return value.replace(/\\([\\()[\]])/gu, '$1');
}

function findLabelEnd(value, start) {
  for (let index = start; index < value.length; index += 1) {
    if (value[index] === '\\') {
      index += 1;
      continue;
    }
    if (value[index] === ']') return index;
  }
  return -1;
}

function findDestinationEnd(value, start) {
  let depth = 0;

  for (let index = start; index < value.length; index += 1) {
    const character = value[index];
    if (character === '\\') {
      index += 1;
      continue;
    }
    if (/\s/u.test(character)) return -1;
    if (character === '(') {
      depth += 1;
      continue;
    }
    if (character !== ')') continue;
    if (depth === 0) return index;
    depth -= 1;
  }

  return -1;
}

function materializeLinksInText(value) {
  let cursor = 0;
  let output = '';

  while (cursor < value.length) {
    const labelStart = value.indexOf('[', cursor);
    if (labelStart === -1) break;
    if (labelStart > 0 && value[labelStart - 1] === '\\') {
      output += value.slice(cursor, labelStart + 1);
      cursor = labelStart + 1;
      continue;
    }

    const labelEnd = findLabelEnd(value, labelStart + 1);
    if (labelEnd === -1 || value[labelEnd + 1] !== '(') {
      output += value.slice(cursor, labelStart + 1);
      cursor = labelStart + 1;
      continue;
    }

    const destinationStart = labelEnd + 2;
    const destinationEnd = findDestinationEnd(value, destinationStart);
    if (destinationEnd === -1) {
      output += value.slice(cursor, labelStart + 1);
      cursor = labelStart + 1;
      continue;
    }

    const label = unescapeMarkdown(value.slice(labelStart + 1, labelEnd));
    const destination = unescapeMarkdown(value.slice(destinationStart, destinationEnd));
    if (!label || !INTERNAL_DESTINATION.test(destination)) {
      output += value.slice(cursor, labelStart + 1);
      cursor = labelStart + 1;
      continue;
    }

    output += value.slice(cursor, labelStart);
    output += `<a href="${escapeAttribute(destination)}">${escapeText(label)}</a>`;
    cursor = destinationEnd + 1;
  }

  return output + value.slice(cursor);
}

export function materializeMarkdownLinksInRawHtml(value) {
  let output = '';
  let textStart = 0;
  let tagStart = -1;
  let quote = '';

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (tagStart === -1) {
      if (character !== '<') continue;
      output += materializeLinksInText(value.slice(textStart, index));
      tagStart = index;
      continue;
    }

    if (quote) {
      if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character !== '>') continue;

    output += value.slice(tagStart, index + 1);
    tagStart = -1;
    textStart = index + 1;
  }

  if (tagStart === -1) return output + materializeLinksInText(value.slice(textStart));
  return output + value.slice(tagStart);
}

export default function rehypeRawHtmlMarkdownLinks() {
  return (tree) => {
    const visit = (node) => {
      if (node?.type === 'raw' && typeof node.value === 'string') {
        node.value = materializeMarkdownLinksInRawHtml(node.value);
      }
      if (!Array.isArray(node?.children)) return;
      for (const child of node.children) visit(child);
    };

    visit(tree);
  };
}

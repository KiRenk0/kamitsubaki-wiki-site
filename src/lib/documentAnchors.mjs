// Sanitization prefixes authored IDs to prevent DOM clobbering. References
// must follow the same IDs, including footnotes and their accessible labels.
export default function rehypeDocumentAnchors({ prefix } = {}) {
  return (tree) => {
    if (!prefix) return;
    const ids = new Set();
    const visit = (node, callback) => {
      if (node.type === "element") callback(node);
      node.children?.forEach((child) => visit(child, callback));
    };
    visit(tree, (node) => {
      if (typeof node.properties?.id === "string") ids.add(node.properties.id);
    });
    const target = (value) =>
      ids.has(prefix + value) ? prefix + value : value;
    visit(tree, (node) => {
      const properties = node.properties;
      if (!properties) return;
      if (
        typeof properties.href === "string" &&
        properties.href.startsWith("#")
      ) {
        const original = properties.href.slice(1);
        try {
          // Markdown footnote IDs may themselves contain percent escapes;
          // authored HTML IDs may instead contain literal Unicode characters.
          const decoded = decodeURIComponent(original);
          const resolved = ids.has(prefix + original)
            ? prefix + original
            : target(decoded);
          if (ids.has(prefix + original) || resolved !== decoded)
            properties.href = "#" + encodeURIComponent(resolved);
        } catch {
          /* Keep malformed authored fragments unchanged. */
        }
      }
      for (const name of ["ariaDescribedBy", "ariaLabelledBy"]) {
        const value = properties[name];
        if (Array.isArray(value)) properties[name] = value.map(target);
        else if (typeof value === "string")
          properties[name] = value.split(/\s+/).map(target).join(" ");
      }
    });
  };
}

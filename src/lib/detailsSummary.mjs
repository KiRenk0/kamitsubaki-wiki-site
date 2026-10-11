// Keep legacy authored bodies intact while rendering a valid disclosure header.
export default function rehypeDetailsSummary() {
  return (tree) => {
    const visit = (node) => {
      if (!Array.isArray(node?.children)) return;
      if (node.type === 'element' && node.tagName === 'details') {
        const index = node.children.findIndex(child => child.type === 'element' && child.tagName === 'summary');
        if (index > 0) {
          const [summary] = node.children.splice(index, 1);
          node.children.unshift(summary);
        }
      }
      for (const child of node.children) visit(child);
    };
    visit(tree);
  };
}

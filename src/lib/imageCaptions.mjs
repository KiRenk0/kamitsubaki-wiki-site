// The saved marker belongs to the preceding image, rather than an unrelated
// following paragraph. Preserve ordinary paragraphs and malformed markers.
export default function remarkImageCaptions() {
  return (tree) => {
    const visit = (node) => {
      if (!Array.isArray(node?.children)) return;
      for (let index = 1; index < node.children.length - 1; index++) {
        const marker = node.children[index],
          image = node.children[index - 1],
          caption = node.children[index + 1];
        if (
          marker.type !== "html" ||
          marker.value.trim() !== "<!-- wiki-editor:image-caption -->" ||
          image.type !== "paragraph" ||
          image.children?.length !== 1 ||
          image.children[0].type !== "image" ||
          caption.type !== "paragraph"
        )
          continue;
        node.children.splice(index - 1, 3, {
          type: "paragraph",
          data: { hName: "figure" },
          children: [
            image.children[0],
            { ...caption, data: { ...caption.data, hName: "figcaption" } },
          ],
        });
        index--;
      }
      node.children.forEach(visit);
    };
    visit(tree);
  };
}

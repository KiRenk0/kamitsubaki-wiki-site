import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { articleHTML } from "../src/lib/articleMarkdownRenderer.mjs";
import { renderMarkdownDocument } from "../src/lib/markdown.mjs";
const read = (html) => new JSDOM("<main>" + html + "</main>");
test("article tables retain inline formats, Wiki content, alignment and inline formulas", () => {
  const dom = read(
    articleHTML(
      "| 名称 | 内容 |\n| :--- | ---: |\n| **花譜** | {{ruby::花譜::かふ}} 与 $x^2$ |",
    ),
  );
  try {
    const root = dom.window.document;
    assert.equal(root.querySelector("td strong").textContent, "花譜");
    assert.equal(root.querySelector("td rt").textContent, "かふ");
    assert.ok(root.querySelector("td .katex"));
    assert.equal(
      root.querySelector("tbody tr td:last-child").getAttribute("align"),
      "right",
    );
    assert.ok(!root.querySelector("td").textContent.includes("**"));
  } finally {
    dom.window.close();
  }
});
test("articles and entity Markdown use the same nested-list, disclosure, image-caption and HTML-table policy", async () => {
  const source =
    '- **外层**\n  - {{spoiler::内层}}\n\n> 引用 $a+b$。\n\n{{details::资料}}\n\n![说明](/images/sample.png)\n\n<!-- wiki-editor:image-caption -->\n\n图片来源。\n\n{{/details}}\n\n<table><tr><th>列</th></tr><tr><td width="180" colspan="2"><ruby>花譜<rt class="furi">かふ</rt></ruby></td></tr></table>';
  const article = read(articleHTML(source)),
    entity = read((await renderMarkdownDocument(source)).html);
  try {
    for (const dom of [article, entity]) {
      const root = dom.window.document;
      assert.ok(root.querySelector("ul ul .wiki-spoiler"));
      assert.ok(root.querySelector("blockquote .katex"));
      assert.equal(root.querySelector("details summary").textContent, "资料");
      assert.equal(
        root.querySelector("figure figcaption").textContent,
        "图片来源。",
      );
      assert.equal(root.querySelector("td").getAttribute("width"), "180");
      assert.equal(root.querySelector("td").getAttribute("colspan"), "2");
      assert.equal(root.querySelector("td rt").textContent, "かふ");
    }
  } finally {
    article.window.close();
    entity.window.close();
  }
});
test("code examples remain literal and hostile authored HTML cannot become interactive content", () => {
  const dom = read(
    articleHTML(
      '`{{ruby::例::れい}}` 与 `![例](/image.png)`。\n\n```md\n<!-- wiki-editor:image-caption -->\n$x^2$\n```\n\n<script>alert(1)</script><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">坏链接</a><iframe src="https://evil.example"></iframe>',
    ),
  );
  try {
    const root = dom.window.document;
    assert.equal(root.querySelector("code").textContent, "{{ruby::例::れい}}");
    assert.ok(root.querySelector("pre code").textContent.includes("$x^2$"));
    assert.equal(
      root.querySelector('script,iframe,[onerror],a[href^="javascript:"]'),
      null,
    );
    assert.equal(root.querySelector("ruby,.katex"), null);
  } finally {
    dom.window.close();
  }
});
test("ordinary image-following paragraphs remain independent and footnotes have readable locale labels", () => {
  const dom = read(
    articleHTML(
      "![说明](/image.png)\n\n这是一段独立正文。\n\n注释[^one]。\n\n[^one]: 说明正文。",
      "zh",
    ),
  );
  try {
    const root = dom.window.document;
    assert.equal(root.querySelector("figure"), null);
    assert.equal(
      root.querySelector("[data-footnotes] h2").textContent,
      "参考注释",
    );
    assert.ok(
      root
        .querySelector("[data-footnote-backref]")
        .getAttribute("aria-label")
        .includes("返回正文"),
    );
  } finally {
    dom.window.close();
  }
});
test("sanitized footnotes and authored anchors point to real targets without restoring unsafe IDs", async () => {
  const source =
    '正文[^注释]，再次引用[^注释]。\n\n[^注释]: 注释正文。\n\n<a href="#constructor">内部跳转</a><div id="constructor">目标</div><a href="#%E4%B8%AD%E6%96%87">中文跳转</a><p id="中文">中文目标</p><a href="#missing">缺失目标</a>';
  for (const html of [
    articleHTML(source),
    (await renderMarkdownDocument(source)).html,
  ]) {
    const dom = read(html);
    try {
      const root = dom.window.document;
      for (const link of root.querySelectorAll('a[href^="#"]')) {
        if (link.getAttribute("href") === "#missing") continue;
        assert.ok(
          root.getElementById(
            decodeURIComponent(link.getAttribute("href").slice(1)),
          ),
          link.outerHTML,
        );
      }
      for (const element of root.querySelectorAll("[aria-describedby]")) {
        for (const id of element.getAttribute("aria-describedby").split(/\s+/))
          assert.ok(root.getElementById(id));
      }
      assert.equal(root.getElementById("constructor"), null);
      assert.ok(root.getElementById("wiki-content-constructor"));
      assert.equal(root.querySelectorAll("[data-footnote-ref]").length, 2);
    } finally {
      dom.window.close();
    }
  }
});

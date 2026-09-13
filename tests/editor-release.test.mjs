import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { submissionCopy } from "../src/lib/editorSubmissionCopy.mjs";

test("production can never activate local identities even when a local flag is supplied", async () => {
  const source = await readFile(
    new URL("../src/lib/editorConfig.mjs", import.meta.url),
    "utf8",
  );
  for (const dev of [true, false]) {
    const compiled = source
      .replaceAll("import.meta.env.PUBLIC_EDITOR_ENABLED", '"true"')
      .replaceAll("import.meta.env.PUBLIC_EDITOR_LOCAL", '"true"')
      .replaceAll(
        "import.meta.env.PUBLIC_EDITOR_API_BASE",
        '"https://api.example.test"',
      )
      .replaceAll("import.meta.env.DEV", String(dev));
    const config = await import(
      "data:text/javascript;base64," + Buffer.from(compiled).toString("base64")
    );
    assert.equal(config.editorEnabled, true);
    assert.equal(config.localEditor, dev);
    assert.equal(config.editorApiBase, dev ? "" : "https://api.example.test");
  }
});

test("submission controls have English, Japanese and traditional Chinese copy", async () => {
  const source = await readFile(
    new URL("../src/components/editor/EditorPrDemo.astro", import.meta.url),
    "utf8",
  );
  const keys = [...source.matchAll(/t\('([^']+)'\)/g)].map((m) => m[1]);
  assert.ok(keys.length > 40);
  for (const locale of ["en", "ja", "zh-tw", "zh-hk"]) {
    const copy = submissionCopy(locale);
    for (const key of keys) assert.ok(copy[key], `${locale}: ${key}`);
  }
  for (const locale of ["en", "ja"])
    for (const key of keys)
      assert.notEqual(submissionCopy(locale)[key], key, `${locale}: ${key}`);
});

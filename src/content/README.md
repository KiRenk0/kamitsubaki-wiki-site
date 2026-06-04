# Content Directory

This directory contains editable wiki content. Implementation code should read this content through Astro Content Collections instead of hardcoding records in components.

Use one JSON file per locale:

```text
translation-key.zh.json
translation-key.ja.json
translation-key.en.json
```

Keep `translationKey` identical across all translations of the same record.

See `docs/content-editing.md` for the full editing guide.


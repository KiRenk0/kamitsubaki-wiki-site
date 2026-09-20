import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { glob } from 'astro/loaders';
import { convertChineseContentValue } from './traditionalChinese.mjs';

function withoutRenderedContent(entry) {
  return {
    id: entry.id,
    data: convertChineseContentValue(entry.data, entry.data?.locale),
    filePath: entry.filePath,
    digest: entry.digest,
    assetImports: entry.assetImports,
  };
}

/**
 * Load Markdown collection metadata without placing every rendered article in
 * Astro's global data-store module. Article pages render their source file on
 * demand through renderContentEntry(), keeping the Vite server entry small.
 */
export function metadataOnlyGlob(options) {
  const globOptions=options;
  const loader = glob({ ...globOptions, generateId: ({ entry, data }) => data.schemaVersion===2 ? `${data.id}/${data.locale}` : entry.replace(/\.md$/, ''), retainBody: false });

  return {
    ...loader,
    name: 'metadata-only-glob-loader',
    async load(context) {
      const compactStore = {
        ...context.store,
        set(entry) {
          return context.store.set(withoutRenderedContent(entry));
        },
      };

      // The built-in glob loader receives Astro's entry type registry at
      // runtime. Removing only the eager render hook retains Astro's native
      // frontmatter parsing, IDs, validation, digests, and file watching.
      const entryTypes = context.entryTypes instanceof Map
        ? new Map(context.entryTypes)
        : context.entryTypes;
      const markdownEntryType = entryTypes?.get?.('.md');

      if (markdownEntryType?.getRenderFunction) {
        entryTypes.set('.md', {
          ...markdownEntryType,
          getRenderFunction: undefined,
        });
      }

      await loader.load({ ...context, store: compactStore, entryTypes });

      // A now-empty glob may return without pruning its previous store.
      // Remove only entries whose source was deleted, including empty collections.
      await Promise.all([...context.store.entries()].map(async ([id, entry]) => {
        if (!entry.filePath) return;
        try { await access(resolve(entry.filePath)); }
        catch (error) {
          if (error.code === 'ENOENT') context.store.delete(id);
          else throw error;
        }
      }));

      // Compact an existing cache created before this loader was enabled.
      for (const [id, entry] of context.store.entries()) {
        if (!entry.body && !entry.rendered && !entry.deferredRender) continue;
        context.store.delete(id);
        context.store.set(withoutRenderedContent(entry));
      }
    },
  };
}

export { withoutRenderedContent };

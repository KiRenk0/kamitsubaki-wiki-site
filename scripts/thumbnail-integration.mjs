import { fileURLToPath } from 'node:url';
import { resolve, sep } from 'node:path';
import { generateThumbnails } from './generate-thumbnails.mjs';

export default function thumbnails() {
  let root;
  return {
    name: 'wiki-static-thumbnails',
    hooks: {
      'astro:config:setup': async ({ config, logger }) => {
        root = fileURLToPath(config.root);
        await generateThumbnails({ root, log: message => logger.info(message) });
      },
      'astro:server:setup': ({ server, logger }) => {
        let timer, running = Promise.resolve();
        const imageRoot = resolve(root, 'public/images') + sep;
        const update = path => {
          if (!resolve(path).startsWith(imageRoot)) return;
          clearTimeout(timer);
          timer = setTimeout(() => {
            running = running.then(() => generateThumbnails({ root, log: message => logger.info(message) }))
              .then(() => server.ws.send({ type: 'full-reload' }))
              .catch(error => logger.error(`Thumbnail generation failed: ${error.message}`));
          }, 350);
        };
        server.watcher.on('add', update).on('change', update).on('unlink', update);
        server.httpServer?.once('close', () => {
          clearTimeout(timer);
          server.watcher.off('add', update).off('change', update).off('unlink', update);
        });
      },
    },
  };
}

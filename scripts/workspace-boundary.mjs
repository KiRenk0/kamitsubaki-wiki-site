import { workspaceAccountRegistry } from '../src/lib/centralAccountOrigins.mjs';

// Development-only policy. No production/preview-server hooks are installed.
export default function workspaceBoundary() {
  return {
    name: 'workspace-local-boundary',
    configureServer(server) {
      if (process.env.WORKSPACE_ISOLATED !== 'true') return;
      const registry = workspaceAccountRegistry(process.env);
      if (!registry) throw new Error('Workspace requires PUBLIC_WORKSPACE_ISOLATED=true and exact service origins');
      const origins = Object.values(registry).join(' ');
      const sockets = Object.values(registry).map(origin => origin.replace('http:', 'ws:')).join(' ');
      const policy = [
        "default-src 'self'",
        `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${registry.api}`,
        "style-src 'self' 'unsafe-inline'",
        "font-src 'self' data:",
        `img-src 'self' data: blob: ${origins}`,
        "media-src 'self' blob:",
        "worker-src 'self' blob:",
        `connect-src 'self' ${origins} ${sockets}`,
        `form-action 'self' ${origins}`,
        `frame-src 'self' ${origins}`,
        "base-uri 'self'",
        "object-src 'none'",
      ].join('; ');
      server.middlewares.use(async (request, response, next) => {
        response.setHeader('Content-Security-Policy', policy);
        response.setHeader('X-Workspace-Environment', 'isolated-local');
        // Pages Functions serve these routes in production. The isolated harness
        // supplies the same renderer through the registered local API only.
        const pathname = new URL(request.url, registry.wiki).pathname;
        if (request.method !== 'GET' || !/^\/(zh|zh-tw|zh-hk|ja|en)\/community\/(activities|series)\/(?!apply\/?$|read\/?$)[-a-z0-9]+\/?$/.test(pathname)) return next();
        try {
          const result = await fetch(new URL('/__local__/render' + pathname, registry.api), { redirect: 'error' });
          if (result.status === 404) return next();
          response.statusCode = result.status;
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.end(await result.text());
        } catch { next(); }
      });
    },
  };
}

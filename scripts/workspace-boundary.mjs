// Browser-side isolation for the explicitly selected local workspace preview.
export default function workspaceBoundary() {
  return {
    name: 'workspace-local-boundary',
    configureServer(server) {
      if (process.env.WORKSPACE_ISOLATED !== 'true') return;
      server.middlewares.use((_request, response, next) => {
        response.setHeader('Content-Security-Policy', "connect-src 'self' http://127.0.0.1:* ws://127.0.0.1:*; form-action 'self' http://127.0.0.1:*; frame-src 'self' http://127.0.0.1:*; base-uri 'self'");
        response.setHeader('X-Workspace-Environment', 'isolated-local');
        next();
      });
    },
  };
}

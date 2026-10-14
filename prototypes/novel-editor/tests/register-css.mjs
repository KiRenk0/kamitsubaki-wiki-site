import { registerHooks } from 'node:module';
// Node serialization tests do not render CSS. Novel's optional Tweet renderer
// imports CSS modules through its public barrel; Vite handles those in the app.
registerHooks({ load(url, context, nextLoad) {
  if (url.endsWith('.css')) return { format: 'module', source: 'export default {};', shortCircuit: true };
  return nextLoad(url, context);
} });

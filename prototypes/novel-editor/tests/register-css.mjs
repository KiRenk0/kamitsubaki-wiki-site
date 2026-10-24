import { register } from 'node:module';
// Node serialization tests do not render CSS. Novel's optional Tweet renderer
// imports CSS modules through its public barrel; Vite handles those in the app.
// Async hooks compose with tsx on the website's required Node 22 runtime.
register('./css-loader.mjs', import.meta.url);

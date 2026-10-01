import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('homepage intro uses the supplied video path with a theme-specific treatment and static fallbacks', async () => {
  const [component, darkLogo, lightLogo] = await Promise.all([
    readSource('../src/components/SiteIntro.astro'),
    readSource('../public/brand/main-logo-dark.svg'),
    readSource('../public/brand/main-logo-light.svg'),
  ]);

  assert.match(darkLogo, /<svg[^>]+viewBox="0 0 400 400"/);
  assert.match(lightLogo, /<svg[^>]+viewBox="0 0 400 400"/);
  assert.doesNotMatch(darkLogo, /<script|javascript:/i);
  assert.doesNotMatch(lightLogo, /<script|javascript:/i);
  assert.match(component, /src="\/brand\/main-logo-dark\.svg"/);
  assert.match(component, /src="\/brand\/main-logo-light\.svg"/);
  assert.match(component, /src="\/brand\/site-intro-light\.mp4"/);
  assert.match(component, /data-site-intro-video/);
  assert.doesNotMatch(component, /\sautoplay/);
  assert.match(component, /html:not\(\[data-theme='light'\]\)[\s\S]*site-intro__video[\s\S]*filter:\s*invert\(1\)/);
  assert.match(component, /html\[data-theme='light'\][\s\S]*site-intro__static-logo--light[\s\S]*display:\s*block/);
});

test('intro has a reduced-motion path and does not block non-home pages', async () => {
  const [component, interactions] = await Promise.all([
    readSource('../src/components/SiteIntro.astro'),
    readSource('../src/scripts/siteInteractions.js'),
  ]);

  assert.match(component, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(interactions, /prefersReducedMotion \? 900/);
  assert.match(interactions, /introVideo\.pause\(\)/);
  assert.match(interactions, /document\.documentElement\.classList\.remove\('site-intro-enabled'\);[\s\S]*startReveals\(\)/);
});

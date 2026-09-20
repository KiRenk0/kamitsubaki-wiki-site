import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

function projectUrl(path) {
  return new URL(path, import.meta.url);
}

function readProjectFile(path) {
  return readFile(projectUrl(path), 'utf8');
}

test('memory corridor has a localized wrapper, static runner, and required sprites', async () => {
  const requiredFiles = [
    '../src/pages/[locale]/games/memory-corridor.astro',
    '../public/games/memory-corridor/index.html',
    '../public/games/memory-corridor/assets/memory-corridor-pixel-bg.png',
    '../public/games/memory-corridor/assets/creature-idle.png',
    '../public/games/memory-corridor/assets/creature-jump.png',
    '../public/games/memory-corridor/assets/creature-run-a.png',
    '../public/games/memory-corridor/assets/creature-run-b.png',
  ];

  await Promise.all(requiredFiles.map((path) => access(projectUrl(path))));

  const wrapper = await readProjectFile('../src/pages/[locale]/games/memory-corridor.astro');
  assert.match(wrapper, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(wrapper, /params\.toString\(\)/);
  assert.match(wrapper, /memory-corridor-frame/);
  assert.match(wrapper, /'zh-tw': \{[\s\S]*title: '記憶迴廊'/);
  assert.match(wrapper, /'zh-hk': \{[\s\S]*title: '記憶迴廊'/);
});

test('runner turns three recovered clues into a route decision and clickable memory path', async () => {
  const runner = await readProjectFile('../public/games/memory-corridor/index.html');

  assert.match(runner, /id="routeDecision"/);
  assert.match(runner, /id="routeClues"/);
  assert.match(runner, /function openRouteDecision\(\)/);
  assert.match(runner, /function chooseRoute\(choice\)/);
  assert.match(runner, /world\.routeRound >= 3/);
  assert.match(runner, /function renderMemoryPath\(container\)/);
  assert.match(runner, /id="completePath"/);
});

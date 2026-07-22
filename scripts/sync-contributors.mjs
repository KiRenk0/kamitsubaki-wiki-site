import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { collectContributionEvents } from './contributor-history.mjs';
import { CONTRIBUTOR_SYNC_BATCH_SIZE as SYNC_BATCH_SIZE } from './contributor-sync-client.mjs';
import { createGithubIdentityResolver } from './github-contributor-identity.mjs';

const apiBase = process.env.CONTRIBUTORS_API_BASE || process.env.PUBLIC_AI_OBSERVER_API_BASE;
const syncToken = process.env.CONTRIBUTOR_SYNC_TOKEN;
const githubToken = process.env.GITHUB_TOKEN || '';
const githubRepository = process.env.GITHUB_REPOSITORY || '';
const commitBaseUrl = process.env.CONTRIBUTORS_COMMIT_BASE_URL || 'https://github.com/linkth1rsty/kamitsubaki-wiki-site/commit';
const backendRepositoryPath = process.env.CONTRIBUTORS_BACKEND_REPO_PATH || '';
const backendGithubRepository = process.env.CONTRIBUTORS_BACKEND_GITHUB_REPOSITORY || '';
const backendCommitBaseUrl = process.env.CONTRIBUTORS_BACKEND_COMMIT_BASE_URL || '';

export async function consumeGitLogRecords(stream, onRecord) {
  let pending = '';

  for await (const chunk of stream) {
    pending += chunk;
    const records = pending.split('\x1e');
    pending = records.pop() || '';

    for (const record of records) {
      if (record.trim()) await onRecord(record);
    }
  }

  if (pending.trim()) await onRecord(pending);
}

export async function collectRepositoryEvents({ cwd = '.', repository = 'site', githubRepositoryName = '', baseUrl = commitBaseUrl }) {
  const child = spawn('git', [
    'log',
    '--name-only',
    '--format=%x1e%H%x1f%an%x1f%ae%x1f%aI%x1f%s',
    '--',
    '.',
  ], { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');

  let stderr = '';
  child.stderr.on('data', (chunk) => {
    stderr = `${stderr}${chunk}`.slice(-64 * 1024);
  });
  const completed = new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`git log failed (${signal || code}): ${stderr.trim()}`));
    });
  });

  const events = [];
  await consumeGitLogRecords(child.stdout, (record) => {
    events.push(...collectContributionEvents(record, baseUrl, { repository })
      .map((event) => ({ ...event, githubRepository: githubRepositoryName })));
  });
  await completed;
  return events;
}

async function collectEvents() {
  const events = await collectRepositoryEvents({ githubRepositoryName: githubRepository });
  if (backendRepositoryPath && backendGithubRepository && backendCommitBaseUrl) {
    events.push(...await collectRepositoryEvents({
      cwd: backendRepositoryPath,
      repository: 'backend',
      githubRepositoryName: backendGithubRepository,
      baseUrl: backendCommitBaseUrl,
    }));
  }
  return events;
}

export function filterGithubContributionEvents(events) {
  return events.filter((event) => (
    event?.identity?.provider === 'github'
    && event?.contributor?.id?.startsWith('github:')
    && event?.contributor?.githubLogin
  ));
}

async function main() {
  if (!apiBase) {
    throw new Error('Set CONTRIBUTORS_API_BASE or PUBLIC_AI_OBSERVER_API_BASE before syncing contributors.');
  }
  if (!syncToken) {
    throw new Error('Set CONTRIBUTOR_SYNC_TOKEN before syncing contributors.');
  }

  const collectedEvents = await collectEvents();
  const identityResolvers = new Map();
  const resolverFor = (repository) => {
    if (!identityResolvers.has(repository)) {
      identityResolvers.set(repository, createGithubIdentityResolver({ token: githubToken, repository }));
    }
    return identityResolvers.get(repository);
  };
  let identityEnriched = 0;
  const resolvedEvents = await Promise.all(collectedEvents.map(async (event) => {
    const { githubRepository: eventRepository, ...publicEvent } = event;
    const fallback = { contributor: event.contributor, identity: event.identity };
    const resolved = await resolverFor(eventRepository || githubRepository)(event.commitSha, fallback);
    if (resolved.contributor.id !== fallback.contributor.id) identityEnriched += 1;
    return { ...publicEvent, ...resolved };
  }));
  const response = await fetch(new URL('/api/admin/contributors/sync', apiBase), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${syncToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'git-history',
      replaceSource: true,
      events,
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Contributor sync failed with ${response.status}: ${JSON.stringify(body)}`);
  }
  if (Number(body.accepted) !== events.length) {
    throw new Error(`Contributor sync accepted ${body.accepted ?? 0} of ${events.length} events.`);
  }

  console.log(`Synced ${body.accepted ?? events.length} contribution events from ${body.contributors ?? 0} contributors; ${identityEnriched} events enriched by GitHub.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

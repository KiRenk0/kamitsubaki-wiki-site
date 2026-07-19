import { execFileSync } from 'node:child_process';
import { collectContributionEvents } from './contributor-history.mjs';
import { createGithubIdentityResolver } from './github-contributor-identity.mjs';

const apiBase = process.env.CONTRIBUTORS_API_BASE || process.env.PUBLIC_AI_OBSERVER_API_BASE;
const syncToken = process.env.CONTRIBUTOR_SYNC_TOKEN;
const githubToken = process.env.GITHUB_TOKEN || '';
const githubRepository = process.env.GITHUB_REPOSITORY || '';
const commitBaseUrl = process.env.CONTRIBUTORS_COMMIT_BASE_URL || 'https://github.com/linkth1rsty/kamitsubaki-wiki-site/commit';
const backendRepositoryPath = process.env.CONTRIBUTORS_BACKEND_REPO_PATH || '';
const backendGithubRepository = process.env.CONTRIBUTORS_BACKEND_GITHUB_REPOSITORY || '';
const backendCommitBaseUrl = process.env.CONTRIBUTORS_BACKEND_COMMIT_BASE_URL || '';

function runGit(args, cwd = '.') {
  return execFileSync('git', args, { cwd, encoding: 'utf8' });
}

function collectRepositoryEvents({ cwd = '.', repository = 'site', githubRepositoryName = '', baseUrl = commitBaseUrl }) {
  const output = runGit([
    'log',
    '--name-only',
    '--format=%x1e%H%x1f%an%x1f%ae%x1f%aI%x1f%s',
    '--',
    '.',
  ], cwd);
  return collectContributionEvents(output, baseUrl, { repository })
    .map((event) => ({ ...event, githubRepository: githubRepositoryName }));
}

function collectEvents() {
  const events = collectRepositoryEvents({ githubRepositoryName: githubRepository });
  if (backendRepositoryPath && backendGithubRepository && backendCommitBaseUrl) {
    events.push(...collectRepositoryEvents({
      cwd: backendRepositoryPath,
      repository: 'backend',
      githubRepositoryName: backendGithubRepository,
      baseUrl: backendCommitBaseUrl,
    }));
  }
  return events;
}

async function main() {
  if (!apiBase) {
    throw new Error('Set CONTRIBUTORS_API_BASE or PUBLIC_AI_OBSERVER_API_BASE before syncing contributors.');
  }
  if (!syncToken) {
    throw new Error('Set CONTRIBUTOR_SYNC_TOKEN before syncing contributors.');
  }

  const collectedEvents = collectEvents();
  if (collectedEvents.length > 1000) {
    throw new Error(`Contributor sync produced ${collectedEvents.length} events; API limit is 1000.`);
  }
  const identityResolvers = new Map();
  const resolverFor = (repository) => {
    if (!identityResolvers.has(repository)) {
      identityResolvers.set(repository, createGithubIdentityResolver({ token: githubToken, repository }));
    }
    return identityResolvers.get(repository);
  };
  let identityEnriched = 0;
  const events = await Promise.all(collectedEvents.map(async (event) => {
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

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

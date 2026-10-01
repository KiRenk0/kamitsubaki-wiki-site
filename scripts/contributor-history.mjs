import { createHash } from 'node:crypto';

const localePattern = /^(zh|ja|en)$/;

export const CONTENT_CONTRIBUTION_COLLECTIONS = ['artists', 'albums', 'songs', 'projects', 'logs', 'people', 'units', 'isotopes', 'releases', 'lives', 'organizations', 'lore', 'articles', 'contribute', 'site'];
export const FUNCTIONAL_CONTRIBUTION_COLLECTIONS = ['development', 'documentation', 'design'];

function sha256(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

export function parseGithubLogin(email) {
  const normalized = String(email || '').trim().toLowerCase();
  const numbered = normalized.match(/^\d+\+([^@]+)@users\.noreply\.github\.com$/);
  if (numbered) {
    return numbered[1];
  }
  const plain = normalized.match(/^([^@]+)@users\.noreply\.github\.com$/);
  return plain ? plain[1] : '';
}

export function contributorFromAuthor(name, email) {
  const displayName = String(name || 'Contributor').trim();
  const githubLogin = parseGithubLogin(email);
  if (githubLogin) {
    return {
      contributor: {
        id: `github:${githubLogin}`,
        displayName: displayName || githubLogin,
        githubLogin,
        avatarUrl: `https://github.com/${githubLogin}.png?size=96`,
        profileUrl: `https://github.com/${githubLogin}`,
        isBot: /\[bot\]$/.test(githubLogin),
      },
      identity: { provider: 'github', providerKey: githubLogin },
    };
  }

  const emailHash = email ? sha256(String(email).trim().toLowerCase()) : sha256(displayName);
  return {
    contributor: {
      id: `git:${emailHash.slice(0, 16)}`,
      displayName,
      isBot: /\[bot\]$/i.test(displayName),
    },
    identity: { provider: 'git_email', providerKey: emailHash, emailHash },
  };
}

export function parseContentPath(path) {
  const parts = path.split('/');
  if (parts[0] !== 'src' || parts[1] !== 'content') {
    return null;
  }

  if (parts[2] === 'site') {
    const filename = parts[3] || '';
    const locale = filename.replace(/\.(json|md)$/, '');
    return localePattern.test(locale) ? { collection: 'site', entryId: 'home', locale } : null;
  }

  const collection = parts[2];
  if (!['artists', 'albums', 'songs', 'projects', 'logs', 'people', 'units', 'isotopes', 'releases', 'lives', 'organizations', 'lore', 'articles', 'contribute'].includes(collection)) {
    return null;
  }

  const filename = parts.at(-1) || '';
  const match = filename.match(/^([a-z]{2})\.mdx?$/);
  if (!match || !localePattern.test(match[1])) {
    return null;
  }

  const entryId = parts.slice(3, -1).join('/');
  return entryId ? { collection, entryId, locale: match[1] } : null;
}

export function parseFunctionalPath(path, { repository = 'site' } = {}) {
  const normalized = String(path || '').replace(/^\.\//, '');
  if (!normalized || normalized.startsWith('.contributor-sources/')) return null;

  if (normalized.startsWith('.github/')) {
    return { collection: 'development', entryId: 'automation', locale: null };
  }
  if (normalized.startsWith('tests/')) {
    return { collection: 'development', entryId: 'quality', locale: null };
  }
  if (/^(README(?:\.[^.]+)?\.md|DEPLOYMENT\.md|WORK_REPORT[^/]*\.md)$/.test(normalized) || normalized.startsWith('docs/')) {
    return { collection: 'documentation', entryId: repository === 'backend' ? 'backend-docs' : 'wiki-docs', locale: null };
  }
  if (normalized.startsWith('public/')) {
    return { collection: 'design', entryId: 'site-assets', locale: null };
  }

  if (repository === 'backend') {
    if (normalized.startsWith('migrations/')) {
      return { collection: 'development', entryId: 'data-platform', locale: null };
    }
    if (normalized.startsWith('src/') || normalized.startsWith('content/')) {
      return { collection: 'development', entryId: 'backend-services', locale: null };
    }
    if (/^(package\.json|pnpm-lock\.yaml|wrangler\.toml|\.dev\.vars\.example)$/.test(normalized)) {
      return { collection: 'development', entryId: 'backend-tooling', locale: null };
    }
    return null;
  }

  if (/^src\/(components|pages|scripts|styles|layouts)\//.test(normalized)) {
    return { collection: 'development', entryId: 'site-experience', locale: null };
  }
  if (normalized.startsWith('src/lib/') || normalized.startsWith('src/content.config') || normalized === 'astro.config.mjs') {
    return { collection: 'development', entryId: 'content-platform', locale: null };
  }
  if (normalized.startsWith('scripts/')) {
    return { collection: 'development', entryId: 'contributor-tooling', locale: null };
  }
  if (/^(package\.json|pnpm-lock\.yaml|tsconfig\.json)$/.test(normalized)) {
    return { collection: 'development', entryId: 'site-tooling', locale: null };
  }
  return null;
}

export function parseContributionPath(path, options) {
  return parseContentPath(path) || parseFunctionalPath(path, options);
}

export function collectContributionEvents(output, commitBaseUrl, { repository = 'site' } = {}) {
  const groups = new Map();
  const chunks = String(output || '').split('\x1e').filter(Boolean);

  for (const chunk of chunks) {
    const lines = chunk.trim().split(/\r?\n/).filter(Boolean);
    const [commitSha, authorName, authorEmail, committedAt, summary] = (lines.shift() || '').split('\x1f');
    if (!commitSha || !committedAt) {
      continue;
    }

    const author = contributorFromAuthor(authorName, authorEmail);
    for (const path of lines) {
      const parsed = parseContributionPath(path, { repository });
      if (!parsed) {
        continue;
      }
      const key = [commitSha, author.contributor.id, parsed.collection, parsed.entryId].join('\x1f');
      const existing = groups.get(key);
      if (existing) {
        existing.paths.push(path);
        existing.locales.push(parsed.locale);
        continue;
      }
      groups.set(key, {
        collection: parsed.collection,
        entryId: parsed.entryId,
        locale: parsed.locale,
        path,
        paths: [path],
        locales: [parsed.locale],
        commitSha,
        commitUrl: `${commitBaseUrl}/${commitSha}`,
        summary,
        committedAt,
        ...author,
      });
    }
  }

  return [...groups.values()].map((event) => ({
    ...event,
    paths: [...new Set(event.paths)].sort(),
    locales: [...new Set(event.locales)].sort(),
  }));
}

// Dedicated loopback origins keep a beta preview away from production accounts/data.
export function betaEnvironment(inherited={}) {
 const wiki='http://127.0.0.1:18430',api='http://127.0.0.1:18431',companion='http://127.0.0.1:18432';
 const env={...inherited,WORKSPACE_ISOLATED:'true',PUBLIC_WORKSPACE_ISOLATED:'true',
  PUBLIC_WORKSPACE_WIKI_ORIGIN:wiki,PUBLIC_WORKSPACE_API_ORIGIN:api,PUBLIC_WORKSPACE_COMPANION_ORIGIN:companion,
  PUBLIC_SITE_URL:wiki,PUBLIC_EDITOR_ENABLED:'true',PUBLIC_EDITOR_LOCAL:'false',
  PUBLIC_CONTENT_REPOSITORY:'https://github.com/KiRenk0/kamitsubaki-wiki-site',PUBLIC_CONTENT_BRANCH:'beta',
  PUBLIC_GALLERY_R2_URL:api,ONLINE_INTEGRATION:'false',VITE_CACHE_DIR:'node_modules/.vite-beta'};
 for(const name of ['PUBLIC_EDITOR_API_BASE','PUBLIC_ARTICLE_API_URL','PUBLIC_GALLERY_API_URL','PUBLIC_COMMUNITY_API_URL','PUBLIC_ARCHIVE_API_BASE','PUBLIC_AI_OBSERVER_API_BASE','PUBLIC_SUPPORT_API_BASE','PUBLIC_COLLABORATORS_API_BASE','PUBLIC_EVENTS_API_BASE'])env[name]=api;
 delete env.VISUAL_EXPLORER_LOCAL_ORIGIN;
 return env;
}

import { workspaceAccountRegistry } from '../src/lib/centralAccountOrigins.mjs';
import {activityPosterPreview} from './activity-poster-preview.mjs';

// Development-only policy. No production/preview-server hooks are installed.
export default function workspaceBoundary() {
  return {
    name: 'workspace-local-boundary',
    configureServer(server) {
      if (process.env.WORKSPACE_ISOLATED !== 'true') return;
      const registry = workspaceAccountRegistry(process.env);
      if (!registry) throw new Error('Workspace requires PUBLIC_WORKSPACE_ISOLATED=true and exact service origins');
      let dashboardTestVersion=0;
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
        if(pathname==='/__local__/posters'&&request.method==='GET'){
          response.setHeader('Content-Type','text/html; charset=utf-8');response.setHeader('Cache-Control','no-store');response.end(activityPosterPreview(registry));return;
        }
        if(pathname==='/__local__/posters/image'&&request.method==='GET'){
          const tall=new URL(request.url,registry.wiki).searchParams.get('shape')==='tall',w=tall?360:3000,h=tall?3000:360;
          response.setHeader('Content-Type','image/svg+xml');response.end(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="#183c38"/><rect x="12" y="12" width="${w-24}" height="${h-24}" fill="none" stroke="#fff" stroke-width="4"/><text x="24" y="70" fill="#fff" font-size="28">TEST ${w}×${h}</text><circle cx="${w/2}" cy="${h/2}" r="100" fill="#b44338"/><text x="24" y="${h-36}" fill="#fff" font-size="24">FULL ARTWORK</text></svg>`);return;
        }
        // Explicit test controls are available only behind the isolated dev hook.
        if(pathname==='/__local__/dashboard/viewport'&&request.method==='GET'){
          response.setHeader('Content-Type','text/html; charset=utf-8');
          const target=new URL(request.url,registry.wiki).searchParams.get('path')||'/zh/',safe=/^\/(?:__local__\/posters|(?:zh|zh-tw|zh-hk|ja|en)\/[^<>"']*)\??[^<>"']*$/.test(target)&&!target.startsWith('//')?target:'/zh/';
          const wide=new URL(request.url,registry.wiki).searchParams.get('width')==='1280',width=wide?1280:390;
          response.end('<!doctype html><meta charset="utf-8"><title>LOCAL ONLY '+width+'px Dashboard</title><style>body{margin:20px;background:#e8e8e8;font:14px system-ui}iframe{width:'+width+'px;height:'+(wide?'800px':'min(844px,calc(100dvh - 80px))')+';border:0;background:white;'+(wide?'transform:scale(.36);transform-origin:top left':'')+'}</style><p>LOCAL ONLY · '+width+'px'+(wide?' · scaled':'')+'</p><iframe title="'+width+'px dashboard" src="'+safe.replaceAll('&','&amp;')+'"></iframe>');return;
        }
        if(pathname==='/__local__/dashboard'&&request.method==='GET'){
          response.setHeader('Content-Type','text/html; charset=utf-8');response.setHeader('Cache-Control','no-store');
          response.end(`<!doctype html><html lang="zh"><meta charset="utf-8"><title>LOCAL ONLY Dashboard controls</title><style>body{font:16px/1.8 system-ui;max-width:700px;margin:40px auto;padding:20px}button,input,a{font:inherit;margin:10px;padding:10px}label{display:block}</style><h1>LOCAL ONLY · Dashboard 验收控制</h1><p>仅操作此本机来源的合成验收状态，不连接生产。首页支持五种语言。</p><button id="reset">清除面板记录并重播开场</button><button id="activity-cache">清除本机活动缓存</button><button id="yesterday">模拟上次展示为昨天</button><label>重要公告提醒版本 <input id="version" type="number" min="1" max="99" value="1"></label><button id="apply">应用测试版本</button><p id="status" role="status"></p><nav><a href="/zh/">中文首页</a><a href="/en/">English home</a><a href="/zh/#social-contact">旧社群锚点</a></nav><script>const key='kamitsubaki-dashboard:v1',status=document.getElementById('status');document.getElementById('reset').onclick=()=>{localStorage.removeItem(key);localStorage.removeItem(key+':preview');sessionStorage.removeItem(key);sessionStorage.removeItem('kamitsubaki-home-intro-seen');status.textContent='已清除，打开首页验证开场后弹出';};document.getElementById('activity-cache').onclick=()=>{for(const k of Object.keys(localStorage))if(k.startsWith('activity-center:v1:'))localStorage.removeItem(k);status.textContent='已清除本机活动缓存';};document.getElementById('yesterday').onclick=()=>{for(const k of [key,key+':preview']){const value=JSON.parse(localStorage.getItem(k)||'{}');value.day='2000-01-01';localStorage.setItem(k,JSON.stringify(value));}status.textContent='已设为昨天';};document.getElementById('apply').onclick=async()=>{const n=Math.max(1,Math.min(99,Number(document.getElementById('version').value)||1));await fetch('/__local__/dashboard/version?value='+n,{method:'POST'});status.textContent='本机提醒测试版本 '+n;};</script></html>`);return;
        }
        if(pathname==='/__local__/dashboard/version'&&request.method==='POST'&&request.headers?.origin===registry.wiki){dashboardTestVersion=Math.max(1,Math.min(99,Number(new URL(request.url,registry.wiki).searchParams.get('value'))||1));response.setHeader('Content-Type','application/json');response.end(JSON.stringify({localOnly:true,version:dashboardTestVersion}));return;}
        const qaVersion=dashboardTestVersion;
        if(request.method==='GET'&&qaVersion&&request.headers?.['x-workspace-dashboard-source']!=='1'&&/^\/(zh|zh-tw|zh-hk|ja|en)\/dashboard\/announcements\.json$/.test(pathname)){
          const upstream=await fetch(new URL(pathname,registry.wiki),{redirect:'error',headers:{'X-Workspace-Dashboard-Source':'1'}}),data=await upstream.json();
          if(data.items?.[0])data.items[0].reminderVersion=Number(qaVersion);
          response.statusCode=upstream.status;response.setHeader('Content-Type','application/json');response.setHeader('Cache-Control','no-store');response.end(JSON.stringify(data));return;
        }

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

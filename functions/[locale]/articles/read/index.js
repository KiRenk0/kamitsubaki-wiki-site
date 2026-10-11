export async function onRequestGet({request,env,params}){
 const url=new URL(request.url),id=url.searchParams.get('id');
 if(id&&/^[a-z0-9-]{1,120}$/.test(id))return Response.redirect(new URL(`/${params.locale}/articles/read/${encodeURIComponent(id)}/`,url),301);
 return env.ASSETS.fetch(request);
}

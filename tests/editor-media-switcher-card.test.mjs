import assert from 'node:assert/strict';
import test from 'node:test';
import { editorCopy } from '../src/lib/visualEditorCopy.mjs';
import { renderMediaSwitcherCard, previewMedia, spotifyCoverEndpoint, trustedSpotifyThumbnail, fetchSpotifyCover } from '../src/lib/editorPreview.mjs';

const block = {
  id:'switcher-test',type:'media-switcher',title:'MV & streaming',
  items:[
    {provider:'youtube',url:'https://youtu.be/3Wtx6k2vInU'},
    {provider:'bilibili',url:'BV1CJ411b7Ym'},
  ],
};

test('media switcher card exposes editable title, selected source, and resolved preview in the canvas',()=>{
  const html=renderMediaSwitcherCard(block,editorCopy('en'),{editable:true,activeIndex:1});
  assert.match(html,/data-prop="title" value="MV &amp; streaming"/);
  assert.match(html,/data-media="1:provider"/);
  assert.match(html,/data-media="1:url" value="BV1CJ411b7Ym"/);
  assert.match(html,/data-media-drag="switcher-test:1" draggable="true"/);
  assert.match(html,/aria-selected="true"[^>]*data-preview-provider="switcher-test:1"/);
  assert.match(html,/Link recognized/);
  assert.match(html,/BV1CJ411b7Ym/);
  assert.match(html,/href="https:\/\/www\.bilibili\.com\/video\/BV1CJ411b7Ym\?p=1"/);
  assert.match(html,/data-preview-media="switcher-test"/);
});

test('recognized media IDs link to their public pages instead of relative editor paths',()=>{
  const copy=editorCopy('en');
  const sources=[
    ['youtube','3Wtx6k2vInU',/href="https:\/\/www\.youtube\.com\/watch\?v=3Wtx6k2vInU"/],
    ['netease','1399849876',/href="https:\/\/music\.163\.com\/#\/song\?id=1399849876"/],
    ['qq-music','001ABCDEF',/href="https:\/\/y\.qq\.com\/n\/ryqq\/songDetail\/001ABCDEF"/],
  ];
  for(const [provider,url,expected] of sources){
    const html=renderMediaSwitcherCard({...block,items:[{provider,url},{provider:'bilibili',url:'BV1CJ411b7Ym'}]},copy,{activeIndex:0});
    assert.match(html,expected,provider);
  }
});

test('media switcher card distinguishes incomplete and unsafe links without embedding them',()=>{
  const draft={...block,title:'<img src=x onerror=alert(1)>',items:[{provider:'youtube',url:'javascript:alert(1)'},{provider:'bilibili',url:''}]};
  const unsafe=renderMediaSwitcherCard(draft,editorCopy('en'),{editable:true});
  assert.match(unsafe,/This platform link was not recognized/);
  assert.doesNotMatch(unsafe,/<img src=x|<iframe|href="javascript:/);
  assert.match(unsafe,/&lt;img src=x onerror=alert\(1\)&gt;/);
  const incomplete=renderMediaSwitcherCard(draft,editorCopy('en'),{editable:true,activeIndex:1});
  assert.match(incomplete,/Paste a platform link/);
  assert.match(incomplete,/data-media-remove="1" disabled/);
});

test('media switcher card labels are available across all site locales',()=>{
  for(const locale of ['zh','zh-tw','zh-hk','ja','en']) {
    const html=renderMediaSwitcherCard(block,editorCopy(locale),{editable:true});
    assert.doesNotMatch(html,/undefined/);
    assert.match(html,/role="tablist"/);
    assert.match(html,/role="status"/);
    assert.match(html,/data-media-add/);
  }
});

test('media previews use official Spotify metadata only and keep a Bilibili fallback',()=>{
  const spotify=previewMedia('spotify','spotify:track:4cOdK2wGLETKBW3PvgPWqT');
  assert.match(spotify,/data-media-cover-url="https:\/\/open\.spotify\.com\/track\/4cOdK2wGLETKBW3PvgPWqT"/);
  assert.match(spotify,/ve-media-cover--spotify/);
  const bilibili=previewMedia('bilibili','BV1CJ411b7Ym');
  assert.match(bilibili,/ve-media-cover--bilibili/);
  assert.match(bilibili,/BV1CJ411b7Ym/);
  assert.doesNotMatch(bilibili,/data-media-cover-url|hdslb\.com/);
  assert.equal(spotifyCoverEndpoint('javascript:alert(1)'),null);
  assert.equal(spotifyCoverEndpoint('spotify:track:4cOdK2wGLETKBW3PvgPWqT'),'https://open.spotify.com/oembed?url=https%3A%2F%2Fopen.spotify.com%2Ftrack%2F4cOdK2wGLETKBW3PvgPWqT');
});

test('Spotify cover enhancement validates its image origin and fails without blocking editing',async()=>{
  const image='https://i.scdn.co/image/ab67656300005f1ff8141e891abf749375772343';
  assert.equal(trustedSpotifyThumbnail(image),image);
  for(const unsafe of ['http://i.scdn.co/image/x','https://i.scdn.co.evil.test/image/x','https://spotifycdn.com.evil.test/x','data:image/png;base64,AA','https://user@i.scdn.co/image/x'])assert.equal(trustedSpotifyThumbnail(unsafe),null,unsafe);
  let request;
  const cover=await fetchSpotifyCover('spotify:track:4cOdK2wGLETKBW3PvgPWqT',async(endpoint,options)=>{request={endpoint,options};return {ok:true,json:async()=>({thumbnail_url:image})};});
  assert.equal(cover,image);
  assert.match(request.endpoint,/^https:\/\/open\.spotify\.com\/oembed\?url=/);
  assert.equal(request.options.credentials,'omit');
  assert.equal(await fetchSpotifyCover('spotify:track:4cOdK2wGLETKBW3PvgPWqT',async()=>{throw Error('offline');}),null);
  assert.equal(await fetchSpotifyCover('spotify:track:4cOdK2wGLETKBW3PvgPWqT',async()=>({ok:false})),null);
});

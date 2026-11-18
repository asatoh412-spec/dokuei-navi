const CN='dokuei-v2';
// activate で消すのは自分の古いキャッシュ（dokuei- で始まる名前）だけ。同じオリジンの別アプリのキャッシュには触らない。
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CN&&k.startsWith('dokuei-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
  const immut=/\/enc\/|\/fonts\/|icon-/.test(u.pathname);
  if(immut){e.respondWith(caches.open(CN).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;const r=await fetch(e.request);if(r.ok)c.put(e.request,r.clone());return r}));return}
  // 画面の殻（html・boot.js）は通信を先に。つながらないときだけキャッシュ（古い殻が新しい暗号化ファイル名を指せず 404 になるのを防ぐ）
  const key=new Request(u.origin+u.pathname);
  e.respondWith(caches.open(CN).then(c=>fetch(e.request,{cache:'no-cache'}).then(r=>{if(r.ok)c.put(key,r.clone());return r.ok?r:c.match(key).then(h=>h||r)}).catch(()=>c.match(key))))});
// 古い暗号化ファイルの掃除：boot.js が復号に成功した後、現在の版が使うファイルの一覧（pathname）を送ってくる。
// このフォルダー（SW の scope）の /enc/ のうち、一覧に無いものだけを消す。キャッシュは同じオリジンの全フォルダーで共有なので、他のフォルダーの分には触らない。
self.addEventListener('message',e=>{const d=e.data;if(!d||d.type!=='dk-clean'||!Array.isArray(d.keep)||d.keep.length<4)return;
  const keep=new Set(d.keep),pre=new URL(self.registration.scope).pathname+'enc/';
  e.waitUntil(caches.open(CN).then(c=>c.keys().then(rs=>Promise.all(rs.map(r=>{const p=new URL(r.url).pathname;return p.startsWith(pre)&&!keep.has(p)?c.delete(r):0})))).catch(()=>{}))});

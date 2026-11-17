const CN='dokuei-v2';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CN).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
  const immut=/\/enc\/|\/fonts\/|icon-/.test(u.pathname);
  if(immut){e.respondWith(caches.open(CN).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;const r=await fetch(e.request);if(r.ok)c.put(e.request,r.clone());return r}));return}
  // 画面の殻はキャッシュを即返し、裏で更新（次回から新版）
  const key=new Request(u.origin+u.pathname);
  e.respondWith(caches.open(CN).then(async c=>{const hit=await c.match(key);
    const net=fetch(e.request).then(r=>{if(r.ok)c.put(key,r.clone());return r}).catch(()=>hit);
    if(hit){e.waitUntil(net);return hit}return net}))});

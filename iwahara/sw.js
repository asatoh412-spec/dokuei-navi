const CN='dokuei-v1';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
  const immut=/\/enc\/|\/fonts\/|icon-/.test(u.pathname);
  if(immut){e.respondWith(caches.open(CN).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;const r=await fetch(e.request);if(r.ok)c.put(e.request,r.clone());return r}));return}
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cl=r.clone();caches.open(CN).then(c=>c.put(e.request,cl))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})))});

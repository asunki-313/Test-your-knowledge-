const CACHE_NAME="ikhtabr-v15.8-pwa";
const APP_SHELL=["./","./index.html","./manifest.webmanifest","./thinking_person.png","./quiz_background_v1415.png","./data/questions_cumulative_3500.json"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL).catch(()=>{})));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;const u=e.request.url;if(u.includes("firestore.googleapis.com")||u.includes("googleapis.com/identitytoolkit")||u.includes("securetoken.googleapis.com"))return;e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE_NAME).then(x=>x.put(e.request,c));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))));});

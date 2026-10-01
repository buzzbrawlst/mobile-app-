const CACHE="nova-v2";
const ASSETS=["./","./index.html","./manifest.json","./nova-icon.svg","./nova-enhance.js","./nova-enhance.css"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 const u=new URL(e.request.url);
 if(u.origin===location.origin&&u.pathname.endsWith("/index.html")){
  e.respondWith(fetch(e.request).then(async r=>{
   const html=await r.text();
   const patched=html.replace("</head>","<link rel="stylesheet" href="./nova-enhance.css"></head>").replace("</body>","<script src="./nova-enhance.js"></script></body>");
   return new Response(patched,{status:r.status,statusText:r.statusText,headers:r.headers});
  }).catch(()=>caches.match("./index.html")));
  return;
 }
 e.respondWith(caches.match(e.request).then(x=>x||fetch(e.request).then(r=>{const copy=r.clone();if(u.origin===location.origin)caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match("./index.html"))));
});
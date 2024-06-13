
const version = 1;
const cacheName = `Vinaydeep-Singh-Padda-${version}`;
const apiUrl = 'https://random-data-api.com/api/v2/users?size=20';


self.addEventListener('install', (ev) => self.skipWaiting() );


  self.addEventListener('activate', (ev) => {
    clients.claim().then(()=>{            
    console.log("service worker has now started working");
  })
});
          
self.addEventListener('message', (ev) => {
  if(ev.data.type === 'Cache-data'){
     cachedData(ev.data.payload);

  } else if(ev.data.Func === 'changeUser'){
sendMessageToMain({func: 'changeUser', uid: ev.data.uid});

  } else if(ev.data.type === 'goBack'){
    sendMessageToMain({type: 'goBack', cacheData: ev.data.cacheData});
    
  } else if(ev.data.type === 'changeColor'){
    sendMessageToMain({type: 'changeColor', color: ev.data.color}, ev.source.id);
  }
});
      
async function cachedData(data) {
  const cache = await caches.open(cacheName);
  const jsonData = JSON.stringify(data);
  let file = new File([jsonData], 'users.json', { type: 'application/json', lastModified: Date.now() });
  
  const response = new Response(file, {
    status: 200,
    statusText: 'ok',
    headers: {
      'content-type': file.type, 
      'content-length': file.size,
      'X-file': 'users.json'
      }  
      });
      await cache.put('users.json', response);
}

async function sendMessageToMain(message, clientId){
  let Clients = []
    if(clientId){
      const matched = await clients.matchAll({includeUncontrolled: true});
      Clients = matched.filter((item)=>{
       return item.id !== clientId
      })
    } else {
       Clients = await clients.matchAll({includeUncontrolled: true});
    }

      return Promise.all(Clients.map(client => {
      client.postMessage(message);
  }));
}

self.addEventListener('fetch', async (ev) => {
  const url = new URL(ev.request.url);
  if(url.href === apiUrl){
    ev.respondWith(
      caches.open(cacheName).then((cache)=>{
        return cache.match('users.json').then((cacheRes)=>{
          if(cacheRes) {
            return cacheRes;
          }else

          return fetch(ev.request).then(CacheRes => {
            cache.put('users.json', CacheRes.clone());
            return CacheRes;
          })
        })
      })
    )
  } 
});


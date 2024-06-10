// console.log('hehehhe')
const version = 5;
const cacheName = `Vinaydeep-Singh-Padda-${version}`;
const apiUrl = 'https://random-data-api.com/api/v2/users?size=20';
// let CacheRef;
// let fdata; 

self.addEventListener('install', (ev) => {
  //cache static files, if needed
    self.skipWaiting();
    });

    self.addEventListener('activate', (ev) => {
      //clear old caches, if desired
      
      
      clients.claim().then(()=>{            
        console.log("service worker has now started working");
        })
      
      ev.waitUntil(
          caches.keys().then((key)=>{
            return Promise.all(
              key.filter(key => {
                return( key != cacheName)
              }).map(key => caches.delete(key))
            )
          })
        )
      });

      self.addEventListener('message', (ev) => {
        if(ev.data.type === 'Cache-data'){
          // console.log(ev.data.payload);
           cachedData(ev.data.payload);
        } else if(ev.data.Func === 'changeUser'){
          // console.log(ev.data.uid)
          sendMessageToMain({func: 'changeUser', uid: ev.data.uid});
        }
      });

       async function cachedData(data) {
        const cache = await caches.open(cacheName);
             const jsonData = JSON.stringify(data);
    let file = new File([jsonData], 'users.json', { type: 'application/json', lastModified: Date.now() });

     response = new Response(file, {
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

        async function sendMessageToMain(message){
          const allClients = await clients.matchAll({includeUncontrolled: true});
          allClients.forEach(client => {
           
              client.postMessage(message);
         
          });
        }

        
 self.addEventListener('fetch', async (ev) => {

  const url = new URL(ev.request.url);
  if(url.href === apiUrl){
    ev.respondWith(
      caches.open(cacheName).then((cache)=>{
        return cache.match('users.json').then((cacheRes)=>{
          // console.log(cacheRes)
          if(cacheRes) {
            return cacheRes;
          }
          
          return fetch(ev.request).then(networkRes => {
            cache.put('users.json', networkRes.clone());
            return networkRes;
          })
        })
      })
    )
  } 
 });



// function sendMessageToMain(data) {
// }
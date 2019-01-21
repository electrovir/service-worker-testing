const staticCacheName = '/01-image-request-swap/';
const expectedCaches = [
    staticCacheName
];

self.addEventListener('install', (event) => {
    // console.log('INSTALLING THE THING', event);

    self.skipWaiting().then(function () {
        console.log('WE ARE NO LONGER WAITING BABY');
    });
    event.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            return cache.addAll([
                'background.png',
            ]);
        })
    );
});

self.addEventListener('activate', event => {
    clients.claim();
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (!expectedCaches.includes(key)) return caches.delete(key);
            })
        ))
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.url === 'background.png') {
        event.respondWith(caches.match(event.request).then((response) => {
            // caches.match() always resolves
            // but in case of success response will have value
            if (response !== undefined) {
                return response;
            } else {
                return fetch(event.request).then((response) => {
                    // response may be used only once
                    // we need to save clone to put one copy in cache
                    // and serve second one
                    let responseClone = response.clone();

                    caches.open('v1').then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                }).catch(() => {
                    throw new Error('OH NO ERROR IN FETCH');
                });
            }
        }));
    }
    const url = new URL(event.request.url);
    if (url.origin !== location.origin) {
        return;
    }
    console.log(event);
    if (url.pathname.endsWith('main.html')) {
        event.respondWith(fetch('another.html'));
    }
    else if (url.pathname.endsWith('911.png')) {
        event.respondWith(fetch('911gt3rs.png'));
    }
});
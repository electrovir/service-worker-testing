const currentDirName = '/04-double-intercept/';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    clients.claim();
});

function handleFetch(event) {
    console.log(`intercepting ${event.request.url}`);
    const requestURL = new URL(event.request.url);
    console.log(requestURL.pathname);
    if (requestURL.pathname === currentDirName) {
        const url = `${currentDirName}911.png`;
        console.log(`Fetching ${url}`);
        event.request.url = url;

        handleFetch({ request: new Request(url), respondWith: event.respondWith });
    }
    event.respondWith(fetch(event.request.url));
}

self.addEventListener('fetch', handleFetch);
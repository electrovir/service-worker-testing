const currentDirName = '/03-cache-and-stream/';
const backgroundURL = currentDirName + 'background.png'
const longHTMLURL = currentDirName + 'long.html'

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    clients.claim();
});

self.addEventListener('fetch', (event) => {
    const requestURL = new URL(event.request.url);

    if (requestURL.origin != location.origin) return;

    if (requestURL.pathname === currentDirName) {
        var response = new Response(
            new ReadableStream({
                start(controller) {
                    // Get promises for response objects for each page part
                    // The start and end come from a cache
                    var startFetch = caches.match(currentDirName).then(response => {
                        if (response !== undefined) {
                            // refresh the cache
                            fetch(currentDirName).then(innerResponse => {
                                let responseClone = innerResponse.clone();

                                caches.open(currentDirName).then(cache => {
                                    cache.put(currentDirName, responseClone);
                                });
                                return innerResponse;
                            }).catch(() => {
                                console.error('Failed to fetch the thing');
                            });
                            return response;
                        }
                        else {
                            return fetch(currentDirName).then(response => {
                                let responseClone = response.clone();

                                caches.open(currentDirName).then(cache => {
                                    cache.put(currentDirName, responseClone);
                                });
                                return response;
                            }).catch(() => {
                                console.error('Failed to fetch the thing');
                            });
                        }
                    });
                    // The middle comes from the network, with a fallback
                    var middleFetch = fetch(longHTMLURL);

                    function pushStream(stream) {
                        // Get a lock on the stream
                        var reader = stream.getReader();

                        return reader.read().then(function process(result) {
                            if (result.done) return;
                            // Push the value to the combined stream
                            controller.enqueue(result.value);
                            // Read more & process
                            return reader.read().then(process).catch(() => {
                                console.error('Failed to process the read');
                            });
                        }).catch(() => {
                            console.error('Failed to read');
                        });
                    }

                    // Get the start response
                    startFetch
                        // Push its contents to the combined stream
                        .then(response => pushStream(response.body))
                        // Get the middle response
                        .then(() => middleFetch)
                        // Push its contents to the combined stream
                        .then(response => pushStream(response.body))
                        // Close our stream, we're done!
                        .then(() => controller.close()).catch(() => {
                            console.error('Failed to fetch stuff');
                        });
                }
            }), {
                headers: { 'content-type': 'text/html' }
            });

        event.respondWith(response);
    }

    if (requestURL.pathname === backgroundURL) {
        event.respondWith(caches.match(backgroundURL).then((response) => {
            // caches.match() always resolves
            // but in case of success response will have value
            if (response !== undefined) {
                return response;
            } else {
                return fetch(event.request.url).then((response) => {
                    // response may be used only once
                    // we need to save clone to put one copy in cache
                    // and serve second one
                    let responseClone = response.clone();

                    caches.open(currentDirName).then((cache) => {
                        cache.put(backgroundURL, responseClone);
                    });
                    return response;
                }).catch(() => {
                    console.error('OH NO ERROR IN FETCH');
                });
            }
        }));
    }
});
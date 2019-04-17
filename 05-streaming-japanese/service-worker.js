const currentDirName = '/05-streaming-japanese/';
const backgroundUrl = currentDirName + 'background.png'
const jaHtmlUrl = currentDirName + 'japanese.html'
const simpleHtmlUrl = currentDirName + 'simple.html'

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    clients.claim();
});

self.addEventListener('fetch', (event) => {
    const requestURL = new URL(event.request.url);

    if (requestURL.origin != location.origin) return;

    if (requestURL.pathname === currentDirName) {
        const stream = new ReadableStream({
            start(controller) {

                // Fetch the japanese
                const mainFetch = fetch(jaHtmlUrl);

                // fetch a simple page with only one character for debugging
                // const mainFetch = fetch(simpleHtmlUrl);

                function pushStream(stream) {
                    // Get a lock on the stream
                    const reader = stream.getReader();

                    return reader.read().then(function process(result) {
                        if (result.done) return;
                        controller.enqueue(result.value);
                        // controller.enqueue('HEY DUDES');
                        // Read more & process
                        return reader.read().then(process).catch(() => {
                            console.error('Failed to process the read');
                        });
                    }).catch(() => {
                        console.error('Failed to read');
                    });
                }

                // Get the start response
                mainFetch
                    // Push its contents to the combined stream
                    .then(response => pushStream(response.body))
                    // Close our stream, we're done!
                    .then(() => controller.close()).catch(() => {
                        console.error('Failed to fetch stuff');
                    });
            }
        });
        const response = new Response(stream, {
            // make sure the charset is there!! Just text/html will result in mangled characters
            headers: { 'content-type': 'text/html; charset=utf-8' }
        });

        event.respondWith(response);
    }
});
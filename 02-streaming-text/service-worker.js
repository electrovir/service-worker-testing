self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    clients.claim();
});

self.addEventListener('fetch', event => {
    const requestURL = new URL(event.request.url);

    if (requestURL.origin != location.origin) return;

    if (requestURL.pathname.endsWith("/")) {
        event.respondWith(
            fetch('short.html').then(response => {
                return replaceResponse(response, 4, /(<script\s+.*?\s*src=".+)?"/ig, (...args) => {
                    console.log('dese are de argoomunts', args);
                    if (args[1].indexOf('?') > -1) {
                        return `${args[1]}&thing=cowpiedog"`
                    } else {
                        return `${args[1]}?thing=cowpiedog"`
                    }
                });
            })
        );
    }
});

// There are some fun edge cases when it comes to replacing within a stream,
// if you're interested, see:
// https://github.com/jakearchibald/isserviceworkerready/blob/master/src/demos/transform-stream/edge-cases.md
function replaceResponse(response, bufferSize, match, replacer) {
    const reader = response.body.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let bufferStr = '';

    const stream = new ReadableStream({
        pull: controller => {
            return reader.read().then(result => {
                if (result.done) {
                    controller.enqueue(encoder.encode(bufferStr));
                    controller.close();
                    return;
                }

                const bytes = result.value;
                bufferStr += decoder.decode(bytes, { stream: true });

                // this is the end of the final replacement in the FINAL string
                let lastReplaceEnds = 0;
                let replacedLengthDiff = 0;
                bufferStr = bufferStr.replace(match, (...args) => {
                    console.log(args);
                    const matched = args[0];
                    // offset is the offset in the original string, hence replacedLengthDiff
                    const offset = args[args.length - 2];
                    const replacement = replacer(...args);

                    replacedLengthDiff += replacement.length - matched.length;
                    lastReplaceEnds = offset + matched.length + replacedLengthDiff;
                    return replacement;
                });

                const newBufferStart = Math.max(bufferStr.length - bufferSize, lastReplaceEnds);
                controller.enqueue(encoder.encode(bufferStr.slice(0, newBufferStart)));
                bufferStr = bufferStr.slice(newBufferStart);
            });
        },
        cancel: () => {
            reader.cancel();
        }
    });

    return new Response(stream, {
        headers: response.headers
    });
}
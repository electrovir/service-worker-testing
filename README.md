# Service Worker Testing

## How to use

After choosing one of the server options below and running it, simply navigate to http://localhost:4242, or any port of your choosing (replace 4242 with desired port number).

### Slowed down Python server

This server is slowed down to simluate server lag from the network or from loading/processing large files server-side.

```sh
python slow-server.py 4242
```

### Simple Python server (not slowed)

Simply [starting a simple Python server](http://2ality.com/2014/06/simple-http-server.html) from this directory will be good enough (for now).

```sh
python -m SimpleHTTPServer 4242
```

In order to see effects of the caching with this server, network throttling in your browser's dev tools must be used.

## Progress

-   [x] Get high level understanding of service workers ([01-image-request-swap](./01-image-request-swap))
-   [x] Figure out how to load chunked text ([02-streaming-text](./02-streaming-text))
    -   [x] Make sure that chunked text executes scripts
-   [x] Get a static offline cached paged to load while the actual app's chunks are being loaded
-   [x] See if long script can be loaded without blocking the incoming HTML chunks
-   [x] Test out async scripts with streaming

## Sources

-   [MDN using service workers guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
-   [MDN service worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
-   [Google Dev Streams](https://developers.google.com/web/updates/2016/06/sw-readablestreams)
-   [2016 - the year of web streams](https://jakearchibald.com/2016/streams-ftw/)
-   [Chunked fetching example](http://jsbin.com/vuqasa/edit?js,console)
-   [Cloud -> Butt example from year of web streams](https://github.com/jakearchibald/isserviceworkerready/tree/master/src/demos/transform-stream)

## Results

Streaming can be hijacked to combine a cached HTML loading page with server responses. The response can be loaded in chunks with streams to display HTML as it loads. (HTML already does this normally and it is not prevented when using streams.)

Loading `.js` files in the HTML (with `<script>` tags) is blocking. Using `async` (or `defer`) in the `<script>` tag allows it to be non-blocking and works as expected with streams. Putting `<script>` tags at the end of the HTML also prevents it from blocking HTML rendering (since it is loaded after the HTML is received). However, this doesn't allow the script to be loaded _while_ the HTML is being loaded and displayed.

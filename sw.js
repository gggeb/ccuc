const CACHE_NAME = "CUCC::V2"
const files = [
    "/ccuc/",
    "/ccuc/index.html",
    "/ccuc/main.js",
    "/ccuc/style.css"
];

self.addEventListener("install", function(event) {
    console.log("installing service worker");
    event.waitUntil(caches.open(CACHE_NAME).then(function(cache) {
        return cache.addAll(files);
    }).then(function() {
        console.log("installation complete");
    }));
});

self.addEventListener("fetch", function(event) {
    event.respondWith(caches.match(event.request).then(function(r) {
        console.log("fetching: ", event.request.url);
        return r || fetch(event.request).then(function(response) {
            return caches.open(CACHE_NAME).then(function(cache) {
                console.log("caching new item: ", e.request.url);
                cache.put(e.request, response.clone());
                return response;
            });
        });
    }));
});

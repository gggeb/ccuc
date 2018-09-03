const CACHE_NAME = "CUCC_CACHE";
let urls = [
    "/ccuc/",
    "/ccuc/offline.html",
    "/ccuc/main.js",
    "/ccuc/style.css"
];

self.addEventListener("install", function(event) {
    event.waitUntil(caches.open(CACHE_NAME).then(function(cache) {
        return cache.addAll(urls);
    }));
});

self.addEventListener("fetch", function(event) {
    event.respondWith(caches.match(event.request).then(function(response) {
        if (response) {
            return response;
        }

        return fetch(event.request).catch(function(error) {
            return cache.open(CACHE_NAME).then(function(cache) {
                return cache.match("offline.html");
            });
        });
    }));
});

self.addEventListener("activate", function(event) {
    var whitelist = [];
    event.waitUntil(caches.keys().then(function(cache_names) {
        return Promise.all(
            cache_names.map(function(cache_name) {
                if (whitelist.indexOf(cache_name)) {
                    return caches.delete(cache_name);
                }
            })
        );
    }));
});

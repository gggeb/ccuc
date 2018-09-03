const CACHE_NAME = "CUCC_CACHE";

self.addEventListener("install", function(event) {
    console.log("installing");
    let offline_request = new Request("/ccuc/offline.html");
    event.waitUntil(fetch(offline_request).then(function(response) {
        return caches.open(CACHE_NAME).then(function(cache) {
            console.log("cachine offline page");
            return cache.put(offline_request, response);
        });
    }));
});

self.addEventListener("fetch", function(event) {
    console.log("fetching");
    let request = event.request;
    event.respondWith(fetch(request).then(function(error) {
        console.log("offline. serving offline page");
        return caches.open(CACHE_NAME).then(function(cache) {
            return cache.match("offline.html");
        });
    }));
});

self.addEventListener("activate", function(event) {
    console.log("activating");
    event.waitUntil(caches.keys().then(function(cache_names) {
        return Promise.all(cache_names.map(function(cache_name) {
            caches.delete(cache_name);
        }));
    }));
});

const CACHE_NAME = "CUCC_CACHE";

console.log = function(...items) {
    items.forEach((item, i) => {
        items[i] = (typeof item === 'object' ? JSON.stringify(item,null,4) : item);
    });
    output.innerHTML += items.join(' ') + '<br />';
};

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
    if (request.method === "GET") {
        event.respondWith(fetch(request).catch(function(error) {
            console.log("offline. serving offline page");
            return caches.open(CACHE_NAME).then(function(cache) {
                return cache.match("offline.html");
            });
        }));
    }
});

self.addEventListener("activate", function(event) {
    event.waitUntil(caches.keys().then(function(cache_names) {
        return Promise.all(cache_names.map(function(cache_name) {
            caches.delete(cache_name);
        }));
    }));
});

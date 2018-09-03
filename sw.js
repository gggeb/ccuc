const CACHE_NAME = "CUCC::V1"
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
    }));
});

self.addEventListener("fetch", function(event) {
    console.log("fetching");
});

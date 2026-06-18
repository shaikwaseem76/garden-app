// This file is required for the "Install" prompt to appear
self.addEventListener('install', (e) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (e) => {
  // Just passes requests through, but satisfies PWA requirements
  e.respondWith(fetch(e.request));
});
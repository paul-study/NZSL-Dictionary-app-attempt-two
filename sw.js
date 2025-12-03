// Service Worker for NZSL Dictionary PWA
// Enables installation on mobile and desktop

const CACHE_NAME = 'nzsl-dictionary-v1';

// Install event - minimal setup for PWA installation
self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
    event.waitUntil(clients.claim());
});

// Fetch event - pass through to network (no offline caching)
self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});

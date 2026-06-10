// Service Worker
const CACHE_NAME = 'push-notification-app-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/sw-register.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    '/badge-72.png'
];

// Install Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker installed');
                return cache.addAll(urlsToCache).catch(err => {
                    console.warn('Some assets failed to cache:', err);
                });
            })
    );
    self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event - Network first, then cache
self.addEventListener('fetch', event => {
    const { request } = event;

    // Skip cross-origin requests
    if (!request.url.startsWith(self.location.origin)) {
        return;
    }

    // For navigation requests, use network first
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Cache successful responses
                    if (response && response.status === 200 && response.type !== 'error') {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache
                    return caches.match(request)
                        .then(response => response || caches.match('/index.html'));
                })
        );
        return;
    }

    // For other requests, use cache first
    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(request)
                    .then(response => {
                        // Cache successful responses
                        if (response && response.status === 200 && response.type !== 'error') {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(request, responseToCache);
                            });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Return a generic offline response
                        return new Response('Offline - content not available', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Handle push notifications
self.addEventListener('push', event => {
    let notificationData = {
        title: 'New Notification',
        options: {
            body: 'You have a new message',
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            tag: 'notification',
            requireInteraction: false
        }
    };

    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                title: data.title || notificationData.title,
                options: {
                    body: data.body || notificationData.options.body,
                    icon: data.icon || notificationData.options.icon,
                    badge: data.badge || notificationData.options.badge,
                    tag: data.tag || notificationData.options.tag,
                    requireInteraction: data.requireInteraction || false,
                    data: data.data || {}
                }
            };
        } catch (error) {
            console.error('Error parsing push data:', error);
            notificationData.options.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData.options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    const action = event.action;
    const data = event.notification.data || {};

    // Handle specific actions
    if (action === 'close') {
        return;
    }

    // Default action - open app
    const urlToOpen = data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // Check if app is already open
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open app if not already open
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Handle notification close
self.addEventListener('notificationclose', event => {
    console.log('Notification closed:', event.notification.tag);
});

// Message handler for client-service worker communication
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
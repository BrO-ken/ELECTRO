/**
 * ElectroCalc Fès - Service Worker
 * Version: 1.0.0
 * Purpose: Enable offline functionality and caching for PWA
 */

const CACHE_NAME = 'electrocalc-fes-v1.0.0';
const STATIC_CACHE_NAME = 'electrocalc-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'electrocalc-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/assets/js/script.js',
    '/manifest.json',
    // External CDN resources (cached dynamically)
    'https://cdn.tailwindcss.com/3.4.0',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Failed to cache static files', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached files or fetch from network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle navigation requests
    if (request.mode === 'navigate') {
        event.respondWith(
            caches.match('/index.html')
                .then((response) => {
                    return response || fetch(request);
                })
                .catch(() => {
                    return caches.match('/index.html');
                })
        );
        return;
    }
    
    // Handle static assets
    if (STATIC_FILES.includes(url.pathname) || url.pathname.startsWith('/assets/')) {
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    return response || fetch(request)
                        .then((fetchResponse) => {
                            return caches.open(STATIC_CACHE_NAME)
                                .then((cache) => {
                                    cache.put(request, fetchResponse.clone());
                                    return fetchResponse;
                                });
                        });
                })
        );
        return;
    }
    
    // Handle external resources (CDN)
    if (url.hostname !== location.hostname) {
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    return response || fetch(request)
                        .then((fetchResponse) => {
                            return caches.open(DYNAMIC_CACHE_NAME)
                                .then((cache) => {
                                    // Cache successful responses
                                    if (fetchResponse.status === 200) {
                                        cache.put(request, fetchResponse.clone());
                                    }
                                    return fetchResponse;
                                });
                        })
                        .catch(() => {
                            // Return offline fallback if available
                            if (request.destination === 'image') {
                                return new Response(
                                    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af">Image hors ligne</text></svg>',
                                    { headers: { 'Content-Type': 'image/svg+xml' } }
                                );
                            }
                            return new Response('Contenu hors ligne indisponible', {
                                status: 408,
                                statusText: 'Offline'
                            });
                        });
                })
        );
        return;
    }
    
    // Default: fetch from network
    event.respondWith(fetch(request));
});

// Background sync for saving calculations when back online
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync-calculations') {
        event.waitUntil(syncCalculations());
    }
});

// Push notifications
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body || 'Nouvelle notification d\'ElectroCalc',
            icon: '/assets/images/icon-192.png',
            badge: '/assets/images/badge-72.png',
            vibrate: [100, 50, 100],
            data: data.data || {},
            actions: [
                {
                    action: 'open',
                    title: 'Ouvrir',
                    icon: '/assets/images/icon-open.png'
                },
                {
                    action: 'close',
                    title: 'Fermer',
                    icon: '/assets/images/icon-close.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'ElectroCalc', options)
        );
    }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Helper function to sync calculations
async function syncCalculations() {
    try {
        // Get pending calculations from IndexedDB or localStorage
        const pendingCalculations = JSON.parse(
            localStorage.getItem('pendingCalculations') || '[]'
        );
        
        if (pendingCalculations.length > 0) {
            // Send to server when back online
            for (const calculation of pendingCalculations) {
                try {
                    await fetch('/api/calculations', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(calculation)
                    });
                } catch (error) {
                    console.error('Failed to sync calculation:', error);
                }
            }
            
            // Clear pending calculations
            localStorage.removeItem('pendingCalculations');
            console.log('Service Worker: Calculations synced successfully');
        }
    } catch (error) {
        console.error('Service Worker: Sync failed', error);
    }
}

// Message handling from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

// Unhandled rejection handling
self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker unhandled rejection:', event.reason);
    event.preventDefault();
});


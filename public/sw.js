const CACHE_NAME = 'dealsletter-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/analysis',
  '/offline.html'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              // Cache successful responses
              if (event.request.method === 'GET') {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        });
      })
      .catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for analysis
self.addEventListener('sync', event => {
  if (event.tag === 'sync-analysis') {
    event.waitUntil(syncAnalysis());
  }
});

async function syncAnalysis() {
  // Sync any pending analyses when back online
  const pendingAnalyses = await getPendingAnalyses();
  
  for (const analysis of pendingAnalyses) {
    try {
      await fetch('/api/analysis/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysis)
      });
      
      // Remove from pending after successful sync
      await removePendingAnalysis(analysis.id);
    } catch (error) {
      console.error('Failed to sync analysis:', error);
    }
  }
}

// Helper functions for IndexedDB
async function getPendingAnalyses() {
  // Implementation for getting pending analyses from IndexedDB
  return [];
}

async function removePendingAnalysis(id) {
  // Implementation for removing synced analysis from IndexedDB
}
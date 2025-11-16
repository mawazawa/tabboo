const CACHE_NAME = 'pdf-form-filler-v1';
const RUNTIME_CACHE = 'runtime-cache';
const PDF_CACHE = 'pdf-cache';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/fl320.pdf',
];

// Install event - precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE && name !== PDF_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - cache strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests in the service worker cache logic.
  // Non-GET requests (POST, PATCH, DELETE, etc.) bypass the cache and go directly to the network.
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Cache PDFs with Cache First strategy
  if (url.pathname.endsWith('.pdf')) {
    event.respondWith(
      caches.open(PDF_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).then((response) => {
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // Network First for API calls (Supabase)
  if (url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if offline
          return caches.match(request);
        })
    );
    return;
  }

  // Cache First for app assets
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// Sync event - handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-form-data') {
    event.waitUntil(syncFormData());
  }
});

// Message event - communicate with app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_PDF') {
    event.waitUntil(
      caches.open(PDF_CACHE).then((cache) => {
        return cache.add(event.data.url);
      })
    );
  }
});

// Sync queued form data
async function syncFormData() {
  try {
    // Get pending updates from IndexedDB
    const db = await openDB();
    const tx = db.transaction('pendingUpdates', 'readonly');
    const store = tx.objectStore('pendingUpdates');
    const pendingUpdates = await store.getAll();

    // Send each update to the server
    for (const update of pendingUpdates) {
      try {
        const response = await fetch(update.url, {
          method: 'PATCH',
          headers: update.headers,
          body: JSON.stringify(update.data),
        });

        if (response.ok) {
          // Remove from queue
          const deleteTx = db.transaction('pendingUpdates', 'readwrite');
          const deleteStore = deleteTx.objectStore('pendingUpdates');
          await deleteStore.delete(update.id);
        }
      } catch (error) {
        console.error('Failed to sync update:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FormDataSync', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingUpdates')) {
        db.createObjectStore('pendingUpdates', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

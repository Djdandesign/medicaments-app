const CACHE_NAME = 'medicaments-app-v1';
const urlsToCache = [
  'index.html',
  'manifest.json'
];

// Installation du service worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installation');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du service worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activation');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Suppression ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Gestion des requêtes
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', event => {
  console.log('Notification cliquée');
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Si l'application est déjà ouverte, la focus
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon, ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow('index.html');
      }
    })
  );
});

// Gestion des messages du client
self.addEventListener('message', event => {
  console.log('Service Worker: Message reçu', event.data);
  
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }
});

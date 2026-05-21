self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: 'EstateFlow Alert', body: event.data.text() };
  }

  const title = data.title || 'EstateFlow Alert';
  const options = {
    body: data.body || 'You have a new update.',
    icon: '/next.svg',
    badge: '/next.svg',
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const path = event.notification.data && event.notification.data.path ? event.notification.data.path : '/leads';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(path);
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(path);
      }

      return undefined;
    }),
  );
});

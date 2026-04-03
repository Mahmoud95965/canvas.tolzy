importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// `firebaseConfig` is passed directly as a query parameter when the service worker is registered
const params = new URL(location).searchParams;
const configString = params.get('firebaseConfig');

if (configString) {
  try {
    const firebaseConfig = JSON.parse(configString);
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);

      const notificationTitle = payload.notification?.title || 'Tolzy Flow Notification';
      const notificationOptions = {
        body: payload.notification?.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: payload.data
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } catch (err) {
    console.error('Failed to initialize Firebase in service worker', err);
  }
}

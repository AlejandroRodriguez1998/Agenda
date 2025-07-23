importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAoLySnWCBawHoNpJasXTaqIY6DMbgDGrU",
  projectId: "agenda-38c8b",
  messagingSenderId: "156356421133",
  appId: "1:156356421133:web:b1cef1501520cb847e5744",
});

const messaging = firebase.messaging();

/*messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icon-192x192.png',
  });
});*/

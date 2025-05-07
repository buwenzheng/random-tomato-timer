self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TIMER_TICK') {
    // 处理计时器消息
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'TIMER_UPDATE',
          timeLeft: event.data.timeLeft,
          isBreak: event.data.isBreak
        });
      });
    });
  }
}); 
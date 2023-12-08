self.addEventListener('push', function (e) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        //notifications aren't supported or permission not granted!
        return;
    }

    if (e.data) {
        const msg = e.data.json();
        console.log(msg)
        e.waitUntil(self.registration.showNotification(msg.title, {
            body: msg.body,
            icon: msg.icon,
            actions: msg.actions
        }));
    }
});

const expectedCaches = ['static-v2'];

self.addEventListener("install", event => {
    console.log('V2 installing…');

    event.waitUntil(
        caches.open('static-v2').then(cache => cache.add('/horse.jpg'))
    );
});

self.addEventListener('activate', event => {
    // delete any caches that aren't in expectedCaches
    // which will get rid of static-v1
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (!expectedCaches.includes(key)) {
                    return caches.delete(key);
                }
            })
        )).then(() => {
            console.log('V2 now ready to handle fetches!');
        })
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    // serve the cat from the cache if the request is
    // same-origin and the path is '/dog.jpg'
    if (url.origin == location.origin && url.pathname == '/dog.jpg') {
        console.log('responding with cat...')
        event.respondWith(caches.match('/horse.jpg'));
    }
});

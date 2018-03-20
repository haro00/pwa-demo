let VERSION = 'v1';

self.addEventListener('install', event => {
    // console.log('install', event);
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
    // console.log('activate', event);
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            // 清理旧版本
            caches.keys().then(cacheList => Promise.all(
                cacheList.map(cacheName => {
                    if (cacheName !== VERSION) {
                        caches.delete(cacheName)
                    }
                })
            ))
        ])
    )
});

self.addEventListener('fetch', event => {
    // console.log('fetch', event);
    let {request} = event;
    let cacheKey = null;
    if (request.method === 'GET') {
        cacheKey = request.clone();
    }
    // 请求优先
    /*event.respondWith(async function () {
        // cacheAPI无法直接缓存post请求, 所以使用路径跟参数组成的json字符串作为key
        // 请按需配置缓存的post请求
        if (request.method === 'GET') {
            let reqParams = await request.clone().json();
            reqParams.url = request.url;
            cacheKey = JSON.stringify(reqParams);
        }
        return fetch(request).then(res => {
            if (!res) {
                return caches.match(cacheKey);
            }
            if (res.status !== 200) {
                return res;
            }
            let cacheRes = res.clone();
            caches.open(VERSION).then(cache => cache.put(cacheKey, cacheRes));
            return res;
        }).catch(err => caches.match(cacheKey));
    }());*/
    
    // 缓存优先
    event.respondWith(async function () {
        let cacheReq = request.clone();
        // cacheAPI无法直接缓存post请求, 所以使用路径跟参数组成的json字符串作为key
        // 请按需配置缓存的post请求
        if (request.method !== 'GET') {
            let reqParams = await request.clone().json();
            reqParams.url = request.url;
            cacheKey = JSON.stringify(reqParams);
        }
        return caches.open(VERSION)
            .then(cache => cache.match(cacheKey)
                .then(res => res || fetch(cacheReq)))
            .catch(err => fetch(cacheReq))
    }());
    // 更新缓存,下次刷新获取新的内容
    event.waitUntil(async function () {
        // cacheAPI无法直接缓存post请求, 所以使用路径跟参数组成的json字符串作为key
        // 请按需配置缓存的post请求
        if (request.method !== 'GET') {
            let reqParams = await request.clone().json();
            reqParams.url = request.url;
            cacheKey = JSON.stringify(reqParams);
        }
        caches.open(VERSION)
            .then(cache => fetch(request)
                .then(res => cache.put(cacheKey, res)))
            .catch(err => {
                console.log(err);
            });
    }());
});

self.addEventListener('push', (event) => {
    const title = 'Get Started With Workbox';
    const options = {
        body: event.data.text()
    };
    event.waitUntil(self.registration.showNotification(title, options));
});
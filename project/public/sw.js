// 缓存优先 + 后台更新:打开瞬间可用(不等待网络),联网时后台刷新缓存,
// 下次打开即为最新版。适合网络不稳定/跨境访问缓慢的部署环境。
const CACHE = 'todo-v2'
const SCOPE = new URL('./', self.registration.scope).pathname
const CORE = [
  SCOPE,
  SCOPE + 'index.html',
  SCOPE + 'manifest.webmanifest',
  SCOPE + 'mascot.png',
  SCOPE + 'icons/icon-192.png',
  SCOPE + 'icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // 逐个缓存,单个失败(如某资源暂不可达)不阻塞整个安装
      .then((cache) => Promise.allSettled(CORE.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      const fetching = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((cache) => cache.put(req, copy))
          }
          return res
        })
        .catch(() => null)
      // 命中缓存立即返回;未命中走网络;都失败兜底首页
      return hit || fetching.then((res) => res || caches.match(SCOPE + 'index.html'))
    }),
  )
})

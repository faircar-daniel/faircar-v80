// FairCar Service Worker v1
const CACHE = "faircar-v1";
const PRECACHE = [
  "/wizard.html",
  "/index.html",
  "/assets/app.js",
  "/assets/styles.css",
  "/assets/theme.js",
  "/assets/brandModels_es.js",
  "/assets/carDatabase-v3.js",
  "/assets/carDatabase-patch.js",
  "/assets/dbPatchRuntime.js",
  "/assets/faircar_safety_db.js",
  "/assets/modelImages.js",
  "/assets/municipios_ine_2026.js",
  "/assets/brand/faircar_logo-night.png",
  "/assets/brand/faircar_logo-day.png",
  "/assets/favicon/icon-192.png",
  "/assets/favicon/icon-512.png"
];

// Instalar y cachear archivos estáticos
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

// Activar y limpiar cachés viejas
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first para estáticos, network-first para la API
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // API de Netlify Functions — siempre red (no cachear)
  if (url.pathname.startsWith("/.netlify/functions/")) {
    return; // deja pasar sin interceptar
  }

  // Resto — cache first, fallback a red
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200 && e.request.method === "GET") {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});

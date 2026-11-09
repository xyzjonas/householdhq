import { version } from "$app/env";
import { assets, immutable } from "$app/manifest";
import { self as sw } from "$app/service-worker";

const CACHE = `cache-${version}`;
const ASSETS = new Set<string>([...immutable, ...assets].map((a) => a.path));

sw.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([...ASSETS])),
  );
});

// A new version waits until the user accepts the update prompt (see
// `pwa-update.svelte.ts`), so open pages never run against swapped-out assets.
sw.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") void sw.skipWaiting();
});

sw.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => sw.clients.claim()),
  );
});

// Only static assets are served from the cache. Pages and API calls always hit
// the network, since they depend on the session and live data.
sw.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const { pathname } = new URL(request.url);
  if (!ASSETS.has(pathname)) return;

  event.respondWith(
    caches.match(request).then((cached) => cached ?? fetch(request)),
  );
});

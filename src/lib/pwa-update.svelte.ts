/** Message the page sends to a waiting service worker to activate it. */
export const SKIP_WAITING = "SKIP_WAITING";

/** How often an open app asks the server whether a newer version exists. */
const CHECK_INTERVAL_MS = 60 * 60 * 1000;

let waiting = $state<ServiceWorker | null>(null);

export const pwaUpdate = {
  /** True once a new version is installed and waiting to take over. */
  get ready() {
    return waiting !== null;
  },
  /** Activates the waiting version; the page reloads once it takes control. */
  apply() {
    waiting?.postMessage({ type: SKIP_WAITING });
  },
};

function track(registration: ServiceWorkerRegistration) {
  // No controller means this is the first install, not an update.
  const isUpdate = () => navigator.serviceWorker.controller !== null;

  if (registration.waiting && isUpdate()) waiting = registration.waiting;

  registration.addEventListener("updatefound", () => {
    const installing = registration.installing;
    installing?.addEventListener("statechange", () => {
      if (installing.state === "installed" && isUpdate()) waiting = installing;
    });
  });
}

/** Starts watching for new versions. Call once, in the browser. */
export function watchForUpdates() {
  if (!("serviceWorker" in navigator)) return;

  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    location.reload();
  });

  void navigator.serviceWorker.ready.then((registration) => {
    track(registration);
    const check = () => void registration.update().catch(() => {});
    setInterval(check, CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") check();
    });
  });
}

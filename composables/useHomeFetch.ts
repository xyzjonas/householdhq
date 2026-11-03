/**
 * Data sources of the home page widgets. Each of them is fetched (and
 * server-side rendered) on its own under the key `home:<widget>`.
 */
export const HOME_WIDGETS = [
  "period",
  "balance",
  "summary",
  "transactions",
  "upcoming",
  "important",
  "portfolio",
  "projects",
] as const;

export type HomeWidget = (typeof HOME_WIDGETS)[number];

type HomeQuery = Record<string, string | number | undefined>;

/**
 * Fetches a `/api/home/*` endpoint. The payload is rendered on the server and
 * hydrated on the client, so the first paint doesn't wait for any request.
 */
export const useHomeFetch = <T>(
  widget: HomeWidget,
  query?: MaybeRefOrGetter<HomeQuery>,
) => {
  // captured here as the cookie composable needs the Nuxt context
  const token = useCookie("token");

  return useFetch<T>(`/api/home/${widget}`, {
    key: `home:${widget}`,
    query,
    dedupe: "cancel",
    onResponse({ response }) {
      const renewed = response.headers.get("x-token-renewal");
      if (renewed) {
        token.value = renewed;
      }
    },
  });
};

/** Re-fetches every home widget, e.g. after a transaction was changed. */
export const refreshHome = () =>
  refreshNuxtData(HOME_WIDGETS.map((widget) => `home:${widget}`));

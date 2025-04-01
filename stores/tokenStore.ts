import { acceptHMRUpdate, defineStore } from "pinia";
import { useNotifications } from "@/composables/useNotifications";

interface ErrorResponse {
  url: string
  statusMessage: string
  message: string
  statusCode: number
  stack: string
}



export class ServerError extends Error {}


export const useTokenStore = defineStore("token", () => {
  const n = useNotifications();
  const { t } = useI18n();
  
  const token = useCookie("token", {
    // maxAge: new Date(2147483647 * 1000).getTime() / 1000,
    expires: new Date(2147483647 * 1000),
  });
  const loggedUser  = useCookie("logged-user", undefined);

  const loginLoading = ref(false);
  const loginError = ref<string>();

  const login = async (username: string, password: string) => {
    const url = "/api/login";
    loginLoading.value = true;

    try {
      const result = await post(url, {
        username: username,
        password: password,
      });
      token.value = result.token;
      loggedUser.value = username;
    } finally {
      loginLoading.value = false;
    }
  };

  const logout = async () => {
    token.value = undefined;
    loggedUser.value = undefined;
    await navigateTo("/login");
  };

  const postprocess = async (response: Response): Promise<Response> => {
    if (response.url.endsWith("/api/login") && response.status === 401) {
      n.addNotification({
        text: t("server_error_wrong_login"),
        level: "error",
      });
      throw new Error("Login failed, invalid username or password");
    }

    if (response.status === 401) {
      console.info("Unauthorized, navigating to /login");
      navigateTo("/login");
      throw new Error();
    }

    if (response.status >= 500) {
      n.addNotification({
        text: t("server_error_500"),
        level: "error",
      });
      throw new Error("Internal server Error");
    }

    if (response.status >= 400) {
      const res = await response.json() as ErrorResponse
      n.addNotification({
        text: res.message,
        level: "error",
      });
      throw new Error("Bad Request");
    }

    if (response.headers.has("x-token-renewal")) {
      console.info("New token appended, updating...");
      token.value = response.headers.get("x-token-renewal");
    }

    return response;
  };

  const post = async (
    url: string,
    requestData?: object,
    method: string = "POST"
  ) => {
    const result = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData ?? {}),
    });

    return await (await postprocess(result)).json();
  };

  const put = async (url: string, data: object) => {
    return await post(url, data, "PUT");
  };

  const patch = async (url: string, data: object) => {
    return await post(url, data, "PATCH");
  };

  const del = async (url: string, data?: object) => {
    return await post(url, data, "DELETE");
  };

  const get = async (url: string) => {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token.value,
      },
    });
    return await (await postprocess(response)).json();
  };

  return { token, loggedUser, loginLoading, loginError, login, logout, get, post, put, patch, del };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTokenStore, import.meta.hot));
}

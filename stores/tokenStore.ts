import { acceptHMRUpdate, defineStore } from "pinia";
import { useNotifications } from "@/composables/useNotifications"

export class ServerError extends Error {
    
}

export const useTokenStore = defineStore("token", () => {

    const n = useNotifications()
    const { t } = useI18n();

    const token = useCookie(
        'token',
        {
            // maxAge: new Date(2147483647 * 1000).getTime() / 1000,
            expires: new Date(2147483647 * 1000),
        })

    const loginLoading = ref(false);
    const loginError = ref<string>();
    // const loggedUser  = ref<string>();

    const login = async (username: string, password: string) => {
        const url = "/api/login";
        loginLoading.value = true;

        try {
            const result = await post(url, { username: username, password: password });
            token.value = result.token;
        } finally {
            loginLoading.value = false;
        }
    }

    const postprocess = async (response: Response) => {
        if (response.status === 401) {
            console.info("Unauthorized, navigating to /login")
            navigateTo("/login")
        }
        if (response.status >= 400) {
            n.addNotification({
                text: t('server_error'),
                level: 'error'
            })
            throw new ServerError(`Error response ${response.status}`);
        }
        if (response.headers.has("x-token-renewal")) {
            console.info("New token appended, updating...")
            token.value = response.headers.get("x-token-renewal");
        }
        return response;
    }

    const post = async (url: string, requestData?: object, method: string = "POST") => {
        const result = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData ?? {})
        })

        return await (await postprocess(result)).json();
    }

    const put = async (url: string, data: object) => {
        return await post(url, data, "PUT");
    }

    const patch = async (url: string, data: object) => {
        return await post(url, data, "PATCH");
    }

    const del = async (url: string, data?: object) => {
        return await post(url, data, "DELETE");
    }

    const get = async(url: string) => {
        console.log(`FETCHING ${url}`)
        const response = await fetch(
            url,
            {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + token.value
                }
            }
        );
        return await (await postprocess(response)).json();
    };
    
    
    return { token, loginLoading, loginError, login, get, post, put, patch, del }
})


if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useTokenStore, import.meta.hot))
}

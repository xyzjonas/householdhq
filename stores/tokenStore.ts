import { acceptHMRUpdate, defineStore } from "pinia";

export class ServerError extends Error {
    
}

export const useTokenStore = defineStore("token", () => {


    const token = useCookie('token')

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
            throw new ServerError(`Error response ${response.status}`);
        }
        if (response.headers.has("x-token-renewal")) {
            console.info("New token appended, updating...")
            token.value = response.headers.get("x-token-renewal");
        }
        return response;
    }

    const post = async (url: string, requestData?: object, method: string = "POST") => {
        console.debug(`POST '${url}'.`)
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

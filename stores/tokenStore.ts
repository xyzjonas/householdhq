import { acceptHMRUpdate, defineStore } from "pinia";

export const useTokenStore = defineStore("token", () => {


    const token = useCookie('token')

    // const token = ref<string | undefined | null>(tokenCookie.value);
    const loginLoading = ref(false);
    const loginError = ref<string>();
    const loggedUser  = ref<string>();

    const login = async (username: string, password: string) => {
        const url = "/api/login";
        console.info(`querying '${url}'.`)
        loginLoading.value = true;

        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password,
            })
        })

        if (result.status >= 400) {
            loginError.value = "Login failed";
            loginLoading.value = false;
            throw new Error("Login failed!");
        }

        try {
            const tokenResponse = await result.json();
            token.value = tokenResponse.token;
            loginError.value = "";
        } catch (e) {
            console.error("malformed token response");
            throw e;
        } finally {
            loginLoading.value = false;
        }
    }

    return { token, loginLoading, loginError, login }
})


if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useTokenStore, import.meta.hot))
}

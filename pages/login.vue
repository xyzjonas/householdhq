<template>
    <div class="form-wrapper card row-to-column">
        <section class="form-wrapper-hero">
            <div>
                <h1 class="title">{{ $t('sign_in') }}</h1>
                <h4>New and better!</h4>
            </div>
        </section>
        <form class="form-wrapper-form" @submit.prevent="useLogin">
            <div class="input-group">
                <label for="uname">Username</label>
                <input ref="usernameInput" id="uname" v-model="username" type="text" name="username" required>
            </div>

            <div class="input-group">
                <label for="psw">Password</label>
                <input ref="passwordInput" id="psw" v-model="password" type="password" name="password" required>
            </div>

            <ui-button
                :loading="loginLoading"
                icon="fa-solid fa-unlock-keyhole mr"
            >{{ $t('sign_in') }}</ui-button>
            <div v-if="loginError" class="mt">
                <small class="error" style="font-weight: 500;">{{ $t('login_failed') }}</small>
            </div>
        </form>
    </div>
</template>
<script setup lang="ts">
import { useTokenStore } from '@/stores/tokenStore';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';


definePageMeta({
  layout: "single",
});

const tokenStore = useTokenStore();
const { loginLoading, loginError, token } = storeToRefs(tokenStore);

const username = ref<string>("")
const usernameInput = ref<HTMLInputElement | null>(null);
const password = ref<string>("")
const passwordInput = ref<HTMLInputElement | null>(null);
const useLogin = () => {
  tokenStore.login(username.value, password.value).then(() => navigateTo('/'));
}


onMounted(() => {
    [usernameInput, passwordInput].forEach((_ref) => {
        _ref.value?.addEventListener("focus", () => {
            document.querySelector(`[for='${_ref.value?.id}']`)?.classList?.add("active");
        });

        _ref.value?.addEventListener("focusout", () => {
            if(!_ref.value?.value) {
                document.querySelector(`[for='${_ref.value?.id}']`)?.classList?.remove("active");
            }
        });
    })
})


</script>
<style lang="scss" scoped>
@import "@/assets/css/base";
@import "@/assets/css/custom_components";

.input-group {
    @include input-group(16px, 16px, 10px);
}

.form-wrapper {
    margin: 16px;
    padding: 15vh 0;
    border: 1px solid var(--color-primary-light-1);

    text-align: center;

    &-hero {
        padding: 64px;
        flex: 1;
        display: grid;
        justify-content: center;
        .title {
            font-size: 48px;
            margin-bottom: 32px;
        }
    }

    &-form {
        // padding: 32px;
        flex: 1;

        display: grid;
        grid-template-rows: 1fr;
        gap: 32px;
        padding: 32px;

        button {
            padding: 16px 0;
            width: 100%;
        }
    }
}
</style>
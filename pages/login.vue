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
    $padd: 1px;
}

.form-wrapper {
    // text-align: center;
    // padding: 32px;
    width: 100%;
    padding: 0;
    border: 1px solid var(--color-primary-light-1);
    // border-radius: 16px;

    // display: flex;
    // gap: 12px;

    input {
        width: 100%;
    }

    text-align: center;

    &-hero {
        // background-color: var(--color-font-light);
        // color: var(--color-font-dark);
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
        justify-self: center;
        padding: 32px;
        flex: 1;

        display: flex;
        flex-direction: column;
        gap: 32px;
        justify-content: space-between;

        button {
            width: 100%;
            padding: 16px;
        }

    }
    // height: 100%;
    // justify-content: space-between;

    // section {
    //     margin-bottom: 32px;
    // }
}
form {
    // display: flex;
    // flex-direction: column;
    // gap: 32px;
    // justify-content: space-between;
    // text-align: center;
    // max-width: 480px;
    // margin-left: auto;
    // margin-right: auto;

    // .input-group {
    //     display: flex;
    //     flex-direction: column;
    // }

    // label {
    //     text-align: left;
    //     font-weight: 100;
    //     margin-bottom: 4px;
    // }

    // input {
    //     border-bottom: 1px solid var(--color-primary-light-2);
    //     border-radius: 0px;
    //     padding: 8px 16px;

    //     font-size: 16px;

    //     &:focus {
    //         border: 1px solid var(--color-primary-light-1);
    //     }
    // }


}
// .button {
//     padding: 8px 16px;
//     color: white;
//     font-weight: 600;
//     // background-color:  #e8ae01;
//     border-radius: 6px;

//     &:hover {
//       background-color:  rgb(212, 164, 19);
//     }
// }
</style>
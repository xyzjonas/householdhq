<template>
  <form class="card w-sm sm:w-md" @submit.prevent="useLogin">
    <div class="p-5 flex flex-col items-center">
      <img src="/logo.svg" alt="logo" width="128" class="mb-5" />
      <h1 class="title mb-10 upp">Household HQ</h1>
      <client-only>
        <div class="form-wrapper-form-inputs mb-10">
          <ui-input
            label="Username"
            v-model="username"
            type="text"
            :required="true"
          />
          <ui-input
            label="Password"
            v-model="password"
            type="password"
            :required="true"
            autocomplete="password"
          />
          <span class="flex items-center mt-3">
            <input type="checkbox" checked disabled />
            <span class="ml-2">{{ $t("sign_in_keep_logged_in") }}</span>
          </span>
        </div>
        <ui-button
          :loading="loginLoading"
          width="100%"
          height="3rem"
          icon="i-ic-baseline-key"
          type="submit"
          color="primary"
          >{{ $t("sign_in") }}</ui-button
        >
      </client-only>
    </div>
  </form>
</template>
<script setup lang="ts">
import { useTokenStore } from "@/stores/tokenStore";
import { storeToRefs } from "pinia";
import { ref } from "vue";

definePageMeta({
  layout: "single",
});

const tokenStore = useTokenStore();
const { loginLoading } = storeToRefs(tokenStore);

const username = ref<string>("");
const usernameInput = ref<HTMLInputElement | null>(null);
const password = ref<string>("");
const passwordInput = ref<HTMLInputElement | null>(null);
const useLogin = async () => {
  await tokenStore.login(username.value, password.value);
  navigateTo({ path: "/" });
};

onMounted(() => {
  [usernameInput, passwordInput].forEach((_ref) => {
    _ref.value?.addEventListener("focus", () => {
      document
        .querySelector(`[for='${_ref.value?.id}']`)
        ?.classList?.add("active");
    });

    _ref.value?.addEventListener("focusout", () => {
      if (!_ref.value?.value) {
        document
          .querySelector(`[for='${_ref.value?.id}']`)
          ?.classList?.remove("active");
      }
    });
  });
});
</script>
<style lang="scss" scoped>
@use "@/assets/css/custom_components";

.input-group {
  @include custom_components.input-group(16px, 16px, 10px);
}

.form-wrapper-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-items: center;

  &-inputs {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>

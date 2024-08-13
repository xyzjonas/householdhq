<template>
  <form class="form-wrapper-form card" @submit.prevent="useLogin">
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
        />
        <span class="flex items-center mt-3">
          <input type="checkbox" checked disabled />
          <span class="ml-2">{{ $t("sign_in_keep_logged_in") }}</span>
        </span>
      </div>
      <ui-button
        :loading="loginLoading"
        width="100%"
        icon="i-ic-baseline-key"
        >{{ $t("sign_in") }}</ui-button
      >
    </client-only>
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
@import "@/assets/css/base";
@import "@/assets/css/custom_components";

.input-group {
  @include input-group(16px, 16px, 10px);
}

.form-wrapper-form {
  max-width: 30rem;
  margin-inline: auto;
  margin-block: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;

  &-inputs {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>

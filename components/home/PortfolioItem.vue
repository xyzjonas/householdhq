<template>
  <li
    class="flex items-center justify-between gap-3 py-2 px-2 bg-[var(--bg-200)]"
  >
    <NuxtLink
      :to="`/sources/${source.id}`"
      class="flex items-center gap-3 hover:underline"
    >
      <span class="pill" :style="{ backgroundColor: source.color ?? 'gray' }" />
      <span class="text-sm uppercase">{{ source.name }}</span>
    </NuxtLink>
    <div class="flex items-center gap-2">
      <ui-price
        :amount="source.balance"
        size="large"
        :class="{ 'opacity-60': source.stale }"
      />
      <ui-button
        v-if="source.stale"
        :loading="updating"
        icon="i-ic-baseline-auto-fix-high"
        :aria-label="$t('s_state_autocomplete')"
        @click="autofill"
      />
    </div>
  </li>
</template>

<script setup lang="ts">
import type { HomePortfolioSource } from "~/types/home";

const props = defineProps<{ source: HomePortfolioSource }>();

const { t } = useI18n();
const { addNotification } = useNotifications();

const updating = ref(false);

/** records the balance computed from the transactions as a new state */
const autofill = async () => {
  updating.value = true;
  try {
    await $fetch(`/api/sources/${props.source.id}/autocomplete`, {
      method: "POST",
    });
    await refreshHome();
    addNotification({ text: t("s_state_autocomplete"), level: "success" });
  } catch {
    addNotification({ text: t("server_error_500"), level: "error" });
  } finally {
    updating.value = false;
  }
};
</script>

<style scoped>
.pill {
  width: 0.3rem;
  height: 1.1rem;
  border-radius: 1rem;
}
</style>

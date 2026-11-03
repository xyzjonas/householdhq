<template>
  <div>
    <transition name="page">
      <section v-if="open" class="mt-1">
        <transaction-form @close="open = false" @send="send" />
      </section>
    </transition>

    <div
      class="fixed bottom-2 right-2 z-900 rounded-full transition-transform duration-100"
      :class="{ 'rotate-45': open }"
    >
      <ui-button
        :color="open ? 'secondary' : 'primary'"
        icon="i-ic-baseline-plus"
        icon-size="1.5rem"
        width="4rem"
        rounded
        outlined
        :aria-label="$t('t_add_out')"
        @click="open = !open"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CreateUpdateTransaction } from "~/types";

const open = ref(false);

const { create } = useTransactionActions();

const send = async (data: CreateUpdateTransaction) => {
  if (await create(data)) {
    open.value = false;
  }
};
</script>

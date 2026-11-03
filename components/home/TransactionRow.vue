<template>
  <article class="relative" :class="{ 'opacity-70': muted && !expanded }">
    <div
      v-if="transaction.project?.name"
      class="absolute right-[-2px] top-[-3px] z-5"
    >
      <NuxtLink :to="`/projects/${transaction.project.id}`">
        <ui-pin
          clickable
          :text="transaction.project.name"
          :color="transaction.project.color"
          size="small"
        />
      </NuxtLink>
    </div>

    <button
      type="button"
      class="transaction-card w-full text-left"
      :aria-expanded="expanded"
      @click="toggle"
    >
      <DateTile :date="date" class="min-w-20 w-20" />
      <span class="flex flex-col">
        <span>{{ transaction.description }}</span>
        <span class="mb-2 text-[0.7rem]"
          >{{ transaction.source.name }} ⤍ {{ transaction.target.name }}</span
        >
        <span class="flex items-center gap-2">
          <ui-pin
            v-if="transaction.category?.name"
            :text="transaction.category.name"
            :color="transaction.category.color"
            size="small"
          />
          <i v-if="transaction.recurring" class="i-ic-baseline-rotate-right" />
          <i
            v-if="transaction.isImportant"
            class="i-ic-round-warning text-amber"
          />
          <i
            v-if="transaction.isHidden"
            class="i-ic-baseline-disabled-visible"
          />
        </span>
      </span>
      <span class="ml-auto">
        <ui-price
          :amount="transaction.amount"
          :currency="transaction.currency"
          :color="isTransactionIncome ? 'var(--primary-100)' : undefined"
        />
        <span
          v-if="isTransactionIncome"
          class="flex items-center gap-1 justify-end"
          style="color: var(--primary-100)"
        >
          <span class="text-xs">{{ $t("income") }}</span>
          <i class="i-ic-outline-trending-up" />
        </span>
      </span>
    </button>

    <transition name="page" mode="out-in">
      <div v-if="expanded" class="mt-1">
        <home-transaction-editor
          v-if="editing"
          :transaction="transaction"
          @done="close"
        />
        <div v-else class="flex items-center justify-end gap-2">
          <ui-button
            v-if="confirmable"
            color="success"
            :loading="pending"
            :icon="
              transaction.recurring
                ? 'i-ic-baseline-content-copy'
                : 'i-ic-baseline-check-circle'
            "
            @click="confirm"
          >
            {{ $t("confirm") }}
          </ui-button>
          <ui-button
            color="secondary"
            icon="i-ic-baseline-mode-edit"
            :aria-label="$t('edit')"
            @click="editing = true"
          />
          <template v-if="confirmingDelete">
            <ui-button
              :loading="pending"
              icon="i-ic-round-delete-forever"
              :aria-label="$t('delete')"
              @click="remove"
            />
            <ui-button
              color="secondary"
              icon="i-ic-baseline-close"
              :aria-label="$t('cancel')"
              @click="confirmingDelete = false"
            />
          </template>
          <ui-button
            v-else
            color="danger"
            icon="i-ic-baseline-delete"
            :aria-label="$t('delete')"
            @click="confirmingDelete = true"
          />
        </div>
      </div>
    </transition>
  </article>
</template>

<script setup lang="ts">
import type { Transaction } from "~/types";

const props = defineProps<{
  transaction: Transaction;
  /** rendered subdued, for transactions that didn't happen yet */
  muted?: boolean;
}>();

const expanded = ref(false);
const editing = ref(false);
const confirmingDelete = ref(false);

const {
  pending,
  confirm: confirmTransaction,
  remove: removeTransaction,
} = useTransactionActions();

const date = computed(() => new Date(props.transaction.transactedAt));
const isTransactionIncome = computed(() => isIncome(props.transaction));

/** happened already, but wasn't confirmed yet */
const confirmable = computed(
  () => !props.transaction.confirmed && date.value <= new Date(),
);

const toggle = () => {
  expanded.value = !expanded.value;
  editing.value = false;
  confirmingDelete.value = false;
};

const close = () => {
  expanded.value = false;
  editing.value = false;
};

const confirm = () =>
  confirmTransaction(
    props.transaction.id,
    props.transaction.transactedAt,
    props.transaction.recurring,
  );

const remove = () => removeTransaction(props.transaction.id);
</script>

<style scoped>
.transaction-card {
  display: flex;
  gap: 1rem;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  color: inherit;
  font: inherit;
  border-radius: var(--border-radius);
  background-color: var(--bg-200);
  padding: 1rem 1rem 1rem 0;
  box-sizing: border-box;
  border: 1px solid var(--border-100);
  transition: background-color 0.2s ease-in-out;
}
</style>

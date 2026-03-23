<template>
  <div>
    <div v-if="pending && !transaction" class="center">
      <MosaicLoader />
    </div>

    <div v-else-if="transaction" class="flex flex-col">
      <section
        class="row title transaction-title-row gap-4 flex-wrap justify-between"
      >
        <div class="min-w-0 flex flex-col gap-2">
          <div class="flex items-center gap-3 flex-wrap">
            <h1 class="uppercase text-3xl">
              {{ transaction.description || $t("t_placeholder") }}
            </h1>
            <Transition name="page" mode="out-in">
              <spinner v-show="pending" class="item" />
            </Transition>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <ui-pin
              v-if="transaction.category"
              :text="transaction.category.name"
              :color="transaction.category.color"
              clickable
              size="small"
              @click="navigateTo(`/categories/${transaction.category.id}`)"
            />
            <ui-pin
              v-if="transaction.project"
              :text="transaction.project.name"
              :color="transaction.project.color"
              clickable
              size="small"
              @click="navigateTo(`/projects/${transaction.project.id}`)"
            />
            <ui-pin
              v-for="status in statusPins"
              :key="status.text"
              :text="status.text"
              :color="status.color"
              size="small"
            />
          </div>
        </div>

        <div class="card flex-1 flex flex-col items-end">
          <span class="summary-label">{{ amountLabel }}</span>
          <ui-price
            :amount="transaction.amount"
            :currency-in="transaction.currency"
            size="2rem"
            :color="amountColor"
          />
          <ui-button
            icon="i-ic-baseline-mode-edit"
            outlined
            class="mt-2"
            @click="editing = !editing"
          >
            {{ editing ? $t("cancel") : $t("edit") }}
          </ui-button>
        </div>
      </section>

      <transition name="page" mode="out-in">
        <section v-if="editing" class="mt-1">
          <transaction-form
            :transactionIn="transaction"
            :startStage="3"
            @send="editTransaction"
            @cancel="editing = false"
            @close="editing = false"
          />
        </section>
      </transition>

      <div class="card summary-card">
        <span class="summary-label">{{ $t("t_date") }}</span>
        <span class="summary-value">{{
          formatddMMYYYY(transaction.transactedAt, locale)
        }}</span>
      </div>

      <section class="row card detail-row">
        <div class="row-label">
          <p class="item">{{ $t("t_desc") }}</p>
          <p class="desc">Read only</p>
        </div>
        <div class="item row-value text-right break-words">
          {{ transaction.description || $t("undefined") }}
        </div>
      </section>

      <section class="row card detail-row">
        <div class="row-label">
          <p class="item">{{ $t("t_amount") }}</p>
          <p class="desc">{{ transaction.currency }}</p>
        </div>
        <div class="item row-value">
          <ui-price
            :amount="transaction.amount"
            :currency-in="transaction.currency"
            :color="amountColor"
          />
        </div>
      </section>

      <section class="row card detail-row">
        <div class="row-label">
          <p class="item">{{ $t("t_from") }}</p>
          <p class="desc">Source account</p>
        </div>
        <div class="item row-value">
          <ui-pin
            :text="transaction.source.name"
            clickable
            size="normal"
            @click="navigateTo(`/sources/${transaction.source.id}`)"
          />
        </div>
      </section>

      <section class="row card detail-row">
        <div class="row-label">
          <p class="item">{{ $t("t_to") }}</p>
          <p class="desc">Target account</p>
        </div>
        <div class="item row-value">
          <ui-pin
            :text="transaction.target.name"
            clickable
            size="normal"
            @click="navigateTo(`/sources/${transaction.target.id}`)"
          />
        </div>
      </section>

      <section class="row card detail-row">
        <div class="row-label">
          <p class="item">{{ $t("t_tag") }}</p>
          <p class="desc">Primary category</p>
        </div>
        <div class="item row-value">
          <ui-pin
            v-if="transaction.category"
            :text="transaction.category.name"
            :color="transaction.category.color"
            clickable
            size="normal"
            @click="navigateTo(`/categories/${transaction.category.id}`)"
          />
          <span v-else>{{ $t("undefined") }}</span>
        </div>
      </section>

      <section class="row card detail-row">
        <div class="row-label">
          <p class="item">{{ $t("t_project") }}</p>
          <p class="desc">Optional link</p>
        </div>
        <div class="item row-value">
          <ui-pin
            v-if="transaction.project"
            :text="transaction.project.name"
            :color="transaction.project.color"
            clickable
            size="normal"
            @click="navigateTo(`/projects/${transaction.project.id}`)"
          />
          <span v-else>{{ $t("undefined") }}</span>
        </div>
      </section>

      <section class="row card detail-row">
        <div class="row-label">
          <p class="item">Tags</p>
          <p class="desc">Attached labels</p>
        </div>
        <div class="item row-value multi-value">
          <template v-if="transaction.tags.length > 0">
            <ui-pin
              v-for="tag in transaction.tags"
              :key="tag.id"
              :text="tag.name"
              size="small"
            />
          </template>
          <span v-else>{{ $t("undefined") }}</span>
        </div>
      </section>

      <section class="row card detail-row">
        <div class="row-label">
          <p class="item">Status</p>
          <p class="desc">Transaction state</p>
        </div>
        <div class="item row-value multi-value">
          <ui-pin
            v-for="status in statusPins"
            :key="`${status.text}-row`"
            :text="status.text"
            :color="status.color"
            size="small"
          />
        </div>
      </section>
    </div>

    <error-banner v-else status="404" message="not found" :is-login="false" />
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from "~/types";

type StatusPin = {
  text: string;
  color?: string;
};

const route = useRoute();
const id = parseInt(route.params.id as string);
const { locale, t } = useI18n();
const notifications = useNotifications();

const { data, pending, refresh } = await useFetch<{ data: Transaction }>(
  `/api/transactions/${id}`,
);

const transaction = computed(() => data.value?.data);
const editing = ref(false);
const transactionStore = useTransactionStore();

const recurringLabel = computed(() => {
  if (!transaction.value?.recurring) {
    return t("undefined");
  }

  return `${transaction.value.recurring}m`;
});

const isIncomeTransaction = computed(() => {
  if (!transaction.value) {
    return false;
  }

  return isIncome(transaction.value);
});

const amountLabel = computed(() => {
  return isIncomeTransaction.value ? t("income") : t("expenses");
});

const amountColor = computed(() => {
  return isIncomeTransaction.value ? "var(--primary-100)" : "var(--text-100)";
});

const statusPins = computed<StatusPin[]>(() => {
  if (!transaction.value) {
    return [];
  }

  const pins: StatusPin[] = [];

  if (transaction.value.confirmed) {
    pins.push({ text: "Confirmed", color: "#2f9e44" });
  } else {
    pins.push({ text: "Pending" });
  }

  if (transaction.value.cancelled) {
    pins.push({ text: "Cancelled", color: "#e03131" });
  }

  if (transaction.value.isImportant) {
    pins.push({ text: t("t_important"), color: "#f59f00" });
  }

  if (transaction.value.isHidden) {
    pins.push({ text: t("t_hidden"), color: "#6b7280" });
  }

  if (transaction.value.recurring) {
    pins.push({ text: `${transaction.value.recurring}m` });
  }

  return pins;
});

const editTransaction = async (transactionData: { [key: string]: any }) => {
  try {
    await transactionStore.editTransaction({ id, ...transactionData });
    await refresh();
    editing.value = false;
    notifications.addNotification({
      text: t("t_editted"),
      level: "success",
    });
  } catch {
    notifications.addNotification({
      text: t("error"),
      level: "error",
    });
  }
};
</script>

<style lang="scss" scoped>
.flex-col {
  gap: 0.3rem;
}

.transaction-title-row {
  align-items: stretch;
}

.transaction-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.3rem;
}

.summary-card,
.amount-card,
.row,
.card {
  min-height: 5rem;
}

.summary-card,
.amount-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.35rem;
}

.amount-card {
  align-items: flex-end;
}

.summary-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.65;
}

.summary-value {
  font-size: 1.05rem;
}

.detail-row {
  align-items: center;
  gap: 1rem;
}

.row-label {
  filter: contrast(0.7);

  p {
    text-transform: capitalize;
  }

  .desc {
    font-size: small;
    line-height: 100%;
    filter: contrast(0.3) opacity(0.5);
    text-transform: none;
  }
}

.row-value {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  text-align: right;
  min-width: 0;
}

.multi-value {
  flex-wrap: wrap;
  gap: 0.5rem;
}

@media (max-width: 900px) {
  .transaction-summary-grid {
    grid-template-columns: 1fr;
  }

  .amount-card {
    align-items: flex-start;
    min-width: 0;
  }
}

@media (max-width: 640px) {
  .detail-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .row-value {
    margin-left: 0;
    width: 100%;
    justify-content: flex-start;
    text-align: left;
  }
}
</style>

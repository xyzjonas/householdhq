<template>
  <div :style="transparent && !details ? transparentStyle : ''">
    <div class="wrapper">
      <div
        :class="`transaction ${transaction.target.isOut ? '' : 'income'}`"
        :style="`width: ${details ? 60 : 100}%`"
        @click="
          details = !details;
          confirmDelete = false;
        "
      >
        <div class="item">
          <DateTile :date="date" />
        </div>
        <div class="item">
          {{ transaction.description }}
          <br />
          <small style="font-size: xx-small"
            >{{ transaction.source.name }} ⤍ {{ transaction.target.name }}</small
          >
        </div>
        <p class="item">
          <ui-price :amount="transaction.amount" :currency="transaction.currency" />
        </p>
      </div>

      <!-- BUTTONS -->
      <div class="panel" :style="`width: ${details ? 40 : 0}%`">
        <ui-button
          v-if="!confirmDelete"
          icon="i-ic-baseline-delete"
          color="danger"
          @click="confirmDelete = !confirmDelete"
        />
          <!-- {{ $t("delete") }}</ui-button> -->
        <ui-button
          v-else
          icon="i-ic-round-delete-forever"
          color="danger"
          :loading="loading"
          @click="emit('delete', { id: transaction.id })"
        />
        <ui-button @click="edit = !edit" :icon="edit ? 'i-ic-baseline-close' : 'i-ic-baseline-mode-edit'" />
      </div>

      <div class="panel y" :style="`width: ${confirmable ? 20 : 0}%`">
        <ui-button
          color="success"
          :loading="loading"
          :icon="transaction.recurring ? 'i-ic-baseline-content-copy' : 'i-ic-baseline-check-circle'"
          @click="confirmPendingTransaction(transaction)"
        >
          <small v-if="transaction.recurring > 0">{{ transaction.recurring }}m</small>
        </ui-button>
      </div>
    </div>
    <transition name="page" mode="in-out">
      <div v-if="edit && details">
        <TransactionForm
          :transactionIn="transaction"
          :startStage="2"
          :processing="loading"
          @cancel="edit = false"
          @send="editTransaction"
        />
      </div>
    </transition>
  </div>
</template>
<script setup lang="ts">
import type { Transaction } from "@/stores/types";
import { useTransactionStore } from "@/stores/transactions";
import { storeToRefs } from "pinia";

const props = defineProps<{
  transaction: Transaction;
  transparent?: boolean;
}>();

const details = ref(false);
const edit = ref(false);
const patching = ref(false);
const patchingError = ref("");

const confirmDelete = ref(false);

const transparentStyle = ref("");
if (props.transparent) {
  transparentStyle.value = "filter: opacity(0.3);";
}

const emit = defineEmits(["patched", "delete"]);

const { t } = useI18n();
const transactions = useTransactionStore();
const { loading } = storeToRefs(transactions);
const notifications = useNotifications();

const confirmPendingTransaction = (transaction: Transaction) => {
  transactions.editTransaction({ id: transaction.id, confirmed: true, created: transaction.created })
  .then(() => {
    notifications.addNotification({
      text: transaction.recurring > 0 ? t('t_confirmed_reccuring') : t('t_confirmed'),
      level: 'success',
    });
    details.value = false;
    edit.value =false;
  })
}

const editTransaction = (transactionData: Transaction) => {
  transactions.editTransaction(transactionData)
  .then(() => {
    notifications.addNotification({
      text: t('t_editted'),
      level: 'success',
    })
    details.value = false;
    edit.value =false;
  })
}

const date = computed(() => {
  return new Date(props.transaction.created);
});

const firstTag = computed(() => {
  if (props.transaction.tags.length > 0) {
    return props.transaction.tags[0];
  }
  return undefined;
});

const tagColor = computed(() => {
  if (firstTag.value && firstTag.value.color) {
    return `${firstTag.value.color}aa`;
  }
  return "#00000000";
});

const confirmable = computed(() => {
  return !props.transaction.confirmed && date.value <= new Date();
});
</script>
<style lang="scss" scoped>
.transaction {
  border-right: solid 10px;
  border-right-color: v-bind("tagColor") !important;
  transition: 250ms;
  cursor: pointer;

  &:hover {
    transition: 250ms;
    border-right-color: v-bind("tagColor");
    filter: brightness(1.05);
  }
}

.wrapper {
  display: flex;
  flex-direction: row;

  .panel {
    overflow: hidden;
    display: flex;
    align-items: center;
    transition: 250ms;
    padding-top: 0.25em;
    padding-bottom: 0.25em;

    .y {
      flex-direction: column;
    }

    button {
      height: 100%;
      width: 4em;
      margin-left: 5px;
      flex: auto;
    }
  }
}

.income {
  border-color: var(--color-success);
}
</style>

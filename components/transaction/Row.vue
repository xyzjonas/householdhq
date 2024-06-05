<template>
  <div :style="transparent && !details ? transparentStyle : ''">
    <div class="wrapper">
      <div
        :class="`transaction ${isExpense(transaction) ? '' : 'income'}`"
        :style="`flex: 1`"
        @click="
          details = !details;
          edit = false;
          buttons.deleteCancel.onClick();
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
      <div class="panel y" :style="`flex: ${details ? '1' : '0'}; max-width: 8rem`">
        <ui-button v-for="btn in [leftBtn, rightBtn]"
          :color="btn?.color as any ?? 'secondary'"
          :icon="btn?.icon"
          :loading="btn?.loading as any ?? false"
          iconSize="1.2rem"
          @click="btn?.onClick"
        />
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
          :startStage="3"
          :processing="loading"
          @cancel="edit = false"
          @send="editTransaction"
          hideClose
        />
      </div>
    </transition>
  </div>
</template>
<script setup lang="ts">
import type { Transaction } from "@/types";
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
  transactions.editTransaction({ id: transaction.id, confirmed: true, transactedAt: transaction.transactedAt })
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
  return new Date(props.transaction.transactedAt);
});

// const firstTag = computed(() => {
//   if (props.transaction.tags.length > 0) {
//     return props.transaction.tags[0];
//   }
//   return undefined;
// });

const tagColor = computed(() => {
  return props.transaction.category?.color ?? "#00000000";
});

const confirmable = computed(() => {
  return !props.transaction.confirmed && date.value <= new Date();
});

type Button = { icon: string, onClick: () => void, color?: string, loading?: Ref<boolean>}


const leftBtn = ref<Button>();
const rightBtn = ref<Button>();

const buttons: {[key: string]: Button} = {
  delete: {
    icon: 'i-ic-baseline-delete',
    color: 'danger',
    onClick: () => {
      leftBtn.value = buttons.deleteConfirm;
      rightBtn.value = buttons.deleteCancel;
      edit.value = false;
    },
  },
  deleteConfirm: {
    icon: 'i-ic-round-delete-forever',
    onClick: () => (emit('delete', { id: props.transaction.id })),
    loading: loading,
    color: 'danger',
  },
  deleteCancel: {
    icon: 'i-ic-baseline-close',
    onClick: () => {
      leftBtn.value = buttons.delete;
      rightBtn.value = buttons.edit;
    }
  },
  edit: {
    icon: 'i-ic-baseline-mode-edit',
    onClick: () => {
      rightBtn.value = buttons.editCancel;
      edit.value = true;
    }
  },
  editCancel: {
    icon: 'i-ic-baseline-close',
    onClick: () => {
      rightBtn.value = buttons.edit;
      edit.value = false;
    }
  }
}

leftBtn.value = buttons.delete;
rightBtn.value = buttons.edit;

</script>
<style lang="scss" scoped>
.transaction {
  border: none;
  border-right: solid 10px;
  border-right-color: v-bind("tagColor") !important;
  transition: 250ms;
  cursor: pointer;
  
  border-radius: 0;
  border-bottom-left-radius: .3rem;
  border-top-left-radius: .3rem;

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
  // border-top: 1px solid;
  // border-bottom: 1px solid;
  // border-left: 1px solid;
  // border-top-color: var(--color-success) !important;
  // border-bottom-color: var(--color-success) !important;
  // border-left-color: var(--color-success) !important;
  background-color: #4b77584b;
}
</style>

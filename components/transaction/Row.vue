<template>
  <div :style="transparent && !details ? transparentStyle : ''" class="my-2 relative">
    <div v-if="transaction?.project?.name" class="absolute right-0 top-[-9px] z-5">
      <ui-pin clickable @click="navigateTo(`/projects/${transaction.project.id}`)" :text="transaction.project.name" :color="transaction.project.color" size="small" />
    </div>
    <div class="wrapper gap-1">
      <div class="transaction-card flex-1" @click="() => onRowClick()">
        <DateTile :date="date" class="min-w-20 w-20" />
        <div class="flex flex-col">
          <span>{{ transaction.description }}</span>
          <span style="font-size: .7rem;" class="mb-2">{{ transaction.source.name }} ⤍ {{ transaction.target.name }}</span>
          <div class="flex items-center gap-2">
            <ui-pin v-if="transaction.category?.name" :text="transaction.category.name" :color="transaction?.category?.color" size="small"/>
            <i v-if="transaction.recurring" class="i-ic-baseline-rotate-right"></i>
            <i v-if="transaction.isImportant" class="i-ic-round-warning text-amber"></i>
            <i v-if="transaction.isHidden" class="i-ic-baseline-disabled-visible"></i>
          </div>
        </div>
        <p class="ml-auto">
          <ui-price :amount="transaction.amount" :currency="transaction.currency" :color="isTransactionIncome ? 'var(--primary-100)' : undefined" />
          <p v-if="isTransactionIncome" class="flex items-center gap-1 justify-end" style="color: var(--primary-100);">
            <span class="text-xs">{{ $t('income') }}</span>
            <i class="i-ic-outline-trending-up"></i>
          </p>
        </p>
      </div>
      <!-- BUTTONS -->
      <div class="panel y max-w-md" :style="editButtonsStyle">
        <ui-button
          v-for="btn in [leftBtn, rightBtn]"
          :color="btn?.color as any ?? 'secondary'"
          :icon="btn?.icon"
          :loading="btn?.loading as any ?? false"
          iconSize="1.2rem"
          @click="btn?.onClick"
        />
      </div>

      <ui-button
        v-if="confirmable"
        color="success"
        :loading="loading"
        width="5rem"
        :icon="transaction.recurring ? 'i-ic-baseline-content-copy' : 'i-ic-baseline-check-circle'"
        @click="confirmPendingTransaction(transaction)"
      >
        <small v-if="transaction.recurring > 0">{{ transaction.recurring }}m</small>
      </ui-button>
    </div>
    <transition name="page" mode="in-out">
      <div v-if="edit && details" class="mt-2">
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

const isTransactionIncome = computed(() => isIncome(props.transaction))

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
    color: 'primary',
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

const onRowClick = () => {
  details.value = !details.value;
  edit.value = false;
  buttons.deleteCancel.onClick();
}

const editButtonsStyle = computed(() => {
  if (details.value && confirmable.value) {
    return ''
  }

  if (details.value) {
    return 'right: 0.5rem'
  }

  return 'right: -15rem'
})

</script>
<style lang="scss" scoped>
.transaction {
  position: relative;
  transition: 250ms;
  cursor: pointer;
  transition: background-color .2s ease-in-out;
}

.wrapper {
  display: flex;
  flex-direction: row;
  position: relative;
  overflow: hidden;

  .panel {
    position: absolute;
    top: 0.5rem;
    right: calc(5rem + .5rem + .5rem);
    height: calc(100% - 2*.5rem);
    overflow: hidden;
    display: flex;
    flex-direction: row;
    align-items: center;
    transition: .3s ease-in-out;
    backdrop-filter: blur(2px);
    // background-color: var(--bg-200);

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

.transaction-card {
  position: relative;
  display: flex;
  gap: 1rem;
  align-items: center;
  transition: 250ms;
  transition: .2s ease-in-out;
  cursor: pointer;
  overflow: hidden;

  border-radius: 4px;
  background-color: var(--bg-200);
  padding: 1rem .5rem;
  padding-right: 1rem;
  padding-left: 0;
  box-sizing: border-box;
  transition: background-color border .2s ease-in-out;
  border: 1px solid var(--border-100);
}

.color-flag {
  width: 5rem;
  height: 2rem;
  background-color: v-bind('transaction.category?.color');
  position: absolute;
  transform: rotate(-50deg) translateY(-3.8rem);
  left: 0;
}
</style>

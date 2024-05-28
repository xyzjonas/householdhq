<template>
  <div class="container">
    <MonthHero @reload="monthReloaded" />
    <div>
      <top-summary :expense="expense" :income="income" />

      <HomeCarousel
        :expenses="expenseCategories"
        :incomes="incomeCategories"
        @filter="(tagId: number) => (filterTagId = tagId)"
      />

      <transition name="slide" mode="out-in">
        <BalanceRow
          v-if="isCurrentMonth"
          :sources="incomeSources"
          :upcomming="upcommingTransactionsAmount"
          :forecast="upcommingTransactionsAmount"
          :spent="expense"
          :total-income="income"
          class="mb-1"
        />
      </transition>

      <transition name="page">
        <section v-if="addExpense" class="mt-1">
          <transaction-form
            v-if="addExpense"
            @cancel="addExpense = false"
            @send="putTransaction"
            @close="addExpense = false"
            :processing="putLoading"
          />
        </section>
      </transition>

      <!-- SHOW UPCOMMING -->
      <h4 v-if="isCurrentMonth && currentMonth.length > 0" id="remaining-bills" class="title row-simple">
        <i class="i-ic-baseline-calendar-today"></i>
        <span @click="showUpcomming = !showUpcomming">
          {{ upcommingTransactions.length }} {{ mapTransactionDeclention(upcommingTransactions.length) }}:
        </span>
        <ui-price @click="showUpcomming = !showUpcomming" :amount="upcommingTransactionsAmount" :currency="currency" style="margin-left: 1rem;"/>
        <ui-chevron v-model="showUpcomming" />
      </h4>
      <transition name="page">
        <section v-if="showUpcomming || filterTagId > 0">
          <TransactionRow
            v-for="transaction in upcommingTransactions"
            :key="transaction.id"
            :transaction="transaction"
            :transparent="true"
            class="upcomming"
            @patched="updateTransaction"
            @delete="deleteTransaction"
          />
        </section>
      </transition>
      <section>
        <ui-empty
          v-if="!transactions || transactions.length <= 0"
          :loading="loading"
          icon="fa-solid fa-list"
          :title="$t('no_transactions')"
          :subtitle="$t('no_transactions_will_appear')"
          class="no-transactions"
        />
        <TransactionRow
          v-for="transaction in transactions"
          :key="transaction.id"
          :transaction="transaction"
          @patched="updateTransaction"
          @delete="deleteTransaction"
        />
      </section>
    </div>
    <div id="floating" :class="{ active: addExpense }">
      <ui-button
        :color="addExpense ? 'secondary' : 'primary'"
        icon="i-ic-baseline-plus"
        iconSize="1.5rem"
        width="4rem"
        rounded
        @click="addExpense = !addExpense"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";

import { useTokenStore } from "@/stores/tokenStore";
import { useCategoriesStore } from "@/stores/categories";
import { useSourcesStore } from "@/stores/sources";
import { useTransactionStore } from "@/stores/transactions";
import type { Tag, Transaction } from "@/stores/types";
import { useNotifications } from "@/composables/useNotifications";

const tokenStore = useTokenStore();
const { token } = storeToRefs(tokenStore);

const transactionStore = useTransactionStore();
const { currentMonth, currency, loading, year, month } = storeToRefs(transactionStore);
const isCurrentMonth = computed(() => {
  if (!month.value && !year.value) {
    return true;
  }
  const now = new Date();
  return year.value === now.getFullYear() && month.value === now.getMonth() + 1;
});

const sourcesStore = useSourcesStore();
const { incomeSources, expenseSources } = storeToRefs(sourcesStore);

const categoriesStore = useCategoriesStore();
const { incomeCategories, expenseCategories } = storeToRefs(categoriesStore);

const putLoading = ref(false);
const showUpcomming = ref(false);
const showHidden = ref(false);

const addExpense = ref(false);

const filterTagId = ref<number>(-1);

const notifications = useNotifications();

const { yearPath, monthPath } = useRoute().query;

month.value = parseInt(monthPath as string);
year.value = parseInt(yearPath as string);

const { $pwa } = useNuxtApp();

onMounted(async () => {
  // await $pwa.install();

  transactionStore.fetchTransactions();
  sourcesStore.fetchAllSources();
  categoriesStore.fetchCategories();
});

const initialFetch = () => {
  transactionStore.fetchTransactions();
  sourcesStore.fetchAllSources();
};

const transactions = computed(() => {
  const tmp = currentMonth.value.filter((trans: Transaction) => new Date(trans.created) <= new Date());
  if (showHidden.value) {
    return tmp;
  }
  return tmp
    .filter((trans: Transaction) => isTransactionTagged(trans, filterTagId.value))
    .filter((trans: Transaction) => !(!trans.source.isOut && !trans.target.isOut));
});

const incomeTransactions = computed(() =>
  transactions.value.filter((tr: Transaction) => !tr.target.isOut && tr.source.isOut)
);
const expenseTransactions = computed(() =>
  transactions.value.filter((tr: Transaction) => tr.target.isOut && !tr.source.isOut)
);

const income = computed(() =>
  incomeTransactions.value.map((tr: Transaction) => tr.amount).reduce((a: number, b: number) => a + b, 0)
);
const expense = computed(() =>
  expenseTransactions.value.map((tr: Transaction) => tr.amount).reduce((a: number, b: number) => a + b, 0)
);

const upcommingTransactions = computed(() => {
  const tmp = currentMonth.value.filter((trans: Transaction) => new Date(trans.created) > new Date());
  if (showHidden.value) {
    return tmp;
  }
  return tmp.filter((trans: Transaction) => isTransactionTagged(trans, filterTagId.value));
});

const upcommingTransactionsAmount = computed<number>(() => {
  return upcommingTransactions.value
    .filter((trans: Transaction) => trans.target.isOut)
    .map((trans: Transaction) => trans.amount)
    .reduce((a: number, b: number) => a + b, 0);
});

const putTransaction = (transactionData: Transaction) => {
  transactionStore.createTransaction(transactionData).then(() => {
    addExpense.value = false;
    putLoading.value = false;
    notifications.addNotification({
      text: t("t_added"),
      level: "success",
    })
  })
};

const deleteTransaction = (transactionData: Transaction) => {
  const url = "/api/transactions";
  loading.value = true;
  $fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token.value,
    },
    body: transactionData,
  })
    .then((res) => {
      currentMonth.value = currentMonth.value.filter((t: Transaction) => t.id != transactionData.id);
    })
    .finally(() => (loading.value = false));
};

const updateTransaction = (transaction: Transaction) => {
  for (let index = 0; index < currentMonth.value.length; index++) {
    const element = currentMonth.value[index];
    if (element.id === transaction.id)
      if (element.id === transaction.id) {
        currentMonth.value[index] = transaction;
        transactionStore.fetchTransactions();
        // transactionStore.fetchgetTransactions();
      }
  }
};

const { t } = useI18n();
const mapTransactionDeclention = (count: number) => {
  if (count === 1) {
    return t("t_upcomming_1");
  } else if (count > 1 && count < 5) {
    return t("t_upcomming_2");
  } else {
    return t("t_upcomming_5");
  }
};

const isTransactionTagged = (transaction: any, tagId: number) => {
  if (tagId < 0) {
    return true;
  }
  return transaction.tags.filter((t: Tag) => t.id === tagId).length > 0;
};

const monthReloaded = (newDate: Date) => {
  year.value = newDate.getFullYear();
  month.value = newDate.getMonth() + 1;
  initialFetch();
};
</script>

<style scoped lang="scss">
#remaining-bills {
  padding-inline: 1rem;
  margin-top: 2rem;
  margin-bottom: 8px;

  button:last-child {
    margin-left: auto;
  }
}

h3 {
  text-transform: uppercase;
}

.no-transactions {
  height: 320px;
  padding: 0;
  border: 1px dashed var(--color-border-dark);
  border-radius: 8px;
}


.btn-collapsible {
  flex: 1;

  &-out {
    flex: 2;
  }
}

.hide {
  flex: 0;
  overflow: hidden;
  border: none;
}

#floating {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  border-radius: 50%;
  box-shadow: 1px 1px 20px var(--bg-100);
  transition: transform .1s ease-in-out;
  opacity: .95;
  
  &.active {
    transform: rotate(45deg);
  }
}
</style>

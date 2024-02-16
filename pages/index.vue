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
      <h4 v-if="currentMonth && currentMonth.length > 0" id="remaining-bills" class="title row-simple">
        <span class="icon"><i class="fa-solid fa-calendar"></i></span>
        <span v-if="isCurrentMonth">
          {{ upcommingTransactions.length }} {{ mapTransactionDeclention(upcommingTransactions.length) }}:
        </span>
        <ui-price :amount="upcommingTransactionsAmount" :currency="currency" style="margin-left: 1rem;"/>
        <ui-button
          v-if="isCurrentMonth"
          @click="showUpcomming = !showUpcomming"
          width="1.5rem"
          height="1.5rem"
          link
          :icon="showUpcomming ? 'fa fa-chevron-up' : 'fa fa-chevron-down'"
        />
      </h4>
      <!-- <ui-button
        @click="showHidden = !showHidden"
        :icon="!showHidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"
        color="light"
        style="padding: .5rem;"
      /> -->

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
        icon="fa fa-plus"
        width="3rem"
        height="3rem"
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
  putLoading.value = true;
  const url = "/api/transactions";
  $fetch(url, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + token.value,
    },
    body: transactionData,
  })
    .then((res: any) => currentMonth.value.unshift(res.data))
    .finally(() => {
      addExpense.value = false;
      putLoading.value = false;
    });
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
  console.info(newDate);
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
  
  &.active {
    transform: rotate(45deg);
  }
}
</style>

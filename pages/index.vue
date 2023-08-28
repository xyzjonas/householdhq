<template>
  <div class="container">
    <MonthHero @reload="monthReloaded"/>
    <div>
      <top-summary :expense="expense" :income="income"/>
      <HomeCarousel
        :expenses="expenseCategories"
        :incomes="incomeCategories"
        :sources="incomeSources"
        :targets="expenseSources"
        @filter="tagId => filterTagId = tagId"
      />

      <transition name="slide" mode="out-in">
        <BalanceRow v-if="isCurrentMonth" :sources="incomeSources" class="card" />
      </transition>

      <!-- ADD NEW TRANSACTION -->
      <ui-button
        @click="addTransaction = !addTransaction"
        width="100%"
        height="64px"
        :icon="addTransaction ? 'fa-solid fa-xmark' : 'fa-solid fa-coins'"
        class="mb mt"
      >{{ addTransaction ? $t('cancel') : $t('t_add') }}</ui-button>
      <transition name="page">
      <section v-if="addTransaction" style="padding-top: 0;">
        <TransactionForm
          v-if="addTransaction"
          @cancel="addTransaction = false"
          @send="putTransaction"
          :processing="putLoading"
        />
      </section>
      </transition>

      <!-- SHOW UPCOMMING -->
      <h4 id="remaining-bills" class="title row-simple">
        <span>{{ upcommingTransactions.length }} {{ mapTransactionDeclention(upcommingTransactions.length) }}</span>
        <button 
          @click="showUpcomming = !showUpcomming"
          class="card font-l ml"
        >
          <ui-price :amount="upcommingTransactionsAmount" :currency="currency"/>
        </button>
        <ui-button
          @click="showHidden = !showHidden"
          icon="fa-solid fa-eye-slash"
          width="36px"
          height="36px"
          :outlined="true"
          style="margin-left: auto;"
        />
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
          <TransactionRow
            v-for="transaction in transactions"
            :key="transaction.id"
            :transaction="transaction"
            @patched="updateTransaction"
            @delete="deleteTransaction"
          />
      </section>

    </div>

  </div>
</template>
<script setup lang="ts">
import {
  TransactionRow, HomeCarousel,
  MonthHero, MosaicLoader, TransactionForm,
  TopSummary, BalanceRow
} from '#components';
// import { useAuth0 } from '@auth0/auth0-vue';
import type Prisma from '@prisma/client';
import { storeToRefs } from 'pinia';

import { useTokenStore } from '@/stores/tokenStore';
import { useCategoriesStore } from '@/stores/categories';
import { useSourcesStore } from '@/stores/sources';
import { useTransactionStore } from '@/stores/transactions';

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
})

const sourcesStore = useSourcesStore();
const { incomeSources, expenseSources } = storeToRefs(sourcesStore);

const categoriesStore = useCategoriesStore();
const { incomeCategories, expenseCategories } = storeToRefs(categoriesStore);

const putLoading = ref(false);
const showUpcomming = ref(false);
const showHidden = ref(false);

const addTransaction = ref(false);
const filterTagId = ref<number>(-1);

const { yearPath, monthPath } = useRoute().query

month.value = parseInt(monthPath as string);
year.value = parseInt(yearPath as string);


const { $pwa } = useNuxtApp();

onMounted(async () => {
  // await $pwa.install();

  transactionStore.fetchTransactions();
  sourcesStore.fetchAllSources();
  categoriesStore.fetchCategories();
})

const initialFetch = () => {
  transactionStore.fetchTransactions();
  sourcesStore.fetchAllSources();
};

const transactions = computed(() => {
  const tmp = currentMonth.value.filter(trans => new Date(trans.created) <= new Date())
  if (showHidden.value) {
    return tmp;
  }
  return tmp
    .filter(trans => isTransactionTagged(trans, filterTagId.value))
    .filter(trans => !(!trans.source.isOut && !trans.target.isOut));
});

const incomeTransactions = computed(() => transactions.value
  .filter(tr => !tr.target.isOut && tr.source.isOut)
);
const expenseTransactions = computed(() => transactions.value
  .filter(tr => tr.target.isOut && !tr.source.isOut)
);

const income = computed(() => incomeTransactions.value.map(tr => tr.amount).reduce((a, b) => a + b, 0));
const expense = computed(() => expenseTransactions.value.map(tr => tr.amount).reduce((a, b) => a + b, 0));


const upcommingTransactions = computed(() => {
      const tmp = currentMonth.value
        .filter(trans => new Date(trans.created) > new Date())
      if (showHidden.value) {
        return tmp;
      }
      return tmp
        .filter(trans => isTransactionTagged(trans, filterTagId.value));
});

const upcommingTransactionsAmount = computed<number>(() => {
  return upcommingTransactions.value
    .filter(trans => trans.target.isOut)
    .map(trans => trans.amount)
    .reduce((a, b) => a + b, 0)
})

const putTransaction = (transactionData) => {
  loading.value = true;
  const url = "/api/transactions";
  $fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + token.value
    },
    body: transactionData}
  )
    .then(res =>
      currentMonth.value.unshift(res.data)
    )
    .finally(() => { addTransaction.value = false; loading.value = false; })
};
    
const deleteTransaction = (transactionData) => {
  const url = "/api/transactions";
  loading.value = true;
  $fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + token.value
    },
    body: transactionData})
    .then(res => {
      currentMonth.value = currentMonth.value.filter(t => t.id != transactionData.id);
    })
    .finally(() => loading.value = false);
}

const updateTransaction = (transaction) => {
  for (let index = 0; index < currentMonth.value.length; index++) {
    const element = currentMonth.value[index]; if (element.id === transaction.id)
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
    return t('t_upcomming_1')
  } else if (count > 1 && count < 5) {
    return t('t_upcomming_2')
  } else {
    return t('t_upcomming_5')
  }
};

const isTransactionTagged = (transaction: any, tagId: number) => {
  if (tagId < 0) {
    return true;
  }
  return transaction.tags.filter(t => t.id === tagId).length > 0;
};

const monthReloaded = (newDate: Date) => {
  console.info(newDate)
  year.value = newDate.getFullYear();
  month.value = newDate.getMonth() + 1;
  initialFetch();
}

</script>

<style scoped lang="scss">
#add-t-button, #remaining-bills {
  margin-top: 8px;
  margin-bottom: 8px;
}

h3 {
  text-transform: uppercase;
}
.button {
  min-height: 60px;
}
</style>

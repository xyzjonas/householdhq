<template>
  <div class="container">
    <MonthHero />

    <client-only>
      <top-summary :transactions="passed" />
    </client-only>

    <div class="flex gap-2 flex-wrap">
      <HomeCarousel
        v-model="carouselTabindex"
        :expenses="expenseCategories"
        :incomes="incomeCategories"
        @filter="(tagId: number) => (filterCategoryId = tagId)"
        :expand-graph="!isCurrentMonth"
        class="flex-[2]"
      >
        <div
          v-if="isCurrentMonth"
          class="text-center font-thin uppercase flex flex-col justify-center items-center"
        >
          <ui-price :amount="balance" :currency="currency" size="2.5rem" />
          <h4>{{ $t("balance") }}</h4>
          <div class="flex justify-center mt-3">
            (
            <ui-price
              :amount="balance + transactionsTotal(upcomming)"
              :currency="currency"
              size="1rem"
            />
            )
          </div>
        </div>
        <div v-else>
          {{ dateFormatted }}
        </div>
      </HomeCarousel>
      <transition name="slide" mode="out-in">
        <div class="flex flex-col flex-1 gap-2" v-if="isCurrentMonth">
          <BalanceRow
            class="flex-1"
            :sources="
              sources
                .filter((src) => src.isPortfolio)
                .sort((a, b) => a.position - b.position)
            "
            :spent="expense"
            :total-income="income"
          />
          <project-dashboard />
        </div>
      </transition>
    </div>

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

    <hr />
    <ui-empty
      v-if="transactionsLoading"
      title=""
      loading
      class="card min-h-sm"
    />
    <div v-else>
      <div v-if="importantTransactions.length > 0">
        <div class="flex">
          <div
            class="border-r-amber border-r-4 border-r-solid mr-2 pos-relative my-3"
          ></div>
          <div class="flex-1">
            <TransactionRow
              v-for="transaction in importantTransactions"
              :key="transaction.id"
              :transaction="transaction"
              class="upcomming"
              @patched="updateTransaction"
              @delete="deleteTransaction"
            />
          </div>
        </div>
        <div class="flex w-full justify-end items-center">
          <ui-button
            link
            icon="i-ic-round-warning"
            icon-size="1rem"
            flat
            @click="navigateTo('/important')"
            >{{ $t("to_important") }}</ui-button
          >
        </div>
      </div>

      <!-- SHOW UPCOMMING -->
      <div
        v-if="isCurrentMonth && currentMonth.length > 0"
        class="flex items-center gap-2 mb-3 px-3"
      >
        <ui-button
          v-if="importantTransactions.length === 0"
          link
          squared
          icon="i-ic-baseline-check-circle-outline"
          icon-size="1.2rem"
          @click="navigateTo('/important')"
        ></ui-button>

        <div
          v-if="importantTransactions.length === 0"
          class="b-1 border-r-solid h-[1.5rem] border-gray mr-2"
        ></div>
        <i class="i-ic-baseline-calendar-today" style="font-size: large"></i>
        <span @click="showUpcomming = !showUpcomming">
          {{ upcommingTransactions.length }}
          {{ mapTransactionDeclention(upcommingTransactions.length) }}
        </span>
        <ui-price
          @click="showUpcomming = !showUpcomming"
          :amount="totalExpenses(upcomming)"
          :currency="currency"
          size="1.5rem"
          class="card py-2 px-3 ml-1"
        />
        <ui-chevron v-model="showUpcomming" class="ml-auto" />
      </div>

      <transition name="page">
        <section v-if="showUpcomming || filterCategoryId > 0">
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
          class="no-transactions mt-2"
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
    <div id="floating" :class="`${addExpense ? 'active' : ''}`">
      <ui-button
        :color="addExpense ? 'secondary' : 'primary'"
        icon="i-ic-baseline-plus"
        iconSize="1.5rem"
        width="4rem"
        rounded
        outlined
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
import type { Transaction } from "@/types";
import { useNotifications } from "@/composables/useNotifications";
import { totalExpenses, transactionsTotal } from "~/utils/transaction";

const { isCurrent: isCurrentMonth, month, dateFormatted } = useCurrentMonth();

const tokenStore = useTokenStore();
const { token } = storeToRefs(tokenStore);

const projectsStore = useProjectsStore();

const transactionStore = useTransactionStore();
const { currentMonth, passed, upcomming, currency, loading } =
  storeToRefs(transactionStore);

const transactionsLoading = ref(false);
watch(month, async (to, from) => {
  transactionsLoading.value = true;
  await initialFetch();
  transactionsLoading.value = false;
});

const sourcesStore = useSourcesStore();
const { sources } = storeToRefs(sourcesStore);

const balance = computed(() => {
  return sources.value
    .filter((src) => src.isDisponible)
    .reduce((sum, src) => sum + src.sum, 0);
});

const categoriesStore = useCategoriesStore();
const { incomeCategories, expenseCategories } = storeToRefs(categoriesStore);

const putLoading = ref(false);
const showUpcomming = ref(false);
// const showHidden = ref(false);

const addExpense = ref(false);

const filterCategoryId = ref<number>(-1);

const notifications = useNotifications();

const carouselTabindex = ref(0);
const incomesDisplayed = computed(() => carouselTabindex.value === 1);

onMounted(async () => {
  await initialFetch();
});

const initialFetch = async () => {
  await Promise.all([
    transactionStore.fetchTransactions(),
    sourcesStore.fetchAllSources(),
    categoriesStore.fetchCategories(),
    projectsStore.fetchAllProjects(),
  ]);
};

const transactions = computed(() => {
  let tmp = currentMonth.value
    .filter((trans) => new Date(trans.transactedAt) <= new Date())
    .filter((trans) => !(trans.isImportant && !trans.confirmed))
    .filter((trans) => !trans.isHidden);

  if (incomesDisplayed.value) {
    tmp = tmp.filter(isIncome);
  }

  if (filterCategoryId.value >= 0) {
    tmp = tmp.filter(
      (trans: Transaction) => trans.category.id === filterCategoryId.value
    );
  }

  return tmp;
});

const incomeTransactions = computed(() =>
  transactions.value.filter(
    (tr: Transaction) => !tr.target.isOut && tr.source.isOut
  )
);
const expenseTransactions = computed(() =>
  transactions.value.filter(
    (tr: Transaction) => tr.target.isOut && !tr.source.isOut
  )
);

const income = computed(() =>
  incomeTransactions.value
    .map((tr: Transaction) => tr.amount)
    .reduce((a: number, b: number) => a + b, 0)
);
const expense = computed(() =>
  expenseTransactions.value
    .map((tr: Transaction) => tr.amount)
    .reduce((a: number, b: number) => a + b, 0)
);

const upcommingTransactions = computed(() => {
  const tmp = currentMonth.value.filter(
    (trans) => new Date(trans.transactedAt) > new Date()
  );
  if (filterCategoryId.value >= 0) {
    return tmp.filter(
      (trans: Transaction) => trans.category.id === filterCategoryId.value
    );
  }

  return tmp;
});

const importantTransactions = computed(() => {
  return currentMonth.value.filter((t) => t.isImportant && !t.confirmed);
});

const putTransaction = (transactionData: Transaction) => {
  transactionStore.createTransaction(transactionData).then(() => {
    addExpense.value = false;
    putLoading.value = false;
    notifications.addNotification({
      text: t("t_added"),
      level: "success",
    });
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
      currentMonth.value = currentMonth.value.filter(
        (t: Transaction) => t.id != transactionData.id
      );
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
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 3rem;
}

#remaining-bills {
  padding-inline: 1rem;

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
  bottom: 0.5rem;
  right: 0.5rem;
  border-radius: 50%;
  transition: transform 0.1s ease-in-out;
  z-index: 900;
  // box-shadow: 2px 2px 5px var(--shadow-100);

  &.active {
    transform: rotate(45deg);
  }
}
</style>

<template>
  <div class="containerr">
    <div class="flex justify-between">
      <MonthHero />
      <!-- <ClientOnly>
        <LayoutToggles />
      </ClientOnly> -->
    </div>

    <!-- <client-only>
      <top-summary :transactions="passed" />
    </client-only> -->
    <hr class="mb-3" />
    <div class="flex gap-2 flex-wrap">
      <HomeCarousel
        v-model:tabindex="carouselTabindex"
        v-model:category="filterCategoryId"
        :expenses="expenseCategories"
        :incomes="incomeCategories"
        :expand-graph="!isCurrentMonth"
        class="flex-[4] min-w-sm"
      >
        <template #header-right>
          <ui-button
            v-if="hasVisibleCategories"
            link
            flat
            icon="i-ic-round-format-list-bulleted"
            iconSize="1rem"
            @click="legendModalOpen = true"
          >
            Breakdown
          </ui-button>
        </template>
        <div
          v-if="isCurrentMonth"
          class="text-center font-thin uppercase flex flex-col justify-center items-center"
        >
          <h4 class="text-gray-5">{{ $t("balance") }}</h4>
          <ui-price :amount="balance" :currency="currency" size="2.5rem" />
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
      </HomeCarousel>
      <div
        class="flex flex-col flex-1 gap-2 min-w-xs"
        v-if="isCurrentMonth && !transactionsLoading"
      >
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

    <ui-empty
      v-if="transactionsLoading"
      title=""
      loading
      class="card min-h-sm"
    />
    <div v-else>
      <div v-if="importantTransactions.length > 0" class="flex mb-2">
        <div
          class="border-r-amber border-r-4 border-r-solid mr-2 pos-relative"
        ></div>
        <div class="flex-1 flex-col gap2">
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

      <WidgetUpcomming
        v-if="isCurrentMonth && currentMonth.length > 0"
        v-model:show="showUpcomming"
        :upcomming="upcomming"
        :currency="currency"
        class="mb-2"
      />

      <transition name="page">
        <section v-if="showUpcomming || filterCategoryId > 0">
          <TransactionRow
            v-for="transaction in upcomming"
            :key="transaction.id"
            :transaction="transaction"
            :transparent="true"
            class="upcomming"
            @patched="updateTransaction"
            @delete="deleteTransaction"
          />
        </section>
      </transition>
      <section class="flex-col gap-2">
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

    <client-only>
      <teleport to="body">
        <ui-modal v-model="legendModalOpen">
          <card-categories
            :items="currentCategories"
            v-model:selected-category-id="filterCategoryId"
            class="min-w-sm"
          />
        </ui-modal>
      </teleport>
    </client-only>
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

definePageMeta({
  layout: "noheader",
});

const { isCurrent: isCurrentMonth, month, dateFormatted } = useCurrentMonth();

const tokenStore = useTokenStore();
const { token } = storeToRefs(tokenStore);

const search = ref("");

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
const legendModalOpen = ref(false);

const filterCategoryId = ref<number>(-1);

const notifications = useNotifications();

const carouselTabindex = ref(2);
const incomesDisplayed = computed(() => carouselTabindex.value === 1);
const currentCategories = computed(() =>
  incomesDisplayed.value ? incomeCategories.value : expenseCategories.value,
);
const hasVisibleCategories = computed(
  () => currentCategories.value.filter((it) => it.sum > 0).length > 0,
);

watch(filterCategoryId, (categoryId) => {
  if (categoryId >= 0) {
    legendModalOpen.value = false;
  }
});

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
      (trans: Transaction) => trans.category.id === filterCategoryId.value,
    );
  }

  return tmp;
});

const incomeTransactions = computed(() =>
  transactions.value.filter(
    (tr: Transaction) => !tr.target.isOut && tr.source.isOut,
  ),
);
const expenseTransactions = computed(() =>
  transactions.value.filter(
    (tr: Transaction) => tr.target.isOut && !tr.source.isOut,
  ),
);

const income = computed(() =>
  incomeTransactions.value
    .map((tr: Transaction) => tr.amount)
    .reduce((a: number, b: number) => a + b, 0),
);
const expense = computed(() =>
  expenseTransactions.value
    .map((tr: Transaction) => tr.amount)
    .reduce((a: number, b: number) => a + b, 0),
);

const importantTransactions = computed(() => {
  return currentMonth.value.filter((t) => t.isImportant && !t.confirmed);
});

const { t } = useI18n();
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
        (t: Transaction) => t.id != transactionData.id,
      );
    })
    .finally(() => (loading.value = false));
};

const updateTransaction = (transaction: Transaction) => {
  for (let index = 0; index < currentMonth.value.length; index++) {
    const element = currentMonth.value[index];
    if (!element) {
      return;
    }
    if (element.id === transaction.id)
      if (element.id === transaction.id) {
        currentMonth.value[index] = transaction;
        transactionStore.fetchTransactions();
        // transactionStore.fetchgetTransactions();
      }
  }
};
</script>

<style scoped lang="scss">
.containerr {
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

  &.active {
    transform: rotate(45deg);
  }
}
</style>

<template>
  <div class="container">
    <MonthHero :date="date" @reload="monthReloaded"/>
    <div>
      <top-summary :expense="expense" :income="income"/>

      <HomeCarousel
        :expenses="expenseCategories"
        :incomes="incomeCategories"
        :sources="incomeSources"
        :targets="expenseSources"
        @filter="tagId => filterTagId = tagId"
      />

      <hr>

      <BalanceRow :sources="incomeSources" class="card" />

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

const sourcesStore = useSourcesStore();
const { allSources, incomeSources, expenseSources } = storeToRefs(sourcesStore);

const categoriesStore = useCategoriesStore();
const { incomeCategories, expenseCategories } = storeToRefs(categoriesStore);

// const categories = ref<Prisma.Tag[]>([]);
const putLoading = ref(false);
// const currentMonth = ref<Prisma.Transaction[]>([]);
const showUpcomming = ref(false);
const showHidden = ref(false);
const date = ref(new Date());

const addTransaction = ref(false);
const filterTagId = ref<number>(-1);
// const allSources = ref<Source[]>([]);
// const sources = ref<Source[]>([]);
// const targets = ref<Source[]>([]);
const incomes =ref([]);

const router = useRouter();
const { yearPath, monthPath } = useRoute().query

month.value = parseInt(monthPath as string);
year.value = parseInt(yearPath as string);

// const year = ref(yearPath);
// const month = ref(monthPath);


// const auth0 = useAuth0();

onMounted(() => {
  transactionStore.fetchTransactions();
  sourcesStore.fetchAllSources();
  categoriesStore.fetchCategories();
})


// const currency = computed(() => {
//   return "Kč";
// })
// //todo: remove
// provide("currency", "Kč");


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

// const balances = computed(() => {
//     const sources = allSources.value
//       .filter(s => !s.isOut)
//       .filter(s => s.isDisponible)
//       .map(s => {
//         const source = { ...s };
//         if (source.states.length === 0) {  // user inputs a balance manually (=state) to correct any mistakes
//           source.balance = undefined;  // can't calculate actual balance without the user's correction
//         } else {
//           const last_entry = source.states[source.states.length - 1];
//           let current_balance = last_entry.amount;
          
//           const applicableTransactions = currentMonth.value.filter(trans => new Date(trans.created) <= new Date());
//           const out_ = applicableTransactions
//             .filter(trans => new Date(trans.created) > new Date(last_entry.created))
//             .filter(trans => trans.sourceId === source.id);
//           const in_ = applicableTransactions
//             .filter(t => new Date(t.created) > new Date(last_entry.created))
//             .filter(t => t.targetId === source.id);
          
//           in_.forEach(trans => current_balance += trans.amount);
//           out_.forEach(trans => current_balance -= trans.amount);
//           source.balance = current_balance;
//         }
//         return source;
//       })
//     return sources;
// });

// const auth = computed(() => {
//   if (auth0) {
//     console.info("hey!")
//     auth0.getAccessTokenSilently()
//     .then(tok => {
//       console.info(`got token: ${tok}`)
//       token.value = tok
//     }).catch(err => {
//       console.error(err)
//     })
//     return auth0;
//   }
// })


// const login = () => {
//   auth0.loginWithRedirect();
// };

const initialFetch = () => {
  // Fetch all the required data on startup - only after session validation
  transactionStore.fetchTransactions();
  sourcesStore.fetchAllSources();
  // getTransactions();
  // getTags();
  // getSources();
};

// const getTransactions = () => {
//   loading.value = true;
//   let url;
//   if (year.value && month.value) {
//     date.value = new Date(`${year.value}-${month.value}`);
//     url = `/api/transactions/?year=${year.value}&month=${month.value}`
//   } else {
//     url = '/api/transactions'
//   }
  
//   $fetch(
//     url,
//     {
//       method: 'GET',
//       headers: {
//         Authorization: 'Bearer ' + token.value
//       }
//     })
//     .then(res => {
//       currentMonth.value = res.data.filter(trans => {
//         return trans.target.isDisponible || trans.source.isDisponible
//       })
//     })
//     .finally(() => {
//       categories.value = remapCategories();
//       sources.value = remapSources();
//       targets.value = remapTargets();
//       incomes.value = remapCategories(true);
//       loading.value = false;
//     })
// };

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

// const remapCategories = (incomeOnly=false) => {
//   const tagsTmp: any = {}
//   transactions.value.forEach(trans => {
//     if(trans.confirmed) {
//       if (trans.tags && trans.tags.length > 0 && ((!incomeOnly && trans.target.isOut) || (incomeOnly && !trans.target.isOut))) {
//         trans.tags.forEach(tag => {
//           if (!tagsTmp[tag.id]) {
//             tagsTmp[tag.id] = {...tag}
//             tagsTmp[tag.id].transactions = [trans];
//         } else {
//           tagsTmp[tag.id].transactions.push(trans)
//         }
//       })
//       }
//     }
//   });

//   const tags = Object.values(tagsTmp)
//   tags.forEach(tag => {
//     let sum = 0;
//     tag.transactions.forEach(trans => { sum += trans.amount; })
//     tag.sum = sum;
//   });
//   tags.sort((a, b) => { return b.sum - a.sum; });
//   return tags;
// };

// const remapSources = () => {
//   const sourcesTmp = {}
//   currentMonth.value.forEach(trans => {
//       if (trans.source) {
//         if (sourcesTmp[trans.sourceId]) {
//           sourcesTmp[trans.sourceId].transactions.push(trans);
//         } else {
//           sourcesTmp[trans.sourceId] = {...trans.source};
//           sourcesTmp[trans.sourceId].transactions = [trans];
//         }
//       }
//   });

//   const sources = Object.values(sourcesTmp);
//   sources.forEach(source => {
//     let sum = 0;
//     source.transactions.forEach(trans => { sum += trans.amount; })
//     source.sum = sum;
//   });
//   sources.sort((a, b) => { return b.sum - a.sum; });
//   return sources;
// };
// const remapTargets = () => {
//     const targetsTmp: any = {}
//     currentMonth.value.forEach(trans => {
//         if (trans.target) {
//           if (targetsTmp[trans.targetId]) {
//             targetsTmp[trans.targetId].transactions.push(trans);
//           } else {
//             targetsTmp[trans.targetId] = {...trans.target};
//             targetsTmp[trans.targetId].transactions = [trans];
//           }
//         }
//     });

//     const targets = Object.values(targetsTmp);
//     targets.forEach(target => {
//       let sum = 0;
//       target.transactions.forEach(trans => { sum += trans.amount; })
//       target.sum = sum;
//     });
//     targets.sort((a, b) => { return b.sum - a.sum; });
//     return targets
// };

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

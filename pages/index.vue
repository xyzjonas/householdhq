<template>
  <div class="container">
    {{ token }}
    <MonthHero :date="date" @reload="monthReloaded"/>
    <div>

      <TopSummary :expense="expense" :income="income"/>

      <HomeCarousel
        :tags="categories"
        :incomes="incomes"
        :sources="sources"
        :targets="targets"
        @filter="tagId => filterTagId = tagId"
      />

      <hr>

      <BalanceRow :sources="balances" class="card" />

      <!-- ADD NEW TRANSACTION -->
      <section id="add-t-button" class="row-simple py">
        <button @click="addTransaction = !addTransaction" class="item button">
          <i v-if="!addTransaction" class="fa-solid fa-coins" style="margin-right: 0.8em;"></i>
          <span>{{ addTransaction ? $t('cancel') : $t('t_add') }}</span>
        </button>
      </section>
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
          class="tag ml"
        >
          <Price class="tag" :amount="remainingBills" :currency="currency"/>
        </button>
        <button @click="showHidden = !showHidden" style="margin-left: auto;"><i class="fa-solid fa-eye-slash"></i></button>
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
import { Source, Tag } from '@/stores/types';
import { useTransactionStore } from '@/stores/transactions';

const tokenStore = useTokenStore();
const { token } = storeToRefs(tokenStore);


const transactionStore = useTransactionStore();
const { currentMonth, year, month } = storeToRefs(transactionStore);

const sourcesStore = useSourcesStore();
const { allSources, sources, targets } = storeToRefs(sourcesStore);

// const categoriesStore = useCategoriesStore();
// const { categories } = storeToRefs(categoriesStore);

const categories = ref<Prisma.Tag[]>([]);
const loading = ref(true);
const authError = ref(null);
const putLoading = ref(false);
const deleteLoading = ref(false);
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
  console.info("Querying token...")
  transactionStore.fetchTransactions();
  sourcesStore.fetchAllSources();
  // const x = auth0.checkSession();
  // x.then(y => console.info(y));
  // auth0.getAccessTokenSilently()
  // .then(tok => {
  //   console.info("Got token.")
  //   token.value = tok;
  //   console.log(tok);
  //   transactionStore.fetchTransactions();
  //   initialFetch();
  // })
  // .catch(err => {
  //   console.error(err);
  //   router.push("/login");
  // })
})


const currency = computed(() => {
  // if (currentMonth.value && currentMonth.value.length > 0) {
  //   const curr = currentMonth.value[0].currency;
  //   return curr;
  // } else {
  //   return "NaN"
  // }
  return "Kč";
})
//todo: remove
provide("currency", "Kč");


const transactions = computed(() => {
  const tmp = currentMonth.value.filter(trans => new Date(trans.created) <= new Date())
  if (showHidden.value) {
    return tmp;
  }
  return tmp
    .filter(trans => isTransactionTagged(trans, filterTagId.value))
    .filter(trans => !(!trans.source.isOut && !trans.target.isOut));
});

const incomeTransactions = computed(() => {
  return transactions.value.filter(trans => {
    return !allSources.value.find(src => src.id === trans.targetId).isOut || false;
  })
})

const expenseTransactions = computed(() => {
  return transactions.value.filter(trans => {
    return allSources.value.find(src => src.id === trans.targetId)?.isOut;
  })
})

const income = computed(() => {
  if (incomeTransactions.value?.length > 0) {
    return incomeTransactions.value.map(t => t.amount).reduce((a, b) => a + b);
  } 
  return 0;
})

const expense = computed(() => {
  if (expenseTransactions.value?.length > 0) {
    return expenseTransactions.value.map(t => t.amount).reduce((a, b) => a + b);
  } 
  return 0;
})


const upcommingTransactions = computed(() => {
      const tmp = currentMonth.value
        .filter(trans => new Date(trans.created) > new Date())
      if (showHidden.value) {
        return tmp;
      }
      return tmp
        .filter(trans => isTransactionTagged(trans, filterTagId.value));
});

const remainingBills = computed(() => {
  let sum = 0;
  upcommingTransactions.value.forEach(t => {
    if (!t.source.isOut) {
      sum += t.amount;
    }
  })
  return sum;
});

const balances = computed(() => {
    const sources = allSources.value
      .filter(s => !s.isOut)
      .filter(s => s.isDisponible)
      .map(s => {
        const source = { ...s };
        if (source.states.length === 0) {  // user inputs a balance manually (=state) to correct any mistakes
          source.balance = undefined;  // can't calculate actual balance without the user's correction
        } else {
          const last_entry = source.states[source.states.length - 1];
          let current_balance = last_entry.amount;
          
          const applicableTransactions = currentMonth.value.filter(trans => new Date(trans.created) <= new Date());
          const out_ = applicableTransactions
            .filter(trans => new Date(trans.created) > new Date(last_entry.created))
            .filter(trans => trans.sourceId === source.id);
          const in_ = applicableTransactions
            .filter(t => new Date(t.created) > new Date(last_entry.created))
            .filter(t => t.targetId === source.id);
          
          in_.forEach(trans => current_balance += trans.amount);
          out_.forEach(trans => current_balance -= trans.amount);
          source.balance = current_balance;
        }
        return source;
      })
    return sources;
});

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


const login = () => {
  auth0.loginWithRedirect();
};

const initialFetch = () => {
  // Fetch all the required data on startup - only after session validation
  getTransactions();
  // getTags();
  getSources();
};

const getTransactions = () => {
  loading.value = true;
  let url;
  if (year.value && month.value) {
    date.value = new Date(`${year.value}-${month.value}`);
    url = `/api/transactions/?year=${year.value}&month=${month.value}`
  } else {
    url = '/api/transactions'
  }
  
  $fetch(
    url,
    {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token.value
      }
    })
    .then(res => {
      currentMonth.value = res.data.filter(trans => {
        return trans.target.isDisponible || trans.source.isDisponible
      })
    })
    .finally(() => {
      categories.value = remapCategories();
      sources.value = remapSources();
      targets.value = remapTargets();
      incomes.value = remapCategories(true);
      loading.value = false;
    })
};

const putTransaction = (transactionData) => {
  putLoading.value = true;
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
    .finally(() => { addTransaction.value = false; putLoading.value = false })
};
    
const deleteTransaction = (transactionData) => {
  const url = "/api/transactions";
  $fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + token.value
    },
    body: transactionData})
    .then(res => {
      currentMonth.value = currentMonth.value.filter(t => t.id != transactionData.id);
    })
}

// const getTags = () => {
//   const url = '/api/tags'
//   $fetch(url, {
//     method: 'GET',
//     headers: {
//       Authorization: 'Bearer ' + token.value
//     }
//   })
//     .then(res => allTags.value = res.data)
// };

const getSources = () => {
  const url = '/api/sources'
  $fetch(url, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token.value
    }
  })
    .then(res => {
      allSources.value = res.data;
  })
};

const updateTransaction = (transaction) => {
  for (let index = 0; index < currentMonth.value.length; index++) {
    const element = currentMonth.value[index]; if (element.id === transaction.id)
    if (element.id === transaction.id) {
      currentMonth.value[index] = transaction;
      getTransactions();
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

const monthReloaded = (options) => {
  year.value = options.year;
  month.value = options.month;
  initialFetch();
}

</script>

<style scoped lang="scss">
#add-t-button, #remaining-bills {
  margin-top: 2em;
}

h3 {
  text-transform: uppercase;
}
.button {
  min-height: 60px;
}
</style>

<script lang="ts">
import {
  TransactionRow, HomeCarousel, TagSummary,
  MonthHero, BarGraph, MosaicLoader, TransactionForm,
  Spinner, BalanceRow, RadialGraph
} from '#components';


export default {

  components: {
    TransactionRow, HomeCarousel, TagSummary,
    MonthHero, BarGraph, MosaicLoader,
    TransactionForm, Spinner, BalanceRow, RadialGraph,
  },

  data() {
    return {
      tags: [],
      loading: false,
      putLoading: false,
      deleteLoading: false,
      allTransactions: [],
      showUpcomming: false,
      date: new Date(),

      addTransaction: false,
      allTags: [],
      filterTag: -1,
      allSources: [],
      sources: [],
      targets: [],
      incomes: [],
      
      token: "",
    }
  },

  async setup() {
    const route = useRoute();
    const year = route.query.year
    const month = route.query.month
    
    // definePageMeta({
    //   middleware: ["auth"]
    // })

    return { year, month }
  },

  // created() {
  //   // useAuth0().getAccessTokenSilently()
    
  // },
  mounted() {
    this.$auth0.getAccessTokenSilently().then(tok => this.token = tok)
  },

  provide() {
    return {
      currency: computed(() => this.currency),
    }
  },

  computed: {
    transactions() {
      const now = new Date();
      return this.allTransactions
        .filter(trans => new Date(trans.created) <= now)
        .filter(trans => this.isTransactionTagged(trans, this.filterTag));
    },
    upcommingTransactions() {
      const now = new Date();
      return this.allTransactions
        .filter(trans => new Date(trans.created) > now)
        .filter(trans => this.isTransactionTagged(trans, this.filterTag));
    },
    remainingBills() {
      let sum = 0;
      this.upcommingTransactions.forEach(t => {
        if (!t.source.isOut) {
          sum += t.amount;
        }
      })
      return sum;
    },
    currency() {
      if (this.allTransactions && this.allTransactions.length > 0) {
        const curr = this.allTransactions[0].currency;
        return curr;
      }
    },
    balances() {
      const sources = this.allSources
        .filter(s => !s.isOut)
        .map(s => {
          const source = { ...s };
          if (source.states.length === 0) {
            source.balance = undefined;
          } else {
            const last_entry = source.states[source.states.length - 1];
            let last_balance = last_entry.amount;
            console.info(`Last bal: ${last_entry}`)
            console.info(`${this.transactions.length} transactions`);
            const out_ = this.transactions
              .filter(t => new Date(t.created) > new Date(last_entry.created))
              .filter(t => t.sourceId === source.id);
            const in_ = this.transactions
              .filter(t => new Date(t.created) > new Date(last_entry.created))
              .filter(t => t.targetId === source.id);
            console.info(`states: ${source.states.length}`)
            
            in_.forEach(t => last_balance += t.amount);
            out_.forEach(t => last_balance -= t.amount);
            source.balance = last_balance;
          }
          return source;
        })
      return sources;
    },
    auth() {
      if (this.$auth0) {
        console.info("hey!")
        this.$auth0.getAccessTokenSilently()
        .then(tok => {
          console.info(`got token: ${tok}`)
          this.token = tok
        }).catch(err => {
          console.error(err)
        })
        return this.$auth0;
      }
    }
   
  },

  watch: {
    token(newValue) {
      console.info("watched token")
      if (newValue) {
        this.initialFetch();
      }
    }
  },

  methods: {

    login() {
      this.$auth0.loginWithRedirect();
    },

    initialFetch() {
      // Fetch all the required data on startup - only after session validation
      this.getTransactions(true);
      this.getTags();
      this.getSources();
    },

    getTransactions(loading=false) {
      if (loading) {
        this.loading = true;
      }
      let url;
      if (this.year && this.month) {
        this.date = new Date(`${this.year}-${this.month}`);
        url = `/api/transactions/?year=${this.year}&month=${this.month}`
      } else {
        url = '/api/transactions'
      }
      
      $fetch(
        url,
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + this.token
          }
        })
        .then(res => this.allTransactions = res.data)
        .finally(() => {
          this.tags = this.remapTags();
          this.sources = this.remapSources();
          this.targets = this.remapTargets();
          this.incomes = this.remapTags(true);
          this.loading = false;
        })
    },
    putTransaction(transactionData) {
      this.putLoading = true;
      const url = "/api/transactions";
      $fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer ' + this.token
        },
        body: transactionData})
        .then(res =>
          this.allTransactions.unshift(res.data)
        )
        .finally(() => { this.addTransaction = false; this.putLoading = false })
    },
    
    deleteTransaction(transactionData) {
      const url = "/api/transactions";
      $fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + this.token
        },
        body: transactionData})
        .then(res => {
          this.allTransactions = this.allTransactions.filter(t => t.id != transactionData.id);
        })
    },
    getTags() {
      const url = '/api/tags'
      $fetch(url, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + this.token
        }
      })
        .then(res => this.allTags = res.data)
    },
    getSources() {
      const url = '/api/sources'
      $fetch(url, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + this.token
        }
      })
        .then(res => {
          this.allSources = res.data;
    })
    },
    updateTransaction(transaction) {
      for (let index = 0; index < this.allTransactions.length; index++) {
        const element = this.allTransactions[index];if (element.id === transaction.id)
        if (element.id === transaction.id) {
          this.allTransactions[index] = transaction;
          this.getTransactions();
        }
      }
    },
    mapTransactionDeclention(count) {
      if (count === 1) {
        return this.$t('t_upcomming_1')
      } else if (count > 1 && count < 5) {
        return this.$t('t_upcomming_2')
      } else {
        return this.$t('t_upcomming_5')
      }
    },
    isTransactionTagged(transaction, tagId) {
      if (tagId < 0) {
        // dont filter
        return true;
      }
      return transaction.tags.filter(t => t.id === tagId).length > 0;
    },
    remapTags(incomeOnly=false) {
      const tagsTmp: any = {}
      this.transactions.forEach(trans => {
        if(trans.confirmed) {
          if (trans.tags && trans.tags.length > 0 && ((!incomeOnly && trans.target.isOut) || (incomeOnly && !trans.target.isOut))) {
            trans.tags.forEach(tag => {
              if (!tagsTmp[tag.id]) {
                tagsTmp[tag.id] = {...tag}
                tagsTmp[tag.id].transactions = [trans];
            } else {
              tagsTmp[tag.id].transactions.push(trans)
            }
          })
          }
        }
      });

      const tags = Object.values(tagsTmp)
      tags.forEach(tag => {
        let sum = 0;
        tag.transactions.forEach(trans => { sum += trans.amount; })
        tag.sum = sum;
      });
      tags.sort((a, b) => { return b.sum - a.sum; });
      return tags;
    },
    remapSources() {
      const sourcesTmp: any = {}
      this.allTransactions.forEach(trans => {
          if (trans.source) {
            if (sourcesTmp[trans.sourceId]) {
              sourcesTmp[trans.sourceId].transactions.push(trans);
            } else {
              sourcesTmp[trans.sourceId] = {...trans.source};
              sourcesTmp[trans.sourceId].transactions = [trans];
            }
          }
      });

      const sources = Object.values(sourcesTmp);
      sources.forEach(source => {
        let sum = 0;
        source.transactions.forEach(trans => { sum += trans.amount; })
        source.sum = sum;
      });
      sources.sort((a, b) => { return b.sum - a.sum; });
      return sources;
  },
  remapTargets() {
      const targetsTmp: any = {}
      this.allTransactions.forEach(trans => {
          if (trans.target) {
            if (targetsTmp[trans.targetId]) {
              targetsTmp[trans.targetId].transactions.push(trans);
            } else {
              targetsTmp[trans.targetId] = {...trans.target};
              targetsTmp[trans.targetId].transactions = [trans];
            }
          }
      });

      const targets = Object.values(targetsTmp);
      targets.forEach(target => {
        let sum = 0;
        target.transactions.forEach(trans => { sum += trans.amount; })
        target.sum = sum;
      });
      targets.sort((a, b) => { return b.sum - a.sum; });
      return targets;
  },
  },
}
</script>


<template>
  <div class="container">
    <MonthHero :date="date"/>
    <section v-if="loading" class="center">
      <MosaicLoader />
    </section>
    <div v-else>
      <HomeCarousel
        :tags="tags"
        :incomes="incomes"
        :sources="sources"
        :targets="targets"
        @filter="tagId => filterTag = tagId"
      />
      <hr>
      <button @click="login">LOG IN</button>
      <section>
        <h3 class="mb">{{ $t('balance') }}</h3>
        <BalanceRow :sources="balances" />
      </section>

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

      <h4 id="remaining-bills" class="title row-simple">
        <span>{{ upcommingTransactions.length }} {{ mapTransactionDeclention(upcommingTransactions.length) }}</span>
        <button 
          @click="showUpcomming = !showUpcomming"
          class="tag ml"
        >
          <Price class="tag" :amount="remainingBills" :currency="currency"/>
        </button>
      </h4>

      <transition name="page">
      <section v-if="showUpcomming || filterTag > 0">
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

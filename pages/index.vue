<script lang="ts">
import { TransactionRow, TagSummary, MonthHero, BarGraph, MosaicLoader, TransactionForm, Spinner } from '#components';


export default {


  components: { TransactionRow, TagSummary, MonthHero, BarGraph, MosaicLoader, TransactionForm, Spinner },

  data() {
    return {
      loading: false,
      putLoading: false,
      deleteLoading: false,
      allTransactions: [],
      showUpcomming: false,
      date: new Date(),
      cells: 4,
      addTransaction: false,
      allTags: [],
      filterTag: -1,
      allSources: [],
    }
  },

  provide() {
    return {
      currency: computed(() => this.currency),
      allTags: computed(() => this.allTags),
      allSources: computed(() => this.allSources),
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
        sum += t.amount;
      })
      return sum;
    },
    currency() {
      if (this.allTransactions && this.allTransactions.length > 0) {
        return this.allTransactions[0].currency;
      }
    },
    tags() {
      const tagsTmp: any = {}
      this.transactions.forEach(trans => {
        if(trans.confirmed) {
          if (trans.tags && trans.tags.length > 0) {
            trans.tags.forEach(tag => {
              if (!tagsTmp[tag.id]) {
                tagsTmp[tag.id] = {
                  tag: tag,
                  transactions: [trans]
                }
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
      tags.sort((a, b) => {
        return b.sum - a.sum;
      });
      return tags;
    }
  },

  methods: {
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
      $fetch(url, {method: 'GET'})
        .then(res => this.allTransactions = res.data)
        .finally(() => this.loading = false)
    },
    putTransaction(transactionData) {
      this.putLoading = true;
      const url = "/api/transactions";
      $fetch(url, {method: 'PUT', body: transactionData})
        .then(res =>
          this.allTransactions.unshift(res.data)
        )
        .finally(() => { this.addTransaction = false; this.putLoading = false })
    },
    
    deleteTransaction(transactionData) {
      const url = "/api/transactions";
      $fetch(url, {method: 'DELETE', body: transactionData})
        .then(res => {
          this.allTransactions = this.allTransactions.filter(t => t.id != transactionData.id);
        })
    },
    getTags() {
      const url = '/api/tags'
      $fetch(url, {method: 'GET'})
        .then(res => this.allTags = res.data)
    },
    getSources() {
      const url = '/api/sources'
      $fetch(url, {method: 'GET'})
        .then(res => this.allSources = res.data)
    },
    updateTransaction(transaction) {
      for (let index = 0; index < this.allTransactions.length; index++) {
        const element = this.allTransactions[index];if (element.id === transaction.id)
        if (element.id === transaction.id) {
          this.allTransactions[index] = transaction;
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
    }
  },
  setup() {
    const route = useRoute();
    const year = route.query.year
    const month = route.query.month
    return {
      year, month
    }
  },
  created() {
    this.getTransactions(true);
    this.getTags();
    this.getSources();
  }
}
</script>


<template>
  <div class="container">
    <MonthHero :date="date"/>
    <section v-if="loading" class="center">
      <MosaicLoader />
    </section>
    
    <div v-else>
      <section v-if="Object.keys(tags).length > 0">
        <BarGraph :tags="tags" @filter="tagId => filterTag = tagId"/>
      </section>
      
      <div :class="`collapsible-y ${filterTag < 0 ? '' : 'collapsed'}`">
        <section class="row-simple">
          <button @click="addTransaction = !addTransaction" class="item button">
            {{ addTransaction ? $t('cancel') : $t('t_add') }}
          </button>
        </section>
        <section style="padding-top: 0;">
          <TransactionForm
            :class="`collapsible-y ${addTransaction ? '': 'collapsed'}`"
            @cancel="addTransaction = false"
            @send="putTransaction"
            :processing="putLoading"
          />
        </section>

        <h4 class="title row-simple">
          <span>{{ $t('remaining_bills') }}: </span>
          <Price style="margin-left: 0.3em;" class="tag" :amount="remainingBills" :currency="currency"/>
          <button 
            @click="showUpcomming = !showUpcomming"
            class="tag"
            style="height: 2.8em; margin-left: 0.5em;"
          >{{ upcommingTransactions.length }} {{ mapTransactionDeclention(upcommingTransactions.length) }}</button>
        </h4>
      </div>

      <section>
          <div :class="`collapsible-y ${showUpcomming || filterTag > 0 ? '' : 'collapsed'}`">
          <TransactionRow
            v-for="transaction in upcommingTransactions"
            :key="transaction.id"
            :transaction="transaction"
            :transparent="true"
            class="upcomming"
            @patched="updateTransaction"
            @delete="deleteTransaction"
          />
          </div>
          <TransactionRow
            v-for="transaction in transactions"
            :key="transaction.id"
            :transaction="transaction"
            @patched="updateTransaction"
            @delete="deleteTransaction" />
      </section>

    </div>

  </div>
</template>
<style scoped lang="scss">
.button {
  min-height: 60px;
}
</style>

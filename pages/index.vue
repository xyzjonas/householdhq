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
      date: new Date(),
      cells: 4,
      addTransaction: false,
      allTags: [],
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
      return this.allTransactions.filter(trans => new Date(trans.created) <= now);
    },
    upcommingTransactions() {
      const now = new Date();
      return this.allTransactions.filter(trans => new Date(trans.created) > now);
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
        <BarGraph :tags="tags"/>
      </section>

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

      <section>
          <h4 class="title row-simple">
            {{ $t('remaining_bills') }}: <Price style="margin-left: 0.3em;" class="tag" :amount="remainingBills" :currency="currency"/>
          </h4>
          <div class="icon" alt="Discover Nuxt 3"></div>
          <TransactionRow
            v-for="transaction in upcommingTransactions"
            :key="transaction.id"
            :transaction="transaction"
            :transparent="true"
            class="upcomming"
            @patched="updateTransaction"
            @delete="deleteTransaction"
          />
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

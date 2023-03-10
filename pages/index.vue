<script lang="ts">
import { TransactionRow, TagSummary, MonthHero, BarGraph, MosaicLoader, TransactionForm } from '#components';
import tags from '~~/server/controllers/tags';


export default {


  components: { TransactionRow, TagSummary, MonthHero, BarGraph, MosaicLoader, TransactionForm },

  data() {
    return {
      loading: false,
      allTransactions: [],
      date: new Date(),
      cells: 4,
      addTransaction: false,
    }
  },

  provide() {
    return {
      currency: computed(() => this.currency)
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
        tag.transactions.forEach(trans => {
          sum += trans.amount;
        })
        console.info(sum)
        tag.sum = sum;
      });

      tags.sort((a, b) => {
        return b.sum - a.sum;
      });


      return tags;
    }
  },

  methods: {
    putTransaction(transactionData) {
      const url = "/api/transactions";
      $fetch(url, {method: 'PUT', body: transactionData})
        .then(res =>
          this.allTransactions.unshift(res.data)
        )
        .finally(() => this.addTransaction = false)
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
    this.loading = true;
    let url
    if (this.year && this.month) {
      this.date = new Date(`${this.year}-${this.month}`);
      url = `/api/transactions/?year=${this.year}&month=${this.month}`
    } else {
      url = '/api/transactions'
    }
    $fetch(url, {method: 'GET'})
      .then(res => this.allTransactions = res.data)
      .finally(() => this.loading = false)

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

      <section v-if="!addTransaction" class="row-simple">
        <button @click="addTransaction = !addTransaction" class="item button">{{ $t('t_add') }}</button>
      </section>
      <section v-else>
        <TransactionForm :tags="tags" @cancel="addTransaction = false" @send="putTransaction"/>
      </section>

      <section>
          <h4 class="title row-simple">
            {{ $t('remaining_bills') }}: <Price style="margin-left: 0.3em;" class="tag" :amount="remainingBills" :currency="currency"/>
          </h4>
          <div class="icon" alt="Discover Nuxt 3"></div>
          <TransactionRow v-for="transaction in upcommingTransactions" :transaction="transaction" class="upcomming" />
          <div class="space"></div>
          <TransactionRow v-for="transaction in transactions" :transaction="transaction" />
      </section>

    </div>

  </div>
</template>
<style scoped lang="scss">
.upcomming {
  filter: opacity(0.3);
}
.button {
  min-height: 60px;
}
</style>

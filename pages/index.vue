<script lang="ts">
import { TransactionRow, TagSummary, MonthHero, BarGraph, MosaicLoader } from '#components';
import tags from '~~/server/controllers/tags';


export default {


  components: { TransactionRow, TagSummary, MonthHero, BarGraph, MosaicLoader },

  data() {
    return {
      loading: false,
      allTransactions: [],
      date: new Date(),
      cells: 4,
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
    tags() {
      const tagsTmp: any = {}
      this.transactions.forEach(trans => {
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

      <!-- <section class="row-simple">
        <button class="item button">{{ $t('message') }}: {{ remainingBills }}</button>
        <button class="item button">{{ $t('message') }}: {{ remainingBills }}</button>
      </section> -->

      <section>
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
  margin: 0.6em;
}
</style>

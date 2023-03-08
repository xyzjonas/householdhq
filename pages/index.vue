<script lang="ts">
import { TransactionRow, TagSummary, MonthHero } from '#components';
import tags from '~~/server/controllers/tags';


export default {


  components: { TransactionRow, TagSummary, MonthHero },

  data() {
    return {
      loading: false,
      allTransactions: [],
      date: new Date(),
      watchedTags: [
        1
      ]
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
    tags() {
      const tags = {}
      this.transactions.forEach(trans => {
        trans.tags.forEach(tag => {
          if (!tags[tag.id]) {
          tags[tag.id] = {
            tag: tag,
            transactions: [trans]
          }
        } else {
          tags[tag.id].transactions.push(trans)
        }  
        })
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

    <section class="grid">
      <TagSummary v-for="tag in tags" :tagInfo="tag" class="grid-item" />
    </section>

    <div class="space"></div>

    <button class="button">{{ $t('message') }}</button>
    

    <div v-if="loading" class="center">
      <span><i class="icss-spinner icss-pulse x5" style="color: #cccccc55;"></i></span>
    </div>


    <section v-else>
        <div class="icon" alt="Discover Nuxt 3"></div>
        <TransactionRow v-for="transaction in upcommingTransactions" :transaction="transaction" class="upcomming" />
        <div class="space"></div>
        <TransactionRow v-for="transaction in transactions" :transaction="transaction" />
    </section>

    </div>
</template>
<style scoped lang="scss">
.upcomming {
  filter: opacity(0.3);
}
</style>

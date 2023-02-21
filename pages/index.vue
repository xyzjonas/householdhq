<script lang="ts">
import { TransactionRow } from '#components';

export default {

  components: { TransactionRow },

  data() {
    return {
      loading: false,
      allTransactions: [],
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
    }
  },

  methods: {

  },

  created() {
    this.loading = true;
    $fetch('/api/transactions', {method: 'GET'})
      .then(res => this.allTransactions = res.data)
      .finally(() => this.loading = false)
  }
}
</script>


<template>
  <div>
    <div v-if="loading">LOADING</div>
    <section class="container" v-else>
        <div class="icon" alt="Discover Nuxt 3"></div>
        <TransactionRow v-for="transaction in upcommingTransactions" :transaction="transaction" />
        <hr>
        <TransactionRow v-for="transaction in transactions" :transaction="transaction" />
    </section>

    </div>
</template>

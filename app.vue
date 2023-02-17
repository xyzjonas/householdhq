<!-- <script setup>
  // const { data: transactions } = await useFetch('/api/transactions')
  const { pending, data: transactions } = useLazyFetch('/api/transactions')
</script> -->

<script>
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
  <NuxtLayout>
    <div v-if="loading">LOADING</div>
    <table v-else>
      <tr>
        <th>Datum</th>
        <th>Castka</th>
        <th>Popis</th>
      </tr>
      <TransactionRow v-for="transaction in transactions" :transaction="transaction" />
    </table>

  </NuxtLayout>
</template>

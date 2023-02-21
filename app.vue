<!-- <script setup>
  // const { data: transactions } = await useFetch('/api/transactions')
  const { pending, data: transactions } = useLazyFetch('/api/transactions')
</script> -->

<!-- <script>
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

  // created() {
  //   console.info(`On create: app.vue`)
  //   this.loading = true;
  //   $fetch('/api/transactions', {method: 'GET'})
  //     .then(res => this.allTransactions = res.data)
  //     .finally(() => this.loading = false)
  // }
}
</script> -->


<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

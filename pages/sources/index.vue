<template lang="">
    <div class="container">
        <div v-if="sources" v-for="source in sources.value.data">
            <component :is="SourceRow" :source="source"></component>
        </div>
    </div>
</template>
<script setup lang="ts">
// import { useAuth0 } from '@auth0/auth0-vue';

const SourceRow = resolveComponent('SourceRow')

// const auth0 = useAuth0();
// const token = await auth0.getAccessTokenSilently();

// useFetch()
const sources = ref();
useFetch(
    '/api/sources',
    {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + "token"
        },
}).then(res => sources.value = res.data)
</script>
<style lang="">
    
</style>
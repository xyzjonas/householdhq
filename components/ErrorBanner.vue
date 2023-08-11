<template lang="">
<div class="column">
    <h1>{{ status || 403 }}</h1>
    <span><i class="fa-solid fa-fingerprint"></i></span>
    <h2>{{ $t(message || 'access_denied') }}</h2>
    <a v-if="isLogin" @click="$emit('login')"><i class="fa-solid fa-unlock"></i>LOG IN</a>
</div>
</template>
<script setup lang="ts">
defineProps(["status", "message", "isLogin"])
</script>
<style scoped lang="scss">
h1 {
    font-size: 10em;
}
h2 {
    font-size: 4em;
    text-transform: uppercase;
    text-align: center;
    max-width: 300px;
}
.column {
    display: flex;
    flex-direction: column;
    align-items: center;
}
span {
    margin: 0;
    padding: 0;
    font-size: 3em;
}
button {
    height: 48px;
    margin-top: 1em;
}
a {
    margin-top: 3em;
    text-decoration: underline;
    cursor: pointer;
    transition: 0.2s color;

    &:hover {
        color: white;
    }

    i {
        margin-right: 0.5em;
    }
}
</style>
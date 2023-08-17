<template lang="">
<div class="column">
    <h1>{{ status || 403 }}</h1>
    <span><i class="fa-solid fa-fingerprint"></i></span>
    <h2>{{ $t(message || 'access_denied') }}</h2>
    <a v-if="isLogin" @click="$emit('login')"><i class="fa-solid fa-unlock"></i>LOG IN</a>
</div>
</template>
<script setup lang="ts">
const props = defineProps(["status", "message", "isLogin", "fontSize"])

const size = computed(() => {
    return props.fontSize ?? '2em';
})

const numbersSize = computed(() => {
    return `calc(2 * ${size.value})`;
})

</script>
<style scoped lang="scss">

h1 {
    font-size: v-bind("numbersSize");
}
h2 {
    font-size: v-bind("size");
    text-transform: uppercase;
    text-align: center;
    max-width: 300px;
}
.column {
    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 128px 32px;
    margin: 16px;
    border: 1px solid #eeeeee33;
    border-radius: 3px;
}
span {
    margin: 0;
    padding: 0;
    font-size: v-bind("size");
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
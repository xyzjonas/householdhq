<template lang="">
<div class="column">
    <span><i class="fa-solid fa-user-lock"></i></span>
    <h1>{{ $t('access_denied') }}</h1>
    <button @click="$emit('login')">{{ $t('log_in') }}</button>
</div>
</template>
<style scoped lang="scss">
.column {
    display: flex;
    flex-direction: column;
    align-items: center;
}
span {
    margin: 0;
    padding: 0;
    font-size: 5em;
}
button {
    width: 100%;
    height: 48px;
    margin-top: 1em;
}
</style>
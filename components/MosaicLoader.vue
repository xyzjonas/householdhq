<template>
<div>
<div class="mosaic-loader">
    <div v-for="i in 16" :key="i" :class="`cell d-${((i - 1) % 4) + Math.floor((i - 1) / 4)}`">
    </div>
</div>
<h1 style="text-align: center; margin-top: 5px;">{{ $t('loading') }}</h1>
</div>
</template>
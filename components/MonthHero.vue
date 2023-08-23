<template>
    <section class="title">
        <p>{{ formatMMYYYY }}</p>
        <!-- <a><i class="fa-solid fa-calendar"></i></a> -->
        <NuxtLink
            :to="`/?year=${prev.getFullYear()}&month=${prev.getMonth() + 1}`"
            @click="$emit('reload', prev)"
            class="left"
        >
            <i class="fa-solid fa-chevron-left"></i>
        </NuxtLink>
        <NuxtLink
            :to="`/?year=${next.getFullYear()}&month=${next.getMonth() + 1}`"
            @click="$emit('reload', next)"
            class="right"
        >
            <i class="fa-solid fa-chevron-right"></i>
        </NuxtLink>
    </section>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useTransactionStore } from '@/stores/transactions';


// const date = ref<Date>(new Date());

const route = useRoute();
const { month, year } = storeToRefs(useTransactionStore());

defineEmits(["reload"]);

const date = computed<Date>(() => {
    const now = new Date();
    if (year.value) {
        now.setFullYear(year.value);
    }
    if (month.value) {
        now.setMonth(month.value - 1);
    }
    return now;
});


const prev = computed<Date>(() => {
    // PREVIOUS month URL path
    const d = new Date(date.value);
    d.setMonth(d.getMonth() - 1);
    return d;
})

const next = computed<Date>(()=> {
    // NEXT month URL path
    const d = new Date(date.value);
    d.setMonth(d.getMonth() + 1);
    
    return d;
});

const i18n = useI18n();
const formatMMYYYY = computed(() => {
    const monthName = date.value.toLocaleDateString(i18n.locale, {month: "long"}).toUpperCase();
    return `${monthName} ${date.value.getFullYear()}`;
});
</script>
<style lang="scss" scoped>
.title {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1.5em;

    p {
        font-size: x-large;
        font-weight: 600;
    }

}



a {
    display: flex;
    align-items: center;
    font-size: large;
    color: var(--color-grey-light-1);
    transition-duration: 0.3s;
}

a:hover {
    transition-duration: 0.3s;
    transition: linear;
}

.left, .right {
    font-size: small;
    color: var(--color-primary-light-1);
}

.left {
    margin-left: auto;
}

.right {
    margin-right: 2em;
}

.left:hover {
    color: var(--color-font-light);
}

.right:hover {
    color: var(--color-font-light);
}

h1 {
    font-size: x-large;
    margin-left: 0.5em;
    margin-right: 0.5em;
    text-align: center;
}
section {
    padding-top: 2em;
    padding-bottom: 2em;
}
</style>
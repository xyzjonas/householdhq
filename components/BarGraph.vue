<template>
    <div class="center card">
        <ui-empty
            v-if="!areThereTransactions || loading"
            :loading="loading"
            icon="fa-solid fa-money-bill-trend-up"
            :title="$t('no_data')"
            :subtitle="$t('no_data_will_appear')"
        />
        <section v-else class="row ">
            <div v-if="!selectedCategory" class="graph-wrapper">
                <Doughnut :data="data" :options="options" />
            </div>
            <transition name="slide" mode="out-in">
            <div v-if="selectedCategory" class="details column-to-row">
                <div>
                    <h1 :style="`color: ${selectedCategory.color}`">{{ selectedCategory.name }}</h1>
                    <ui-price :amount="selectedCategory.sum" />
                </div>
                <div class="row mobile-text-center center">
                    <button class="button" @click="navigateTo(`/tags/${ selectedCategory.id }`)">
                        <i class="fa-solid fa-pen mr"></i>
                    </button>
                    <button class="button" @click="selectedCategoryName = ''">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
            </transition>
        </section>
    </div>
</template>
<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { storeToRefs } from 'pinia';
import { Tag, TagWithSum } from 'stores/types';
import { Doughnut } from 'vue-chartjs'

import { useTransactionStore } from '@/stores/transactions';
import { isMimeType } from 'class-validator';

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
    items: TagWithSum[]
}>();

const selectedCategoryName = ref<string>('');
const selectedCategory = computed(() => {
    return props.items.find(it => it.name && it.name === selectedCategoryName.value);
});


const { currency, loading } = storeToRefs(useTransactionStore());

const emit = defineEmits(["filter"]);
watch(selectedCategory, (value) => {
    emit('filter', value?.id ?? -1)
})

const showedItems = computed(() => {
    if (selectedCategoryName.value) {
        return props.items.filter(it => it.name === selectedCategoryName.value);
    }
    return props.items;
});

const areThereTransactions = computed(() => {
    return showedItems.value.map(cat => cat.transactions).flat().length > 0;
});

const data = computed(() => {
    return {
        labels: showedItems.value.map(it => it.name),
        datasets: [
            {
                data: showedItems.value.map(it => it.sum),
                backgroundColor: showedItems.value.map(it => it.color ?? 'white'),
                borderColor: showedItems.value.map(it => it.color ?? 'white'),
            }
        ],
        borderColor: "red",
        defaults: {
            borderColor: "red"
        }
    }
});


const callback = (e) => {
    // OnClick emit filter by category
    const label = e.chart.tooltip.title[0];
    if (selectedCategoryName === label) {
        selectedCategoryName.value = '';
    } else {
        selectedCategoryName.value = label;
    }
}

const options = {
    responsive: true,
    onClick: callback,
    layout: {
        padding: 0,
    },
    plugins: {
        legend: {
            display: false,
            position: "right",
            fullSize: false,
        }
    }
}


</script>
<style lang="scss" scoped>
@import '@/assets/css/base.scss';

.card {
    height: 360px;
    overflow: hidden;
}

.graph-wrapper {
    margin: 8px;
    transition: transform 1s ease-in-out;
    
    &-active {
        transform: translate(-160px);
    }
}

.details {
    gap: 32px;
    padding: 32px;
    text-align: center;
    // transform: translate(-100px);
    h1 {
        font-size: x-large;
        text-transform: uppercase;
        border-bottom: 1px solid var(--color-primary-light-1);
    }

    .row {
        white-space: nowrap;
        gap: 3px;
    }
}

button {
    width: 64px;
    height: 48px;
}

.row-to-column {
    align-items: center;
    justify-items: center;
    max-width: 100%;
    padding: 16px;
    gap: 32px;

    // chart renders from 0 size, let's constraint the parent div...
    min-height: 360px;
    @media only screen and (max-width: $bp-medium) {
        min-height: 320px;
    }
}

</style>
<template>
    <div class="center graph-card card">
        <ui-empty
            v-if="!areThereTransactions || loading"
            :loading="loading"
            icon="fa-solid fa-money-bill-trend-up"
            :title="$t('no_data')"
            :subtitle="$t('no_data_will_appear')"
        />
        <section v-else class="column">
            <Doughnut v-if="!selectedCategory" :data="data" :options="options"/>
            <Summary v-if="selectedCategory" :category="selectedCategory" />
            <!-- <div v-if="selectedCategory" class="title row" style="margin-top: 12px;">
                <ui-button
                    :outlined="true"
                    width="32px"
                    height="32px"
                    @click="navigateTo(`/tags/${ selectedCategory.id }`)"
                >6m</ui-button>
                <ui-button
                    :outlined="true"
                    width="32px"
                    height="32px"
                    @click="navigateTo(`/tags/${ selectedCategory.id }`)"
                >1yr</ui-button>
                <ui-button
                    :outlined="true"
                    width="32px"
                    height="32px"
                    @click="navigateTo(`/tags/${ selectedCategory.id }`)"
                >all</ui-button>
            </div> -->
            <div v-if="selectedCategory">
                <ui-price :amount="selectedCategory.sum" />
                <div class="row">
                    <h1 :style="`color: ${selectedCategory.color}`">{{ selectedCategory.name }}</h1>
                </div>
                <spinner v-if="summaryLoading" />
            </div>
            <div v-if="selectedCategory" class="row center">
                <ui-button
                    :outlined="true"
                    width="48px"
                    height="36px"
                    icon="fa-solid fa-pen mr"
                    @click="navigateTo(`/tags/${ selectedCategory.id }`)"
                />
                <ui-button
                    :outlined="true"
                    width="48px"
                    height="36px"
                    icon="fa-solid fa-xmark"
                    @click="selectedCategoryName = ''"
                />
            </div>
            
        </section>
    </div>
</template>
<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { storeToRefs } from 'pinia';
import { Tag, TagWithSum } from 'stores/types';
import { Doughnut } from 'vue-chartjs'

import { useTransactionStore } from '@/stores/transactions';
import { useCategoriesStore } from '@/stores/categories';

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
    items: TagWithSum[]
}>();

const selectedCategoryName = ref<string>('');
const selectedCategory = computed(() => {
    return props.items.find(it => it.name && it.name === selectedCategoryName.value);
});


const { summary, summaryLoading } = storeToRefs(useCategoriesStore());

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
.column {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 3px;
    width: 90%;
    height: 90%;

    text-align: center;

    h1 {
        font-size: large;
        text-transform: uppercase;
        border-bottom: 1px solid var(--color-primary-light-1);
    }

    .row {
        white-space: nowrap;
        gap: 8px;
    }
}
</style>
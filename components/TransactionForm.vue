<template>
    <div ref="focusDiv" :class="`frame ${noFrame ? 'background': ''}`">

        <transition name="slide" mode="out-in">
            <!-- ENTIRE FORM -->
            <div v-if="stage === 2" class="form">
                <div class="row" style="padding-top: 3px; padding-bottom: 3px">
                    <p>{{ $t('t_amount') }}</p>
                    <input v-model.number="transaction.amount"/>
                </div>
                <div class="row" style="padding-top: 3px; padding-bottom: 3px">
                    <p>{{ $t('t_date') }}</p>
                    <input v-model="date" type="date"/>
                </div>
                <div class="row" style="padding-top: 3px; padding-bottom: 3px">
                    <p>{{ $t('t_time') }}</p>
                    <input v-model="time" type="time"/>
                </div>
                <div class="row" style="padding-top: 3px; padding-bottom: 3px">
                    <p>{{ $t('t_desc') }}</p>
                    <textarea v-model="transaction.description" type="date" :placeholder="$t('t_placeholder')"></textarea>
                </div>
                <div class="row" style="padding-top: 3px; padding-bottom: 3px">
                    <p>{{ $t('t_from') }}</p>
                    <select v-model.number="transaction.sourceId">
                        <option
                            v-for="source in allSources"
                            :key="'option-source-' + source.id"
                            :value="source.id"
                        >{{ source.name }}</option>
                    </select>
                </div>
                <div class="row" style="padding-top: 3px; padding-bottom: 3px">
                    <p>{{ $t('t_to') }}</p>
                    <select v-model.number="transaction.targetId">
                        <option
                            v-for="source in allSources"
                            :key="'option-target-' + source.id"
                            :value="source.id"
                        >
                            {{ source.name }}
                        </option>
                    </select>
                </div>
                <div class="row" style="padding-top: 3px; padding-bottom: 3px">
                    <p>{{ $t('t_tag') }}</p>
                    <select v-model="transaction.tags">
                        <option 
                            v-for="tag in categories"
                            :key="tag.id + '-event'"
                            :value="tag.name"
                        >{{ tag.name }}</option>
                    </select>
                </div>
                <div class="row" style="padding-top: 3px; padding-bottom: 3px">
                    <p>{{ $t('recurring') }}</p>
                    <div class="slideOne" @click="isRecurring = !isRecurring">
                        <input v-model="isRecurring" type="checkbox" id="slideOne" name="check" disabled/>
                        <label for="slideOne"></label>
                    </div>
                    <input v-if="isRecurring" v-model="transaction.recurring" type="number">
                </div>
                <div class="space"></div>

                <div class="row">
                    <button @click="stage -= 1" style="margin-left: auto" class="button-sm ">{{ $t('back') }}</button>
                    <button @click="send" :class="`${error ? 'danger' : 'success'} button-sm`">
                        <span v-if="!processing">{{ $t('t_send') }}</span>
                        <Spinner v-else />
                    </button>
                </div>
            </div>
            <!-- CATEGORY SELECTION -->
            <div v-else-if="stage === 1" class="categories">
                <CategoryBadge v-for="tag in categories" :category="tag" @selected="categorySelected"/>
            </div>
            <!-- NUMPAD  -->
            <div v-else class="calculator">
                <Price :amount="transaction.amount" class="calculator-display" />
                <div class="calculator-numpad">
                    <button v-for="index in 9" @click="add(index)" style="width: 100%">{{ index }}</button>
                    <button @click="remove">DEL</button>
                    <button @click="add(0)">0</button>
                    <button @click="stage+=1">OK</button>
                </div>
                <div class="numpad">
                    
                </div>
            </div>
        </transition>
        <p class="error" style="text-align: right">{{ error }}</p>
    </div>
</template>
<script setup lang="ts">
import { Price, Icon, Spinner, CategoryBadge } from "#components";
import { storeToRefs } from "pinia";
import { useCategoriesStore } from "@/stores/categories";
import { useSourcesStore } from "@/stores/sources";
import { CreateUpdateTransaction, Transaction } from "stores/types";



const props =defineProps<{
    transactionIn: Transaction | undefined,
    processing: boolean,
    startStage: number,
    noFrame: boolean,
    error: string
}>();


    
const stage = ref(0);
const transaction = ref({
    created: undefined,
    amount: 0,
    description: undefined,
    sourceId: 1,
    targetId: 2,
    recurring: 0,
});
const date = ref<string>();
const time = ref<string>();

const boxColor = ref<string>();
const borderColor = ref<string>();

onMounted(() => {

    sourcesStore.fetchAllSources();
    categoriesStore.fetchCategories();

    date.value = formatDate(new Date());
    time.value = formatTime(new Date());
    // transaction.value = ;

    if (props.transactionIn) {
        transaction.value = { ...props.transactionIn };
        transaction.value.created = props.transactionIn.created;
        transaction.value.tags = props.transactionIn.tags.map(t => t.name).join(",");
        delete transaction.value.source; // discard prisma-included properties
        delete transaction.value.target; // discard prisma-included properties
        delete transaction.value.category; // discard prisma-included properties
        delete transaction.value.confirmed; // discard explicit confirmed property - only for confirm action
        date.value = formatDate(new Date(transaction.value.created));
        time.value = formatTime(new Date(transaction.value.created));
    }
    if (props.startStage) {
        stage.value = props.startStage;
    }
    if (props.noFrame) {
        boxColor.value = 'var(--color-background-dark)';
        borderColor.value = "#00000000";
    }

    isRecurring.value = transaction.value.recurring !== 0
});

const isRecurring = ref(false);

const categoriesStore = useCategoriesStore();
const { categories } = storeToRefs(categoriesStore);

const sourcesStore = useSourcesStore();
const { allSources } = storeToRefs(sourcesStore);

const firstOut = computed(() => {
    allSources.value.filter(s => s.isOut).reduce((a, b) => a);
});

const add = (amount: number) => {
    transaction.value.amount = parseInt(`${transaction.value.amount}${amount}`);
};

const remove = () => {
    const amountStr = `${transaction.value.amount}`;
    transaction.value.amount = parseInt(amountStr.substring(0, amountStr.length - 1)) || 0
};

const { t } = useI18n();
const emit = defineEmits(["send"]);

const send = () => {
    if (!transaction.value.description) {
        transaction.value.description = t('t_placeholder')
    }
    const datetime = new Date(date.value);
    if (time.value) {
        const hour = parseInt(time.value.split(":")[0]);
        const minute = parseInt(time.value.split(":")[1]);
        datetime.setHours(hour, minute);
    }
    transaction.value.created = datetime.toUTCString();
    emit('send', transaction.value);
};

const formatDate = (date: Date) => {
    return `${date.getUTCFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const formatTime = (date: Date) => {
    return `${date.getHours()}:${date.getMinutes()}`
};

const categorySelected = (categoryName: string) => {
    transaction.value.tags = categoryName;
    stage.value++;
};
</script>
<style lang="scss" scoped>
.frame {
    border: 1px solid;
    padding: 1em 1em 2em 1em;
    border-color: var(--color-primary-dark-3);
    border-radius: 3px;
}

.collapsed {
    transition: 250ms;
    border-color: #00000000;
    padding-top: 0;
    padding-bottom: 0;
}


.calculator {
    &-display {
        font-size: xx-large;
        padding: 0.5em;
        background-color: #00000035;
        border-radius: 8px;
        margin-bottom: 8px;
    }

    &-numpad {
        display: grid;
        grid: auto-flow dense / 1fr 1fr 1fr;
        gap: 8px;

        button {
            width: 100%;
            height: 64px;
            font-size: x-large;
        }
    }

}


.button-sm {
    min-height: 3em;
    margin-left: 5px;
    padding-left: 10px;
    padding-right: 10px;
}

.row {

    display: flex;
    min-height: 2.5em;

    p {
        // margin-right: 1em;
        width: 30%;
        padding-right: 1em;
        text-align: right;
    }

    textarea, input, select {
        width: 70%;
        margin-left: auto;
    }
}

input[type=number] {
    width: 5em;
}
</style>
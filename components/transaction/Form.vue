<template>
    <div ref="focusDiv" class="card">
        <transition name="slide" mode="out-in" class="navigation-container">
            <!-- ENTIRE FORM -->
            <div v-if="stage === 2" class="form">
                <ui-input :label="$t('t_amount')" v-model.number="transaction.amount" type="number" :required="true"/>
                <ui-input :label="$t('t_date')" v-model="date" type="date" :required="true"/>
                <ui-input :label="$t('t_time')" v-model="time" type="time" :required="true"/>
                <ui-input :label="$t('t_desc')" v-model="transaction.description" type="text" :required="true"/>

                <ui-select v-model.number="transaction.sourceId" :label="$t('t_from')">
                    <option
                        v-for="source in allSources"
                        :key="'option-source-' + source.id"
                        :value="source.id"
                    >{{ source.name }}</option>
                </ui-select>

                <ui-select v-model.number="transaction.targetId" :label="$t('t_to')">
                    <option
                        v-for="source in allSources"
                        :key="'option-target-' + source.id"
                        :value="source.id"
                    >{{ source.name }}</option>
                </ui-select>
                <ui-select v-model.number="transaction.tags" :label="$t('t_tag')">
                    <option 
                        v-for="tag in categories"
                        :key="tag.id + '-event'"
                        :value="tag.name"
                    >{{ tag.name }}</option>
                </ui-select>

                <div class="row" style="padding-top: 3px; padding-bottom: 3px">
                    <p>{{ $t('recurring') }}</p>
                    <div class="slideOne" @click="isRecurring = !isRecurring">
                        <input v-model="isRecurring" type="checkbox" id="slideOne" name="check" disabled/>
                        <label for="slideOne"></label>
                    </div>
                    <transition name="slide" mode="out-in">
                        <input v-if="isRecurring" v-model="transaction.recurring" type="number">
                    </transition>
                </div>

                <ui-button
                    @click="send"
                    :loading="processing"
                    icon="fa-solid fa-floppy-disk"
                    height="64px"
                    :outlined="true"
                >{{ $t('t_send') }}</ui-button>

            </div>
            <!-- CATEGORY SELECTION -->
            <div v-else-if="stage === 1" class="categories">
                <CategoryBadge v-for="tag in categories" :category="tag" @selected="categorySelected"/>
            </div>
            <!-- NUMPAD  -->
            <transaction-calculator
                v-else
                v-model="transaction.amount"
                @confirm="stage = stage + 1"
            />
        </transition>
        <div class="navigation">
            <ui-button
                @click="stage = stage - 1"
                :disabled="stage <= 0"
                width="32px"
                :outlined="true"
                icon="fa-solid fa-caret-left"
            />
            <a
                v-for="index in stages"
                :class="stage === index - 1 ? 'navigation-stage active' : 'navigation-stage'"
                @click="stage = index - 1"
            />
            <ui-button
                @click="stage = stage + 1"
                :disabled="stage >= stages - 1"
                width="32px"
                :outlined="true"
                icon="fa-solid fa-caret-right"
            />
        </div>
        <p class="error" style="text-align: right">{{ error }}</p>
    </div>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useCategoriesStore } from "@/stores/categories";
import { useSourcesStore } from "@/stores/sources";
import { Transaction } from "stores/types";

const focusDiv = ref(null);

const props =defineProps<{
    transactionIn: Transaction | undefined,
    processing: boolean,
    startStage: number,
    noFrame: boolean,
    error: string
}>();


    
const stage = ref(0);
const stages = 3;
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

    focusDiv.value.scrollIntoView({ block: 'center',  behavior: 'smooth' });
});

const isRecurring = ref(false);

const categoriesStore = useCategoriesStore();
const { categories } = storeToRefs(categoriesStore);

const sourcesStore = useSourcesStore();
const { allSources } = storeToRefs(sourcesStore);

const firstOut = computed(() => {
    allSources.value.filter(s => s.isOut).reduce((a, b) => a);
});

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
.navigation-container {
height: 510px;
// overflow: scroll;
}

.collapsed {
    transition: 250ms;
    border-color: #00000000;
    padding-top: 0;
    padding-bottom: 0;
}

.navigation {
    display: flex;
    justify-content: center;
    gap: 32px;
    align-items: center;
    margin-top: auto;
    padding-top: 32px;
    margin-bottom: 16px;

    &-stage {
        width: 12px;
        height: 12px;
        border: 1px solid var(--color-primary);
        border-radius: 50%;
    }
}

.active {
    background-color: var(--color-primary);
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
        // width: 30%;
        padding-right: 1em;
        // text-align: right;
    }

    textarea, input, select {
        width: 70%;
        margin-left: auto;
    }
}

input[type=number] {
    width: 128px;
}

.save-btn {
    width: 100%;
    padding: 8px 0;
    height: 64px;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
</style>
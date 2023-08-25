<template>
<div class="container more-p">
    <Transition name="page" mode="out-in">
    <div v-if="!currentSource && sourceLoading" class="center"><MosaicLoader /></div>
    <div v-else-if="currentSource" class="flex-col">
        <section class="row title">
            <h1 class="item">{{ currentSource.name }}</h1>
            <Transition name="page" mode="out-in">
            <spinner v-show="sourceLoading" class="item"/>
            </Transition>
        </section>
        
        <div class="row card">
            <p class="item">{{ $t('name') }}</p>
            <form-editable-field
                :value="currentSource.name"
                keyName="name"
                @send="data => sourceStore.patchSource(sourceId, data)"
                class="item"
            />
        </div>
        <div class="row card">
            <p class="item">{{ $t('s_isout') }}</p>
            <form-editable-boolean
                keyName="isOut"
                :value="currentSource.isOut"
                @send="data => sourceStore.patchSource(sourceId, data)"
                class="item"
            />
        </div>

        <div class="row card">
            <p class="item">{{ $t('s_isdisp') }}</p>
            <form-editable-boolean
                keyName="isDisponible"
                :value="currentSource.isDisponible"
                @send="data => sourceStore.patchSource(sourceId, data)"
                class="item"
            />
        </div>

        <div class="row card">
            <p class="item">{{ $t('color') }}</p>
            <div class="item">
                <form-editable-color
                    keyName="color"
                    :value="currentSource.color || '#ffffffff'"
                    @send="data => sourceStore.patchSource(sourceId, data)"
                />
                </div>
        </div>
        <section class="card flex-col">
            <h3 class="title">{{ $t('s_states') }}</h3>
            <div v-for="state in currentSource.states" class="row">
                <div class="row-simple">
                    <ui-button
                        @click="sourceStore.deleteEntry(sourceId, state.id)"
                        :outlined="true"
                        icon="fa-solid fa-trash"
                        width="32px"
                        height="36px"
                    />
                    <span>{{ new Date(state.created).toLocaleString() }}</span>
                </div>
                <ui-price class="item" :amount="state.amount" :currency="currency" />
            </div>
            <hr>
            <Transition name="page" mode="out-in">
            <balance-entry-form
                v-if="edit"
                @close="edit=!edit"
                @created="newEntry"
                :sourceId="currentSource.id"
            />
            <ui-button
                v-else
                @click="edit = !edit"
                height="32px"
            >{{ $t('t_add') }}</ui-button>
            </Transition>
        </section>


    </div>
    <error-banner v-else status="404" message="not found" :is-login="false" />
    </Transition>
</div>
</template>

<script setup lang="ts">
import { useSourcesStore } from '@/stores/sources';
import { storeToRefs } from 'pinia';

const sourceStore = useSourcesStore();
const { sourceLoading, currentSourceId, currentSource } = storeToRefs(sourceStore);

const route = useRoute();
const sourceId = parseInt(route.params.id as string);

const edit = ref<boolean>();

currentSourceId.value = sourceId;

onMounted(() => {
    if (!currentSource.value) {
        sourceStore.fetchSingleSource(sourceId);
    }
});

const newEntry = () => {
    edit.value = false;
    sourceStore.fetchSingleSource(sourceId);
}
</script>

<style lang="scss" scoped>
.flex-col {
    gap: 8px;
}
.title {
    text-transform: uppercase;
}

.row > p {
    text-transform: capitalize;
    filter: contrast(0.2);
}

</style>
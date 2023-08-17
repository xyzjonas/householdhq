<template>
    <div>
        <!-- EXPENSES & INCOMES -->
        <section v-if="item <= 1">
            <BarGraph :items="graphContent" @filter="tagId => $emit('filter', tagId)"/>
        </section>

        <!-- SOURCES STATE -->
        <!-- <section v-else-if="item === 2" class="row-simple">
            <div class="item border-left">
                <h3>{{ $t('sources') }}</h3>
                <BarGraph class="item" :items="sources" @filter="id => $emit('filterSource', id)"/>
            </div>            
            <button @click="item+=1" class="chevron right item-shrink" style="min-height: 100%;"><i class="fa-solid fa-chevron-right"></i></button>
        </section>
        <section v-else-if="item === 3" class="row-simple">
            <button  @click="item-=1" class="chevron left item-shrink" style="min-height: 100%;"><i class="fa-solid fa-chevron-left"></i></button>
            <div class="item border-left">
                <h3>{{ $t('targets') }}</h3>
                <BarGraph :items="targets" @filter="id => $emit('filterTarget', id)" />
            </div>            
        </section> -->
    </div>
    <div class="center my-2">
        <div class="toggle-bar m-1">
        <a @click="item = 0" :class="`bar-item ${item === 0 ? 'active' : ''}`">{{ $t('expenses') }}</a>
        <a @click="item = 1" :class="`bar-item ${item === 1 ? 'active' : ''}`">{{ $t('incomes') }}</a>
        </div>
    </div>
</template>
<script setup lang="ts">

const props = defineProps(['tags', 'incomes', 'sources', 'targets']);

const item = ref(0);

const graphContent = computed(() => {
    if (item.value === 1) {
        return props.incomes;
    }
    if (item.value === 2) {
        return props.sources;
    }
    if (item.value === 3) {
        return props.targets;
    }
    return props.tags;
})

</script>
<style lang="scss" scoped>

h3 {
    text-transform: uppercase;
}

.circle {
  width: 10px;
  height: 10px;
  border: solid 2px #fff;
  border-radius: 0.5em;
  margin: 7px;
  transition: background-color linear 0.5s;
}

.circle.selected {
  background-color: #fff;
}

.chevron {
    background-color: #ffffff00;
}
.chevron.left {
    margin-right: 0.5em;   
}

.chevron.right {
    margin-right: 0.5em;
}

.border-left {
    padding-left: 1em;
    border-left: 1px solid var(--color-grey-dark-2);
    padding-right: 1em;
    border-right: 1px solid var(--color-grey-dark-2);
}
</style>
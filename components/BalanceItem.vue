<template>
    <div class="bal=wrapper">
    <NuxtLink :to="`/sources/${source.id}`">
        <div class="bal-item">
        <span>{{ source.name }}</span>
        <br>
        <div v-if="lastEntry && lastEntryNotThisMonth"></div>
        <Price v-else-if="!isNaN(source.balance)" class="item" :amount="source.balance" :currency="currency.value" />
        <span v-else>
            <i class="fa-solid fa-triangle-exclamation"></i>
        </span>
        </div>
    </NuxtLink>
    <div v-if="lastEntry && lastEntryNotThisMonth" class="center">
        <button @click="updating = !updating">
            {{ $t("balance_auto_update") }}
            <i :class="`fa-solid fa-rotate ${ updating ? 'rotating' : ''}`"></i>
        </button>
    </div>
    </div>
</template>
<script>
import { Price } from '#components';

export default {
    components: { Price },
    props: ['source', 'max'],
    inject: ['currency'],

    data() {
        return {
            updating: false,
        }
    },

    computed: {
        lastEntry() {
            if (this.source.states && this.source.states.length > 0) {
                return this.source.states[this.source.states.length - 1];
            }
        },
        lastEntryNotThisMonth() {
            if (this.lastEntry) {
                console.info(this.lastEntry.created)
                const now = new Date();
                const d = new Date(this.lastEntry.created);
                if (now.getFullYear() === d.getFullYear() && now.getMonth() === d.getMonth()) {
                    return false;
                }
                return true;
            }
        },
        maxWidth() {
            let percentage = 10;
            if (this.source.balance) {
                percentage = this.source.balance.amount / this.max * 100;
            }
            
            return `${percentage}%`;
        }
    },
    methods: {
        autoUpdate() {
            this.updating = true;
            const url = '/sources/update';
            $fetch(url, {method: 'POST', body: { id: this.source.id }})
                .then(res => this.$emit('autoupdated', res.data))
                .finally(() => this.updating = false);
        }
    }
}
</script>
<style lang="scss" scoped>
.bal-item {
    padding-top: 0.3em;
    padding-bottom: 0.3em;
    text-align: center;
    background-color: v-bind('source.color');
    margin-left: 2px;
    margin-right: 2px;
    min-width: 5em;
    white-space: nowrap;
    overflow: hidden;
    // max-width: v-bind('maxWidth');
}
.bal-wrapper {
    display: flex;
    flex-direction: column;
}
button {
    margin: 5px;
}

.rotating {
    animation: rotate 1s infinite linear;
}

@keyframes rotate {
    0% {
        transform: rotate(0);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
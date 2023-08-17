<template>
    <div class="bal-wrapper">
        <span>
            <button @click="navigateTo(`/sources/${source.id}`)" class="bal-wrapper-btn mr">
                <i class="fa-solid fa-pen"></i>
            </button>
            <span class="label">{{ source.name }}</span>
        </span>
        <div class="text">
            <Price v-if="!isNaN(source.balance)" size="large" :amount="source.balance" :currency="currency.value" />
            <Price v-else="lastEntry && lastEntryNotThisMonth" size="large" class="item" amount="???" />
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
        },
        opacity() {
            if (this.lastEntry && this.lastEntryNotThisMonth) {
                return 'opacity(1)'
            }
            return 'opacity(0)'
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
.bal-wrapper {
    display: flex;
    flex-direction: row;
    overflow: hidden;
    margin-top: 0.2em;
    margin-bottom: 0.2em;
    align-items: center;
    justify-content: space-between;

    .text {
        display: inline-flex;
        color: v-bind('source.color');
    }

    .text::after {
        content: "*";
        margin-left: 0.3em;
        color: var(--color-danger);
        filter: v-bind('opacity');
    }

    .label {
        border: 0;
        color: var(--color-font-light);
        color: v-bind('source.color');
        font-size: small;
        text-transform: uppercase;
        margin-right: 0.7em;
    }
    

    .action {
        margin-left: auto;
        margin-right: 1em;
        color: var(--color-font-gray);

        &:hover {
            color: var(--color-font-light)
        }
    }
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
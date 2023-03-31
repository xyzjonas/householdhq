<template>
    <div class="bal-wrapper">
        <div class="icon">
            <i v-if="lastEntry && lastEntryNotThisMonth" class="fa-solid fa-rotate"></i>
            <i v-else-if="!isNaN(source.balance)" class="fa-regular fa-circle-check"></i>
            <i v-else class="fa-solid fa-warning"></i>
        </div>
        <div class="text">
            <Price v-if="lastEntry && lastEntryNotThisMonth" class="item" amount="???" />
            <Price v-else-if="!isNaN(source.balance)" class="item" :amount="source.balance" :currency="currency.value" />
            <Price v-else="lastEntry && lastEntryNotThisMonth" class="item" amount="???" />
            <span class="label">{{ source.name }}</span>
        </div>
        <NuxtLink :to="`/sources/${source.id}`" class="action">
            <i class="fa-solid fa-arrow-right"></i>
        </NuxtLink>
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
.bal-wrapper {
    display: flex;
    flex-direction: row;
    min-height: 5em;
    border: 1px solid var(--color-primary-light-1);;
    border-radius: 8px;

    * {
        height: fit-content;
        align-self: center;
    }

    .icon {
        color: var(--color-primary-light-1);
        font-size: x-large;
        justify-self: flex-start;
        margin-left: 1em;
    }

    .text {
        margin-left: 1em;
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
button {
    margin: 5px;
}

.label {
    border: 0;
    color: var(--color-font-light);
    filter: contrast(0.1);
    font-size: small;
    text-transform: uppercase;
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
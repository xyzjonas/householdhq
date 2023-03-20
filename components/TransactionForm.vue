<template lang="">
    <div :class="`frame ${noFrame ? 'background': ''}`">
        
        <transition name="slide" mode="out-in">
            <div v-if="stage === 1">
                <div class="row" style="padding-top: 3px; padding-bottom: 3px">
                    <p>{{ $t('t_amount') }}</p>
                    <input v-model.number="transaction.amount"/>
                </div>
                <div class="row" style="padding-top: 3px; padding-bottom: 3px">
                    <p>{{ $t('t_date') }}</p>
                    <input v-model="transaction.created" type="date"/>
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
                            v-for="tag in allTags"
                            :key="tag.id + '-event'"
                            :value="tag.name"
                        >{{ tag.name }}</option>
                    </select>
                </div>
                <div class="row" style="padding-top: 3px; padding-bottom: 3px">
                    <p>{{ $t('recurring') }}</p>
                    <input
                        v-model="isRecurring"
                        type="checkbox"
                        style="max-width: fit-content; margin-right: 1em;"
                    >
                    <input v-if="isRecurring" v-model="transaction.recurring" type="number">
                </div>
                <div class="space"></div>

                <div class="row">
                    <button @click="stage -= 1" style="margin-left: auto" class="button-sm ">{{ $t('back') }}</button>
                    <button @click="send" class="success button-sm">
                        <span v-if="!processing">{{ $t('t_send') }}</span>
                        <Spinner v-else />
                    </button>
                </div>
            </div>
            <div v-else-if="stage === 2"></div>
            <div v-else>
                <Price :amount="transaction.amount"  style="font-size: xx-large; padding: 0.5em" />
                <div class="numpad">
                    <div class="button" v-for="index in 9">
                        <button @click="add(index)" style="width: 100%">{{ index }}</button>
                    </div>
                </div>
                <div class="numpad">
                    <div class="button"><button class="danger" @click="remove">DEL</button></div>
                    <div class="button"><button @click="add(0)">0</button></div>
                    <div class="button"><button class="success" @click="stage+=1">OK</button></div>
                </div>
            </div>
        </transition>

    </div>
</template>
<script>
import { Price, Icon, Spinner } from "#components";

export default {

    components: { Price, Icon, Spinner },

    props: ['processing', 'transactionIn', 'startStage', 'noFrame'],

    data() {
        return {
            stage: 0,
            transaction: {
                created: this.formatDate(new Date()),
                amount: 0,
                description: undefined,
                sourceId: 1,
                recurring: 0,
            },
            boxColor: 'var(--color-grey-dark-1)',
            borderColor: 'var(--color-grey-dark-3)',
            isRecurring: false,
            allTags: [],
            allSources: [],
        }
    },

    created() {
        this.getTags();
        this.getSources();

        if (this.transactionIn) {
            this.transaction = { ...this.transactionIn };
            this.transaction.created = this.formatDate(new Date(this.transactionIn.created));
            this.transaction.tags = this.transactionIn.tags.map(t => t.name).join(",");
            delete this.transaction.source; // discard prisma-included properties
            delete this.transaction.target; // discard prisma-included properties
            delete this.transaction.confirmed; // discard explicit confirmed property - only for confirm action
        }
        if (this.startStage) {
            this.stage = this.startStage;
        }
        if (this.noFrame) {
            this.boxColor = 'var(--color-background-dark)';
            this.borderColor = "#00000000";
        }
        this.isRecurring = this.transaction.recurring !== 0
    },

    computed: {
        firstOut() {
            this.allSources.filter(s => s.isOut).reduce((a, b) => a);
        }
    },

    methods: {
        add(amount) {
            this.transaction.amount = parseInt(`${this.transaction.amount}${amount}`);
        },
        remove() {
            const amountStr = `${this.transaction.amount}`;
            this.transaction.amount = parseInt(amountStr.substring(0, amountStr.length - 1)) || 0
        },
        send() {
            if (!this.transaction.description) {
                this.transaction.description = this.$t('t_placeholder')
            }
            this.$emit('send', this.transaction);
        },
        formatDate(date) {
            return `${date.getUTCFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        },
        getTags() {
        const url = '/api/tags'
        $fetch(url, {method: 'GET'})
            .then(res => this.allTags = res.data)
        },
        getSources() {
        const url = '/api/sources'
        $fetch(url, {method: 'GET'})
            .then(res => this.allSources = res.data)
        },
    },
}
</script>
<style lang="scss" scoped>
.frame {
    border: 1px solid;
    padding: 1em 1em 2em 1em;
    border-color: v-bind('borderColor');
    border-radius: 3px;
}

.collapsed {
    transition: 250ms;
    border-color: #00000000;
    padding-top: 0;
    padding-bottom: 0;
}

.button {
    padding: 3px;
    min-height: 5em;

    button {
        font-size: xx-large;
        background-color: v-bind('boxColor');
        height: 100%;
        width: 100%;
    }
}

input {
    background-color: v-bind('boxColor');
}

textarea {
    background-color: v-bind('boxColor');
}

select {
    background-color: v-bind('boxColor');
}

.button-sm {
    min-height: 3em;
    margin-left: 5px;
    padding-left: 10px;
    padding-right: 10px;
}

.row {

    min-height: 2.5em;

    p {
        margin-right: 1em;
        min-width: 4em;
    }

    textarea {
        width: 100%;
    }
}
</style>
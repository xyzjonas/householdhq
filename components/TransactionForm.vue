<template lang="">
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
                            v-for="tag in allTags"
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
                <CategoryBadge v-for="tag in allTags" :category="tag" @selected="categorySelected"/>
            </div>
            <!-- NUMPAD  -->
            <div v-else>
                <Price :amount="transaction.amount"  style="font-size: xx-large; padding: 0.5em" />
                <div class="numpad">
                    <div class="button" v-for="index in 9">
                        <button @click="add(index)" style="width: 100%">{{ index }}</button>
                    </div>
                </div>
                <div class="numpad">
                    <div class="button"><button @click="remove">DEL</button></div>
                    <div class="button"><button @click="add(0)">0</button></div>
                    <div class="button"><button @click="stage+=1">OK</button></div>
                </div>
            </div>
        </transition>
        <p class="error" style="text-align: right">{{ error }}</p>
    </div>
</template>
<script>
import { Price, Icon, Spinner, CategoryBadge } from "#components";

export default {

    components: { Price, Icon, Spinner, CategoryBadge },

    props: ['processing', 'transactionIn', 'startStage', 'noFrame', 'error'],

    // inject: ['token'],

    data() {
        return {
            stage: 0,
            date: this.formatDate(new Date()),
            time: this.formatTime(new Date()),
            transaction: {
                created: null,
                amount: 0,
                description: undefined,
                sourceId: 1,
                targetId: 2,
                recurring: 0,
            },
            isRecurring: false,
            allTags: [],
            allSources: [],
        }
    },

    async created() {
        const tok = await this.$auth0.getAccessTokenSilently();
        this.token = tok;
        this.getTags();
        this.getSources();

        if (this.transactionIn) {
            this.transaction = { ...this.transactionIn };
            this.transaction.created = this.transactionIn.created;
            this.transaction.tags = this.transactionIn.tags.map(t => t.name).join(",");
            delete this.transaction.source; // discard prisma-included properties
            delete this.transaction.target; // discard prisma-included properties
            delete this.transaction.confirmed; // discard explicit confirmed property - only for confirm action
            this.date = this.formatDate(new Date(this.transaction.created));
            this.time = this.formatTime(new Date(this.transaction.created));
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

    mounted() {
        this.$refs.focusDiv.scrollIntoView({ block: "nearest", behavior: "smooth" });
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
            const datetime = new Date(this.date);
            if (this.time) {
                const hour = this.time.split(":")[0];
                const minute = this.time.split(":")[1];
                datetime.setHours(hour, minute);
            }
            this.transaction.created = datetime.toUTCString();
            this.$emit('send', this.transaction);
        },
        formatDate(date) {
            return `${date.getUTCFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        },
        formatTime(date) {
            return `${date.getHours()}:${date.getMinutes()}`
        },

        getTags() {
        const url = '/api/tags'
        console.info(`tok: ${this.token}`)
        $fetch(url, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + this.token
            },
        })
            .then(res => this.allTags = res.data)
        },
        getSources() {
        const url = '/api/sources'
        $fetch(url, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + this.token
            },
        })
            .then(res => this.allSources = res.data)
        },
        categorySelected(categoryName) {
            this.transaction.tags = categoryName;
            this.stage++;
        }
    },
}
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

.button {
    padding: 3px;
    min-height: 5em;

    button {
        font-size: xx-large;
        background-color: z;
        height: 100%;
        width: 100%;
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
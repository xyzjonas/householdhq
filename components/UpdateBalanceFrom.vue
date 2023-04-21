<template>
    <div>
        <div class="row" style="padding-top: 3px; padding-bottom: 3px">
            <p>{{ $t('t_date') }}</p>
            <input v-model="date" type="date"/>
        </div>
        <div class="row" style="padding-top: 3px; padding-bottom: 3px">
            <p>{{ $t('t_time') }}</p>
            <input v-model="time" type="time"/>
        </div>
        <div class="row" style="padding-top: 3px; padding-bottom: 3px">
            <p>{{ $t('t_amount') }}</p>
            <input v-model.number="state.amount"/>
        </div>
        <div v-if="error">
            <small class="error">{{ $t(error.statusMessage) }}</small>
        </div>
        <div class="row mt">
            <button @click="$emit('close')" style="margin-left: auto" class="button-sm ">{{ $t('close') }}</button>
            <button @click="send" :class="`button-sm ${ error ? 'danger' : 'success'}`">
                <span v-if="!processing">{{ $t('t_send') }}</span>
                <Spinner v-else />
            </button>
        </div>
    </div>
</template>
<script>
import { Spinner } from '#components';

export default {
    components: { Spinner },

    props: ['sourceId'],

    data() {
        return {
            date: this.formatDate(new Date()),
            time: this.formatTime(new Date()),
            state: {
                created: null,
                amount: 0,
                sourceId: this.sourceId,
            },
            processing: false,
            error: undefined,
        }
    },

    async created() {
        const tok = await this.$auth0.getAccessTokenSilently();
        this.token = tok;
    },

    methods: {
        formatDate(date) {
            return `${date.getUTCFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        },
        formatTime(date) {
            return `${date.getHours()}:${date.getMinutes()}`
        },

        send() {
            const datetime = new Date(this.date);
            if (this.time) {
                const hour = this.time.split(":")[0];
                const minute = this.time.split(":")[1];
                datetime.setHours(hour, minute);
            }
            this.state.created = datetime.toUTCString();
            this.processing = true;
            const url = "/api/sources/update";
            $fetch(url, {
                method: 'PUT',
                body: this.state,
                headers: {
                    Authorization: 'Bearer ' + this.token
                }
            })
                .then(res => this.$emit('created', res.data))
                .catch(err => this.error = err.data)
                .finally(() => { this.processing = false; })
        }
    }
}
</script>
<style lang="scss" scoped>
.row > p {
    min-width: 5em;
}
button {
    margin: 0.3em;
}
</style>
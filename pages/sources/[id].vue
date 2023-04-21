<template>
    <div class="container more-p">
        <Transition name="page" mode="out-in">
        <div v-if="loading" class="center"><MosaicLoader /></div>
        <div v-else-if="source.id">
            <h1 class="title">{{ source.name }}</h1>
            <div class="row">
                <p class="item">{{ $t('name') }}</p>
                <EditableField
                    :value="source.name"
                    keyName="name"
                    @send="patchSource"
                    class="item"
                />
            </div>
            <div class="row">
                <p class="item">{{ $t('s_isout') }}</p>
                <EditableBoolean
                    keyName="isOut"
                    :value="source.isOut"
                    @send="patchSource"
                    class="item"
                />
            </div>

            <div class="row">
                <p class="item">{{ $t('color') }}</p>
                <div class="item">
                    <EditableColor
                        keyName="color"
                        :value="source.color || '#ffffffff'"
                        @send="patchSource"
                    />
                    </div>
            </div> 
            <h3 class="item">{{ $t('s_states') }}</h3>
            <div v-for="state in source.states" class="row">
                <div class="item">
                    <button @click="deleteEntry(state.id)">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                    {{ state.created }}
                </div>
                <Price class="item" :amount="state.amount" :currency="currency" />
            </div>

            <hr>
            

            <button @click="edit=!edit" v-if="!edit">{{ $t('t_add') }}</button>
            <UpdateBalanceFrom  @close="edit=!edit" @created="newEntry" :sourceId="source.id" v-else />

        </div>
        <div v-else class="center">
            NOT FOUND
        </div>
        </Transition>
    </div>
</template>
<script>
import { EditableBoolean, EditableField, EditableColor, MosaicLoader, UpdateBalanceFrom } from '#components';

export default {

    components: { EditableBoolean, EditableField, EditableColor, MosaicLoader, UpdateBalanceFrom },

    inject: ['currency'],

    data() {
        return {
            loading: false,
            edit: false,
            source: {}
        }
    },
    
    methods: {
        getSource() {
            this.loading = true;
            const url = `/api/sources/${this.sourceId}`;
            $fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + this.token
                }
            })
            .then(res => this.source = res.data)
            .finally(() => this.loading = false)
        },
        patchSource(sourceData) {
            const url = "/api/sources";
            console.info(sourceData)
            sourceData.id = this.source.id;
            $fetch(url, {
                method: 'PATCH',
                body: sourceData,
                headers: {
                    Authorization: 'Bearer ' + this.token
                }
            })
                .then(res => this.source = res.data)
                .finally(() => { this.patching = false; this.edit = false; this.details = false })
        },
        deleteEntry(entryId) {
            const url = "/api/sources/update";
            $fetch(url, {
                method: 'DELETE',
                body: { id: entryId },
                headers: {
                    Authorization: 'Bearer ' + this.token
                }
            })
                .then(res => this.source.states = this.source.states.filter(s => s.id !== res.data.id))
                .finally(() => { this.patching = false; this.edit = false; this.details = false })
        },
        newEntry() {
            this.edit = false;
            this.getSource();
        }
    },

    setup() {
        const route = useRoute();
        const sourceId = route.params.id
        return { sourceId: sourceId }
    },

    async created() {
        const tok = await this.$auth0.getAccessTokenSilently();
        this.token = tok;
        this.getSource();
    }
}
</script>
<style lang="scss" scoped>
button {
    padding: 0.5em;
}

.title {
    border-color: v-bind('source.color');
    color: v-bind('source.color');
}

.title {
    text-transform: uppercase;
}
.row {
    margin-top: 0.1em;
    margin-bottom: 0.1em;
    min-height: 1.8em;
       
}

.row > p {
    text-transform: capitalize;
    filter: contrast(0.2);
}

</style>
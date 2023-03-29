<template>
    <div @click="$emit('toggle', tag.id)" class="row-wrapper">
        <p class="label">{{ tag.name }}</p>
        <div class="bar-wrapper">
            <p class="bar">
                <Price
                    :amount="tag.sum"
                    :currency="tag.transactions[0].currency"
                    style="margin-left: 0.5em;"
                />
            </p>
        </div>
    </div>
</template>
<script>
import { Price } from '#components';

export default {

    components: { Price },

    props: ['tag', 'selected', 'max'],

    computed: {
        width() {
            let perc = this.selected ? 100 : this.tag.sum / this.max * 100;
            if (perc !== 100) {
                perc += (100 - perc) * 0.2;
            }
            return `${perc}%`;
        }
    }
}
</script>
<style lang="scss">
.label {
    border-left: 0.5em solid;
    border-color: v-bind('tag.color');
}
.bar {
    width: v-bind('width');
}
</style>
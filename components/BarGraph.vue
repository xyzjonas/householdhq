<template lang="">
    <div class="graph">
        <NuxtLink
            v-for="tag in tags" :to="`/tags/${tag.tag.id}`"
            class="row-wrapper"
            :style="`color: ${light_or_dark(tag.tag.color) ? '#2b2b2b': '#faf9f9'};`"
        >
            <p class="label" :style="`background-color: ${tag.tag.color}`">{{ tag.tag.name }}</p>
            <div class="bar-wrapper">
                <p class="bar" :style="`width: ${(tag.sum / max * loaded)}%; background-color: ${tag.tag.color}`">
                    <Price
                        :amount="tag.sum"
                        :currency="tag.transactions[0].currency"
                        style="margin-left: 0.5em;"
                    />
                </p>
            </div>
        </NuxtLink>
    </div>
</template>
<script>
import { Price } from '#components';

export default {

    components: { Price },

    props: [ 'tags' ],

    data() {
        return {
            loaded: 0,
        }
    },

    computed: {
        max() {
            let max = 0;
            Object.values(this.tags).forEach(t => {
                if (t.sum > max) {
                    max = t.sum;
                }
            })
            return max
        },
    },

    methods: {
        light_or_dark(color) {
            if (color) {
                console.info(`${color} -> ${parseInt(color.replace('#', ''), 16)}`)
                return color && parseInt(color.replace('#', ''), 16) > 15000000;
            }
            return false
        }
    },

    created() {
        setTimeout(() => {
            console.info(this.loaded);
            this.loaded = 100;
        }, 100)
    }
}
</script>

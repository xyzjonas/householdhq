<template>
    <div>
        <section v-if="items.length === 0" class="center">
            <h1>{{ $t('no_data') }}</h1>
        </section>
        <transition name="slide" mode="out-in">
        <div v-if="selected > 0" class="graph">
            <div
                v-for="tag in displayedTags" :to="`/tags/${tag.id}`"
                @click="toggleSelected(tag.id)"
                class="row-wrapper"
                :style="`color: ${light_or_dark(tag.color) ? '#2b2b2b': '#faf9f9'}; text-shadow: 0px 0px 2px ${tag.color}, 0px 0px 2px ${tag.color}, 0px 0px 2px ${tag.color};`"
            >
                <p class="label" :style="`background-color: ${tag.color}`">{{ tag.name }}</p>
                <div class="bar-wrapper">
                    <p class="bar" 
                        :style="`width: ${tag.id === selected ? 100 : (tag.sum / max) * 100}%; background-color: ${tag.color}`">
                        <Price
                            :amount="tag.sum"
                            :currency="tag.transactions[0].currency"
                            style="margin-left: 0.5em;"
                        />
                    </p>
                </div>
            </div>
        </div>
        <div v-else class="graph">
            <div
                v-for="tag in items" :to="`/tags/${tag.id}`"
                @click="toggleSelected(tag.id)"
                class="row-wrapper"
                :style="`color: ${light_or_dark(tag.color) ? '#2b2b2b': '#faf9f9'}; text-shadow: 0px 0px 2px ${tag.color}, 0px 0px 2px ${tag.color}, 0px 0px 2px ${tag.color};`"
            >
                <p class="label" :style="`background-color: ${tag.color}`">{{ tag.name }}</p>
                <div class="bar-wrapper">
                    <p class="bar" 
                        :style="`width: ${tag.id === selected ? 100 : (tag.sum / max) * 100}%; background-color: ${tag.color}`">
                        <Price
                            :amount="tag.sum"
                            :currency="tag.transactions[0].currency"
                            style="margin-left: 0.5em;"
                        />
                    </p>
                </div>
            </div>
        </div>
        </transition>
        <div v-show="selected > 0">
            <TagDetails :tagId="selected"  @cancel="toggleSelected(selected)"/>
        </div>
    </div>
</template>
<script>
import { Price, TagDetails } from '#components';

export default {

    components: { Price, TagDetails },

    props: [ 'items' ],

    data() {
        return {
            selected: -1,
            max: 0,
        }
    },

    computed: {
        displayedTags() {
            if (this.selected < 0) {
                return this.items;
            }
            return this.items.filter(t => t.id === this.selected);
        },
    },

    created() {
        let max = 0;
        Object.values(this.items).forEach(t => {
            if (t.sum > max) { max = t.sum; }
        })
        this.max = max;
    },

    methods: {
        light_or_dark(colorHex) {
            if (colorHex) {
                let color = colorHex.startsWith("#") ? colorHex.replace("#", "") : colorHex;
                const r = parseInt(color.substring(0, 2), 16); // hexToR
                const g = parseInt(color.substring(2, 4), 16); // hexToG
                const b = parseInt(color.substring(4, 6), 16); // hexToB
                return (r*0.299 + g*0.587 + b*0.114) > 186;
            }
            return false
        },
        toggleSelected(tagId) {
            if (this.selected === tagId) {
                this.selected = -1;
            } else {
                this.selected = tagId;
            }
            this.$emit('filter', this.selected);
        },
        getTagWidth(tag) {
            if (tag.id === this.selected) {
                return 100;
            }
            return tag.sum / max * this.loaded;
        }
    },
}
</script>

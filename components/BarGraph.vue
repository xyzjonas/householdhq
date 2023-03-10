<template lang="">
    <div class="graph">
        <NuxtLink v-for="tag in tags" :to="`/tags/${tag.tag.id}`" class="row-wrapper">
            <p class="label">{{ tag.tag.name }}</p>
            <div class="bar-wrapper">
                <p class="bar" :style="`width: ${(tag.sum / max * loaded)}%; background-color: ${tag.tag.color}`">
                    <Price
                        :amount="tag.sum"
                        :currency="tag.transactions[0].currency"
                        style="margin-left: 0.3em"
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

    created() {
        setTimeout(() => {
            console.info(this.loaded);
            this.loaded = 100;
        }, 100)
    }
}
</script>
<style lang="scss" scoped>




// .col-wrapper {
//     position: relative;
//     padding-left: 5px;
//     padding-right: 5px;
//     flex: 1 5;

//     .label {
//         top: 140%;
//         position: absolute;
//         transform: rotate(-90deg);
//         text-align: end;
//     }

//     .price-label {
//         position: absolute;
//         min-width: 100%;
//         right: 0%;
//         text-align: center;
//         transform: rotate(-90deg);
//     }

//     .col {
//         height: 100%;
//         margin-left: auto;
//         display: flex;
//         flex-direction: column;

//         * {
//             flex: auto;
//             transition: linear;
//             transition-duration: 0.5s;
//         }
//     }
// }

// .actual-column {
//     background-color: var(--color-grey-dark-2);
// }
    
</style>
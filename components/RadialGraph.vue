<template lang="">
    <div class="frame">
		<div class="graph">
            <div class="slice">
                <div class="graph-mask">
                    AAA
                </div>
            </div>
            
            <!-- <div class="slice slice-fill"><div class="slice-content"></div></div> -->
        </div>
	</div>
</template>
<script>
export default {
    data() {
        return {
            percentages: [
                {
                    color: "red",
                    perc: 30
                },
                {
                    color: "blue",
                    perc: 50
                },
                {
                    color: "yellow",
                    perc: 60
                },
            ]
        }
    },

    computed: {
        background() {
            return `conic-gradient(${
                this.percentages.map(p => `${p.color} 0%, ${p.color} ${p.perc}%`).join(', ')
            })`
        }
    }
}
</script>
<style lang="scss" scoped>
.frame {
    border: 1px solid blue;
}
.graph {
    --infill-perc: 74%;
    height: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: var(--color-primary-light-1);

    .graph-mask {
        width: var(--infill-perc);
        height: var(--infill-perc);
        background: var(--color-primary-dark-1);
        border-radius: 50%;
        position: relative;
        top:  calc((100% - var(--infill-perc)) / 2);
        left: calc((100% - var(--infill-perc)) / 2);
        display: grid;
        justify-items: center;
        align-items: center;
    }

    .slice {
        --w: 100%;
        width: var(--w);
        height: var(--w);
        background: blue;
        border-radius: 50%;
        position: relative;
        top:  calc((100% - var(--w)) / 2);
        left: calc((100% - var(--w)) / 2);
        background: v-bind('background');
        // animation: rot 0.3s linear infinite;
    }
}

@keyframes rot {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>

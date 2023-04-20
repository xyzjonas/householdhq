<template>
    <div class="wrapper">
        <transition name="page" mode="out-in">
            <p v-if="!loaded" class="loading"></p>
            <div v-else-if="user" class="user-badge" @click="logout">
                <img :src="user.picture">
            </div>
            <button v-else @click="login">
                <i class="fa-solid fa-key"></i>
            </button>
        </transition>
    </div>
</template>
<script>
export default {
    computed: {
        loaded() {
            if (!this.$auth0) {
                return false
            }
            return !this.$auth0.isLoading.value
        },
        user() {
            if(this.$auth0 && this.$auth0.user) {
                return this.$auth0.user.value;
            }
        },
        userLetter() {
            if (this.user) {
                return this.user.name[0].toUpperCase();
            }
        }
    },
    methods: {
        logout() {
            this.$auth0.logout()
        },
        login() {
            this.$auth0.loginWithRedirect();
        }
    }
}
</script>
<style lang="scss">
.wrapper {
    padding-right: 1em;
    border-right: 1px solid var(--color-primary-light-1);
    display: grid;
    align-content: center;

    button {
        width: 36px;
        aspect-ratio: 1;
    }
}
.user-badge {
    border-radius: 50%;
    aspect-ratio: 1;
    font-size: 1em;
    text-align: center;
    align-self: center;
    font-weight: 900;
    font-family: serif;

    img {
        width: 36px;
        border-radius: 50%;
    }
}

.loading {
    --h: 36px;
    border-radius: 50%;
    border: 2px solid white;
    height: var(--h);
    aspect-ratio: 1;
    border-top: calc(var(--h) / 8) solid transparent;
    animation: rotate-loading 0.7s infinite linear;
}

@keyframes rotate-loading {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
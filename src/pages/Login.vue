
<template>
	<n-input v-model:value="password" />
	<n-button @click="checkPassword">Se connecter</n-button>
</template>

<script setup lang="ts">
import { NInput, NButton } from 'naive-ui'
import useStore from '../stores/store'
import { ref } from 'vue'

const store = useStore()
const password = ref('')
const checkPassword = async () => {
	await store.signIn(password.value)
}
</script>
<style scoped>
.logo {
	height: 6em;
	padding: 1.5em;
	will-change: filter;
	transition: filter 300ms;
}

.logo:hover {
	filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
	filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

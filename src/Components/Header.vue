<template>
	<div style="display:grid;grid-template-columns: auto auto auto 1fr;">
		<n-button v-bind="getButtonAttrs('/')">
			<template #icon>
				<calendar></calendar>
			</template>
			Pointages
		</n-button>
		<n-button v-bind="getButtonAttrs('/enfants')">
			<template #icon>
				<users></users>
			</template>
			Enfants
		</n-button>
		<n-button v-bind="getButtonAttrs('/export')">
			<template #icon>
				<file-excel></file-excel>
			</template>
			Export
		</n-button>
		<n-button quaternary style="margin-left:auto" @click="store.auth.signOut()">
			Déconnexion
			<template #icon>
				<sign-out-alt></sign-out-alt>
			</template>
		</n-button>
	</div>
</template>
<script lang="ts" setup>
import { NButton } from 'naive-ui';
import { Calendar, Users, FileExcel, SignOutAlt } from '@vicons/fa'
import { useRouter, useRoute } from 'vue-router'
import useStore from '../stores/store'
const store = useStore()
const router = useRouter()
const route = useRoute()
const getButtonAttrs = (path: string) => {
	const isPath = route.path === path
	return {
		secondary: isPath,
		quaternary: !isPath,
		onClick: () => router.push({ path })
	}
}
</script>
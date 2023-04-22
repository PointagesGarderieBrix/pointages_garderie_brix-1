<template>
	<n-card title="Ajouter un enfant">
		<n-input-group>
			<n-input v-model:value="lastName" placeholder="Nom"></n-input>
			<n-input v-model:value="firstName" placeholder="Prénom"></n-input>
			<n-button :disabled="!lastName || !firstName" @click="store.addKid(lastName, firstName)">OK</n-button>
		</n-input-group>
	</n-card>
	<n-list bordered v-if="store.kids.length">
		<n-list-item v-for="kid in                     store.kids                    ">
			<div style="display:grid;grid-template-columns: 1fr auto;">
				<n-thing style="margin:auto"> {{ kid.data().Nom }} {{ kid.data().Prénom }}</n-thing>
				<n-button @click="showDeleteModal = true; deleteKidRef = kid.ref">
					<n-icon>
						<trash />
					</n-icon>
				</n-button>
			</div>
		</n-list-item>

	</n-list>
	<n-modal v-model:show=" showDeleteModal " style="width:fit-content">
		<n-card title="Supprimer cet enfant de la liste?">
			<n-space style="display :grid">
				<n-alert title="Attention" type="warning">
					Tous les pointages associés à cet enfant seront supprimés.
				</n-alert>
				<n-space justify="space-around">
					<n-button type="error" @click=" deleteKid ">Confirmer</n-button>
					<n-button @click=" showDeleteModal = false; deleteKidRef = null ">Annuler</n-button>
				</n-space>
			</n-space>
		</n-card>
	</n-modal>
</template>
<script setup lang="ts">
import { NList, NListItem, NInputGroup, NInput, NButton, NThing, NIcon, NCard, NModal, NAlert, NSpace } from 'naive-ui'
import { Trash } from '@vicons/fa'
import { onMounted, ref } from 'vue'
import useStore from '../stores/store'
import { DocumentReference } from 'firebase/firestore/lite'
const store = useStore()
onMounted(async () => {
	await store.getKids()
})
const lastName = ref('')
const firstName = ref('')

const deleteKidRef = ref<DocumentReference | null>(null)
const showDeleteModal = ref(false)
const deleteKid = async () => {
	if (deleteKidRef.value) {
		await store.deleteKid(deleteKidRef.value)
		deleteKidRef.value = null
		showDeleteModal.value = false
	}

}
</script>
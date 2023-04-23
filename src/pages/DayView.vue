<template>
	<div>
		<n-card>
			<n-input-group>
				<n-button @click="changeDay(-1)">-</n-button>
				<n-date-picker style="max-width: 130px;" v-model:value="day" type="date" />
				<n-button @click="changeDay(1)" style="margin-right:auto">+</n-button>
				<n-button :type="morning ? 'primary' : 'default'" @click="morning = true">Matin</n-button>
				<n-button :type="!morning ? 'primary' : 'default'" @click="morning = false">Après-Midi</n-button>

			</n-input-group>
		</n-card>
		<n-card title="Ajouter un pointage">
			<div style="display:grid;max-width: 300px;place-items: center;margin:auto">
				<n-select :clearable="true" v-model:value="selectedKid" :options="kidOptions">
				</n-select>
				<n-input v-model:value="comment" placeholder="Commentaire"></n-input>
				<n-input-group>
					<n-time-picker placeholder="Arrivée" v-model:value="start" :hours="hours" :minutes="15"
						format="HH:mm" />
					<n-time-picker placeholder="Départ" v-model:value="end" :hours="hours" :minutes="15" format="HH:mm" />
					<n-button @click="savePointage" :disabled="!selectedKid || !start">Ok</n-button>
				</n-input-group>
			</div>
		</n-card>
		<n-table :bordered="false" :single-line="false">
			<thead>
				<tr>

					<th>Enfant</th>
					<th style="width:1%">Arrivée</th>
					<th style="width:100px">Départ</th>
					<th style="width:1%">Durée</th>
					<th style="width:1%" size="small"></th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="pointage of                                           list                                          ">
					<td>
						<div>{{ pointage.name }}</div>
						<div><n-text depth="3">{{ pointage.comment }}</n-text></div>
					</td>
					<td>{{ pointage.start }}</td>
					<td v-if="pointage.end">{{ pointage.end }}</td>
					<td v-else>
						<n-time-picker placeholder="Départ" v-model:value="start" :hours="hours" :minutes="15"
							format="HH:mm" @update:value="val => udpateCell('Départ', pointage.id, val)" />
					</td>
					<td v-if="pointage.Départ">
						{{ pointage.h }}h
						{{ pointage.m }}m
					</td>
					<td v-else></td>
					<td>
						<n-button
							@click="editPointageRef = pointage.id; selectedPointage = { ...pointage }; editModal = true">
							<template #icon>
								<n-icon size="15px">
									<Pen></Pen>
								</n-icon>
							</template>
						</n-button>
					</td>
				</tr>
			</tbody>
		</n-table>
	</div>
	<n-modal v-model:show=" editModal " style="width:fit-content;min-width:300px;min-height: 300px;">
		<n-card>

			<n-space vertical v-if=" selectedPointage ">
				<n-thing description="Nom - Prénom">
					<n-select :clearable=" true " v-model:value=" selectedPointage.name " :options=" kidOptions "
						@update:value=" val => udpateCell('Enfant', editPointageRef, val) " />
				</n-thing>
				<n-thing description="Arrivée">
					<n-time-picker placeholder="Arrivée" v-model:value=" selectedPointage.Arrivée " :hours=" hours "
						:minutes=" 15 " format="HH:mm"
						@update-value=" val => udpateCell('Arrivée', editPointageRef, val) " />
				</n-thing>
				<n-thing description="Départ">
					<n-time-picker placeholder="Départ" v-model:value=" selectedPointage.Départ " :hours=" hours "
						:minutes=" 15 " format="HH:mm"
						@update:value=" val => udpateCell('Départ', editPointageRef, val) " />
				</n-thing>
				<n-thing description="Commentaire">
					<n-input placeholder="Commentaire" v-model:value=" selectedPointage.comment "
						@update:value=" val => udpateCell('Commentaire', editPointageRef, val) " />
				</n-thing>
				<n-button type="error" style="width:100%" @click=" deletePointage ">
					<template #icon>
						<n-icon>
							<Trash />
						</n-icon>
					</template>
					Supprimer ce pointage
				</n-button>
			</n-space>
		</n-card>
	</n-modal>
</template>
<script setup lang="ts">
import { NTable, NInputGroup, NSelect, NTimePicker, NButton, NDatePicker, NCard, NIcon, NModal, NThing, NSpace, NInput, NText } from 'naive-ui'
import { Pen, Trash } from '@vicons/fa'
import useStore from '../stores/store'
import { Kid, Pointage } from '../interfaces'
import dayjs from 'dayjs'
import { ref, computed, watch } from 'vue'
import { DocumentData, DocumentReference } from 'firebase/firestore/lite'
import { useDebounceFn } from '@vueuse/core'
const store = useStore()
const pointages = ref<DocumentData[]>([])
const day = ref(new Date().getTime())
const changeDay = (nb: -1 | 1) => {
	day.value = dayjs(day.value).add(nb, 'day').toDate().getTime()
}
const getPointagesToday = async () => {
	pointages.value = await store.getPointages(
		dayjs(day.value).startOf('day').toDate(),
		dayjs(day.value).endOf('day').toDate()
	)
}
watch(
	day,
	getPointagesToday,
	{ immediate: true }
)



const kidOptions = computed<{ label: string, value: string }[]>(() => store.kids.map(kidDoc => {
	const data: Kid = kidDoc.data()
	return {
		label: `${data.Nom} ${data.Prénom}`,
		value: kidDoc.id
	}
}))

const list = computed(() => {
	return pointages.value
		.filter(pointage => {
			return (dayjs(pointage.data().Arrivée).hour() < 12) === morning.value && store.kids.some(kid => pointage.data().Enfant === kid.id)
		})
		.map(pointage => {
			const data: Pointage = pointage.data()
			const kid = store.kids.find(kid => kid.id === data.Enfant)!.data()
			const h = Math.floor(dayjs(data.Départ).diff(data.Arrivée, 'minutes') / 60)
			const m = (dayjs(data.Départ).minute() - dayjs(data.Arrivée).minute()) % 60
			return {
				name: `${kid.Nom} ${kid.Prénom}`,
				Arrivée: data.Arrivée,
				Départ: data.Départ,
				start: dayjs(data.Arrivée).format('HH:mm'),
				end: data.Départ ? dayjs(data.Départ).format('HH:mm') : null,
				ref: pointage.ref,
				id: pointage.id,
				h,
				m: m < 0 ? 60 + m : m,
				comment: data.Commentaire
			}
		})
})
const morning = ref(new Date().getHours() < 12)
const selectedKid = ref<string | null>(null)
const start = ref<number | null>(null)
const end = ref<number | null>(null)
const date = computed(() => dayjs(day.value).startOf('day').toDate())
const comment = ref('')
const hours = computed(() => morning.value ? [6, 7, 8, 9, 10, 11, 12] : [12, 13, 14, 15, 16, 17, 18, 19, 20])

const savePointage = async () => {
	if (selectedKid.value && start.value) {
		await store.addPointage(selectedKid.value, start.value, end.value, date.value, comment.value)
		await getPointagesToday()
		selectedKid.value = null
		start.value = null
		end.value = null
		comment.value
	}
}
const editModal = ref(false)
const editPointageRef = ref<string | null>(null)

const selectedPointage = ref<Partial<{
	name: string
	Arrivée: number,
	Départ: number,
	ref: DocumentReference,
	id: string,
	comment: string
}> | null>(null)
const deletePointage = async () => {
	if (editPointageRef.value) {
		const ref = pointages.value.find(pointage => pointage.id === editPointageRef.value)!.ref
		await store.deletePointage(ref)
		await getPointagesToday()
		editModal.value = false
	}
}
const udpateCell = useDebounceFn(async <T extends keyof Pointage>(field: T, id: string | null, value: Pointage[T]) => {
	if (!id) return
	const ref = pointages.value.find(p => p.id === id)!.ref
	await store.updatePointage(ref, { [field]: value })
	getPointagesToday()
}, 1000)
</script>
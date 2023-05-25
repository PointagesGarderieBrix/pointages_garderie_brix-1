<template>
	<div style="display: grid;place-items: center;">
		<n-button-group>
			<n-button @click="year--">
				<template #icon>
					<n-icon>
						<Minus></Minus>
					</n-icon>
				</template>
			</n-button>
			<n-button tertiary>{{ year }}</n-button>
			<n-button @click="year++">
				<template #icon>
					<n-icon>
						<Plus></Plus>
					</n-icon>
				</template>
			</n-button>
		</n-button-group>
	</div>
	<hr />
	<n-table style="width:300px;margin: auto;">
		<tr v-for="month in new Array(12).fill(null).map((_, i) => i)"
			style="text-transform:capitalize;display:grid;grid-template-columns: 1fr auto;">
			<td>{{ dayjs().month(month).format("MMMM") }}</td>
			<td>
				<n-button @click="extract(month)">
					<template #icon>
						<n-icon>
							<FileExcel></FileExcel>
						</n-icon>
					</template>
				</n-button>
			</td>
		</tr>
	</n-table>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import dayjs from 'dayjs';
import useStore from '../stores/store';
const store = useStore()
import { NButtonGroup, NButton, NIcon, NTable } from 'naive-ui';
import { FileExcel } from '@vicons/fa'
import { Plus, Minus } from '@vicons/fa'
import { Workbook } from 'exceljs'
import { Kid, Pointage } from '../interfaces';
const year = ref(new Date().getFullYear())
const extract = async (month: number) => {
	const pointages = await store.getPointages(
		dayjs().year(year.value).month(month).date(1).startOf('day').toDate(),
		dayjs().year(year.value).month(month).date(31).endOf('day').toDate()
	)
	const wb = new Workbook()
	const monthName = dayjs().month(month).format("MMMM")
	const ws = wb.addWorksheet(monthName)

	ws.addTable({
		name: monthName,
		ref: 'A1',
		headerRow: true,
		totalsRow: true,
		style: {
			theme: 'TableStyleDark3',
			showRowStripes: true,
		},
		columns: [
			{ name: 'Nom - Prénom', filterButton: true },
			{ name: 'Jour', filterButton: true },
			{ name: 'Matin/AM', filterButton: true },
			{ name: 'Départ', filterButton: false },
			{ name: 'Arrivée', filterButton: false },
			{ name: 'Durée', totalsRowFunction: 'sum', filterButton: false },
			{ name: 'Commentaire', filterButton: false },
		],
		rows: pointages
			.filter(pointage => {
				const data: Pointage = pointage.data() as Pointage
				const kid: Kid = store.kids.find(kid => kid.id === data.Enfant) as Kid
				return kid && data.Départ
			})
			.map(pointage => {
				const { name, duréeRounded, jour, AMorPM, arrivée, départ, comment } = store.getData(pointage.data())
				return [
					name,
					jour,
					AMorPM,
					arrivée,
					départ,
					duréeRounded,
					comment
				]
			}),
	})
	const synthese = wb.addWorksheet(`Synthèse par enfant ${monthName}`)
	synthese.addTable({
		name: `Synthèse_par_enfant_${monthName}`,
		ref: 'A1',
		headerRow: true,
		totalsRow: true,
		style: {
			theme: 'TableStyleDark3',
			showRowStripes: true,
		},
		columns: [
			{ name: 'Nom - Prénom', filterButton: true },
			{ name: 'Durée', totalsRowFunction: 'sum', filterButton: false },
		],
		rows: pointages
			.filter(pointage => {
				const data: Pointage = pointage.data() as Pointage
				const kid: Kid = store.kids.find(kid => kid.id === data.Enfant) as Kid
				return kid && data.Départ
			})
			.reduce((acc, pointage) => {
				const { name, duréeRounded } = store.getData(pointage)
				const existingRow = acc.find(([n, _]) => n === name)
				if (existingRow) {
					existingRow[1] += duréeRounded
				} else {
					acc.push([name, duréeRounded])
				}
				return acc
			}, [] as Array<[string, number]>)
	})
	const buffer = await wb.xlsx.writeBuffer()
	const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
	const link = document.createElement('a')
	link.href = URL.createObjectURL(blob)
	link.download = `extraction pointages garderie ${monthName} ${year.value}.xlsx`
	link.click();
	URL.revokeObjectURL(link.href);

}
</script>
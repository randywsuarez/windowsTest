<template>
	<div>
		<q-card id="gpu">
			<q-card-section class="center">
				<q-checkbox size="150px" v-model="noGPU" label="No GPU" v-if="type === 'DESKTOP'" />

				<q-table
					class="card"
					title="GPU Information"
					:data="video"
					dense
					:columns="columns"
					row-key="name"
					binary-state-sort
				>
					<template v-slot:body="props">
						<q-tr :props="props">
							<q-td key="Description" :props="props">
								{{ props.row.Description }}
							</q-td>
							<q-td key="Memory" :props="props">
								{{ props.row.Memory }}
								<q-popup-edit
									class="card"
									v-model="props.row.Memory"
									title="Update Memory"
									buttons
									persistent
									v-slot="scope"
									v-if="type === 'DESKTOP'"
								>
									<q-input
										type="text"
										v-model="scope.value"
										dense
										autofocus
										hint="Use buttons to close"
									/>
								</q-popup-edit>
							</q-td>
							<q-td key="Type" :props="props">
								{{ props.row.Type }}
							</q-td>
						</q-tr>
					</template>
				</q-table>
			</q-card-section>
		</q-card>

		<!-- Botones de acción -->
		<div class="col">
			<div id="kb_box_b" class="row justify-between q-pt-md">
				<q-btn color="red" icon="close" label="Fail" @click="captureGpuStatus('fail')" />
				<q-btn color="green" icon="check" label="Pass" @click="captureGpuStatus('pass')" />
			</div>
		</div>
	</div>
</template>

<script>
	import { mapState, mapMutations } from 'vuex'
	import html2canvas from 'html2canvas'

	export default {
		data() {
			return {
				noGPU: false,
				video: [],
				columns: [
					{ name: 'Description', label: 'Description', field: 'Description', align: 'left' },
					{ name: 'Memory', label: 'Memory', field: 'AdapterRAM', align: 'center' },
					{ name: 'Type', label: 'Type', field: 'Type', align: 'left' },
				],
			}
		},
		computed: {
			...mapState('information', ['infoServer', 'type']),
		},
		watch: {
			noGPU(newVal) {
				if (newVal) {
					this.video = []
				} else {
					this.loadGPUData()
				}
			},
		},
		methods: {
			...mapMutations('information', ['SET_INFO_SERVER']),

			loadGPUData() {
				this.video = [...(this.infoServer?.infoTest?.GPUs || [])] // ✅ Evitar fallos si GPUs es undefined
			},

			async captureGpuStatus(status) {
				try {
					const element = document.getElementById('gpu')
					if (!element) {
						console.error('GPU element not found')
						return
					}

					const canvas = await html2canvas(element)
					const imageData = canvas.toDataURL('image/png')

					const result = {
						base64: imageData,
						ext: 'png',
						type: 'gpu',
						status: status === 'pass',
						message: `GPU test ${status.toUpperCase()}`,
					}

					// ✅ Usar mutación en lugar de modificar `state` directamente
					const updatedInfoServer = {
						...this.infoServer,
						information: {
							...this.infoServer.information,
							GPU: (this.infoServer.infoTest.GPUs || [])
								.filter((gpu) => gpu.Type === 'Dedicated')
								.map((gpu) => `${gpu.Description} ${gpu.AdapterRAM}`),

							GPUIntegrated: (this.infoServer.infoTest.GPUs || [])
								.filter((gpu) => gpu.Type === 'Integrated')
								.map((gpu) => `${gpu.Description} ${gpu.AdapterRAM}`),
						},
					}

					this.SET_INFO_SERVER(updatedInfoServer) // ✅ Mutación Vuex

					localStorage.setItem('gpuTestState', JSON.stringify(result))
					this.$emit('input', result)
				} catch (error) {
					console.error('Error capturing GPU status:', error)
				}
			},
		},
		mounted() {
			this.loadGPUData()
		},
	}
</script>

<style scoped>
	.card {
		max-width: 800px;
		margin: auto;
	}
	.center {
		display: flex;
		justify-content: center;
	}
</style>

<template>
	<div class="q-pa-md">
		<title>Components Test</title>

		<q-stepper
			flat
			v-model="step"
			header-nav
			ref="stepper"
			color="green"
			animated
			class="full-width-stepper dense-stepper"
			alternative-labels
		>
			<q-step
				v-for="(stepComponent, index) in paginatedSteps"
				:key="index"
				:name="index + 1"
				:title="stepComponent.title"
				:icon="stepComponent.icon"
				:done="(test[stepComponent.title] && test[stepComponent.title].status) || false"
				:header-nav="(test[stepComponent.title] && test[stepComponent.title].status) || false"
			>
				<component :is="stepComponent.component" v-model="test[stepComponent.title]" />

				<q-stepper-navigation class="row justify-between align-center q-pt-md">
					<!-- Mostrar 'Previous Group' en el primer paso del grupo si hay un grupo anterior -->
					<q-btn
						flat
						v-if="index === 0 && currentStepGroup > 0"
						@click="previousGroup"
						color="primary"
						label="Previous Group"
						class="q-ml-sm"
					/>

					<!-- Botón 'Back' en pasos intermedios -->
					<q-btn
						flat
						v-if="index > 0"
						@click="previousStep"
						color="primary"
						label="Back"
						class="q-ml-sm"
					/>

					<!-- Mostrar 'Procesar' en el último paso del último grupo -->
					<q-btn
						v-if="index === paginatedSteps.length - 1 && currentStepGroup === totalGroups - 1"
						@click="process"
						:disable="!isStepValid(stepComponent.title)"
						color="green"
						label="Process"
						class="q-ml-sm q-mr-md"
					/>

					<!-- Mostrar 'Next Group' en el último paso de un grupo si hay otro grupo disponible -->
					<q-btn
						v-else-if="index === paginatedSteps.length - 1 && currentStepGroup < totalGroups - 1"
						@click="nextGroup"
						:disable="!isStepValid(stepComponent.title)"
						color="primary"
						label="Next Group"
						class="q-ml-sm q-mr-md"
					/>

					<!-- Botón 'Next' siempre alineado a la derecha -->
					<q-btn
						v-else
						:disable="!isStepValid(stepComponent.title)"
						@click="nextStep"
						color="primary"
						label="Next"
						class="q-ml-sm q-mr-md"
					/>
				</q-stepper-navigation>
			</q-step>
		</q-stepper>
	</div>
</template>

<script>
	import { mapState, mapActions } from 'vuex'
	import Keyboard from '../components/Keyboard.vue'
	import Mouse from '../components/Mouse.vue'
	import Mic from '../components/Mic.vue'
	import touchScreen from '../components/touchScreen.vue'
	import spotLights from '../components/deadPixel.vue'
	import speaker from '../components/soundTest.vue'
	import brightness from '../components/Brightness.vue'
	import webcam from '../components/webcam.vue'
	import battery from '../components/battery.vue'
	import windows from '../components/windows.vue'
	import formComponent from '../components/formComponent.vue'
	import gpu from '../components/gpu.vue'
	import drivers from 'src/components/drivers.vue'

	export default {
		components: {
			Keyboard,
			Mouse,
			Mic,
			touchScreen,
			spotLights,
			speaker,
			brightness,
			webcam,
			battery,
			windows,
			formComponent,
			gpu,
			drivers,
		},
		data() {
			return {
				step: 1,
				test: {},
				stepper: [],
				currentType: 'LAPTOP', // Default to MOUSE if no type is provided
				stepsPerGroup: 5,
				currentStepGroup: 0,
			}
		},
		computed: {
			...mapState([
				'hardwareInfo',
				'type',
				'systemInfo',
				'loading',
				'infoServer',
				'win',
				'informationBios',
				'advancedBios',
				'systemInformation',
				'TocuhScreen',
				'Webcam',
				'typeCTO',
				'GPU',
			]),
			filteredSteps() {
				if (!Array.isArray(this.stepper) || this.stepper.length === 0) {
					return []
				}
				// Filter steps based on types
				return this.stepper
					.filter((step) => step.types && step.types.includes(this.currentType.toUpperCase()))
					.sort((a, b) => a.sort - b.sort)
			},
			totalGroups() {
				return Math.ceil(this.filteredSteps.length / this.stepsPerGroup)
			},
			paginatedSteps() {
				const start = this.currentStepGroup * this.stepsPerGroup
				return this.filteredSteps.slice(start, start + this.stepsPerGroup)
			},
		},
		methods: {
			...mapActions('fetchSystemInfo'),
			isStepValid(title) {
				return this.test[title] && this.test[title].status === true
			},
			/* nextStep(index) {
				this.step = index + 2
			}, */
			nextStep() {
				if (this.step < this.paginatedSteps.length) {
					this.step++
					//this.step = index + 2
				} else {
					this.nextGroup()
				}
			},
			previousStep() {
				if (this.step > 1) {
					this.step--
					//this.step = index - 2
				} else {
					this.previousGroup()
				}
			},
			lastStep() {
				console.log('Last step executed')
			},
			initializeTestModel() {
				this.filteredSteps.forEach((step) => {
					this.$set(this.test, step.title, {})
				})
			},
			async scrapping() {
				if (!this.scrappingPromise) {
					//this.$q.loading.show()
					// Solo inicializa la promesa si no existe
					this.scrappingPromise = (async () => {
						try {
							const driversCode = await this.$db.funcAdmin('modules/powershell/drivers')
							// Ejecutar las consultas asincrónicas concurrentemente
							let [info, battery, drivers] = await Promise.all([
								this.$hardwareInfo(),
								this.type == 'LAPTOP' || this.type == 'TABLET'
									? this.$getSpecificInfo('battery')
									: {},
								this.$cmd.executeScriptCode(driversCode),
							])
							// Asignar resultados a variables
							this.$store.state.hardwareInfo = { ...info, battery, drivers }
						} catch (error) {
							this.$q
								.dialog({
									title: 'Error',
									message: `An error occurred during the scrapping of the information: ${error.message}`,
									persistent: true,
									color: 'red',
									ok: {
										label: 'Retry',
									},
								})
								.onOk(() => {
									this.scrapping() // Reintenta el proceso
								})
							throw error // Lanza el error para que sea manejado si es necesario
						}
					})()
				}
				return this.scrappingPromise // Retorna la promesa para que pueda ser usada
			},
			nextGroup() {
				if (this.currentStepGroup < this.totalGroups - 1) {
					this.currentStepGroup++
					this.step = 1
				}
			},
			previousGroup() {
				if (this.currentStepGroup > 0) {
					this.currentStepGroup--
					this.step = this.stepsPerGroup
				}
			},
			isStepValid(title) {
				return this.test[title] && this.test[title].status
			},
			async process() {
				console.log('Process executed')
				await this.$db.funcAdmin('modules/windowsTest/finishTest', {
					hardwareInfo: this.hardwareInfo,
					systemInfo: this.systemInfo,
					infoServer: this.infoServer,
					windows: this.test.win,
					informationBios: this.informationBios,
					advancedBios: this.advancedBios,
					systemInformation: this.systemInformation,
					type: this.type,
					TocuhScreen: this.TocuhScreen,
					Webcam: this.Webcam,
					typeCTO: this.typeCTO,
					GPU: this.GPU,
					test: this.test,
				})
			},
		},
		async mounted() {
			// Get currentType from route params, default to MOUSE if not provided
			this.currentType = this.$route.query.type
				? this.$route.query.type.toUpperCase()
				: this.currentType
			console.log(this.$route.query.type)

			this.$db
				.collection('TestSettings')
				.conditions({ Description: 'Test' })
				.admin()
				.get()
				.then((v) => {
					if (v && Array.isArray(v) && v.length > 0 && v[0] && v[0].stepComponents) {
						this.stepper = v[0].stepComponents
						this.initializeTestModel()
					} else {
						console.error('Invalid data structure:', v)
					}
					this.scrapping()
				})
				.catch((error) => {
					console.error('Error fetching data:', error)
				})
		},
	}
</script>

<style scoped>
	.q-pa-md {
		padding: 16px;
	}
	.q-stepper-navigation {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.full-width-stepper {
		width: 100%;
	}
	.q-stepper {
		font-size: 0.9rem; /* Adjust font size for better fit */
	}
	.q-stepper .q-step {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.q-stepper .q-step .q-stepper-header {
		display: flex;
		justify-content: space-between;
	}
	.q-stepper .q-stepper-header {
		gap: 0.5rem;
	}
	.text-center {
		text-align: center;
	}
</style>

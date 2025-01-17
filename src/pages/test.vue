<template>
	<div class="q-pa-md">
		<title>Components Test</title>

		<q-stepper
			v-model="step"
			header-nav
			ref="stepper"
			color="green"
			animated
			class="full-width-stepper"
			alternative-labels
		>
			<q-step
				v-for="(stepComponent, index) in filteredSteps"
				:key="index"
				:name="index + 1"
				:title="stepComponent.title"
				:icon="stepComponent.icon"
				:done="(test[stepComponent.title] && test[stepComponent.title].status) || false"
				:header-nav="(test[stepComponent.title] && test[stepComponent.title].status) || false"
			>
				<component :is="stepComponent.component" v-model="test[stepComponent.title]" />

				<q-stepper-navigation class="row justify-between align-center q-pt-md">
					<q-btn
						flat
						v-if="index > 0"
						@click="step = index"
						color="primary"
						label="Back"
						class="q-ml-sm"
					/>
					<q-btn
						v-if="index < filteredSteps.length - 1"
						:disable="!isStepValid(stepComponent.title)"
						@click="nextStep(index)"
						color="primary"
						label="Continue"
						class="q-mr-sm"
					/>
					<q-btn
						v-else
						:disable="!isStepValid(stepComponent.title)"
						@click="lastStep"
						color="primary"
						label="Continue"
						class="q-mr-sm"
					/>
				</q-stepper-navigation>
			</q-step>
		</q-stepper>
	</div>
</template>

<script>
	import Keyboard from '../components/Keyboard.vue'
	import Mouse from '../components/Mouse.vue'
	import Mic from '../components/Mic.vue'
	import touchScreen from '../components/touchScreen.vue'
	import spotLights from '../components/deadPixel.vue'
	import speaker from '../components/soundTest.vue'
	import brightness from '../components/Brightness.vue'
	import webcam from '../components/webcam.vue'

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
		},
		data() {
			return {
				step: 1,
				test: {},
				stepper: [],
				currentType: 'LAPTOP', // Default to MOUSE if no type is provided
			}
		},
		computed: {
			filteredSteps() {
				if (!Array.isArray(this.stepper) || this.stepper.length === 0) {
					return []
				}
				// Filter steps based on types
				return this.stepper
					.filter((step) => step.types && step.types.includes(this.currentType.toUpperCase()))
					.sort((a, b) => a.sort - b.sort)
			},
		},
		methods: {
			isStepValid(title) {
				return this.test[title] && this.test[title].status === true
			},
			nextStep(index) {
				this.step = index + 2
			},
			lastStep() {
				console.log('Last step executed')
			},
			initializeTestModel() {
				this.filteredSteps.forEach((step) => {
					this.$set(this.test, step.title, {})
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

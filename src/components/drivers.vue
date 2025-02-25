<template>
	<q-card id="drivers" class="q-ma-md shadow-box">
		<q-card-section class="row items-center">
			<q-icon :name="statusIcon" :color="statusColor" size="md" class="q-mr-md" />
			<div>
				<div class="text-h6 text-bold">{{ statusText }}</div>
				<div v-if="data.missingDrivers.length" class="text-caption text-negative">
					Missing Drivers: {{ data.missingDrivers.length }}
				</div>
			</div>
		</q-card-section>

		<q-separator />

		<q-card-section v-if="data.missingDrivers.length">
			<q-list separator>
				<q-item dense v-for="(driver, index) in data.missingDrivers" :key="index">
					<q-item-section avatar>
						<q-icon name="mdi-alert-circle-outline" color="negative" />
					</q-item-section>
					<q-item-section>
						<q-item-label>{{ driver }}</q-item-label>
					</q-item-section>
				</q-item>
			</q-list>
		</q-card-section>

		<q-separator />

		<q-card-section class="row items-center">
			<q-icon
				:name="data.video ? 'mdi-check-circle' : 'mdi-close-circle'"
				:color="data.video ? 'positive' : 'negative'"
				size="md"
				class="q-mr-md"
			/>
			<div>
				<div class="text-subtitle2">{{ data.video ? 'Video OK' : 'Video Issue' }}</div>
			</div>
		</q-card-section>

		<q-separator />

		<q-card-section class="row items-center justify-center">
			<q-btn label="Pass" color="positive" @click="markAsPass" />
		</q-card-section>
	</q-card>
</template>

<script>
	import { mapState } from 'vuex'
	import html2canvas from 'html2canvas'

	export default {
		data() {
			return {
				data: {
					missingDrivers: [],
					video: false,
				},
				testResult: {
					status: false,
					ext: 'png',
					base64: '',
					message: 'Drivers test FAIL',
					type: 'drivers',
				},
			}
		},
		computed: {
			...mapState('information', ['hardwareInfo', 'infoServer']), // ✅ Uso correcto del namespace en Vuex

			statusIcon() {
				return this.testResult.status ? 'mdi-check-circle' : 'mdi-alert-circle'
			},
			statusColor() {
				return this.testResult.status ? 'positive' : 'negative'
			},
			statusText() {
				return this.testResult.status ? 'Success' : 'Failed'
			},
		},
		methods: {
			async captureScreenshot() {
				const element = document.getElementById('drivers')
				if (!element) {
					console.error('Drivers element not found')
					return
				}

				try {
					const canvas = await html2canvas(element)
					this.testResult.base64 = canvas.toDataURL('image/png')
				} catch (error) {
					console.error('Error capturing screenshot:', error)
				}
			},

			markAsPass() {
				this.testResult.status = true
				this.testResult.message = 'Drivers test PASS'

				this.captureScreenshot().then(() => {
					this.$emit('input', this.testResult)
				})
			},

			initializeTestResult() {
				// ✅ Validar que `hardwareInfo.drivers` existe antes de asignarlo
				if (this.hardwareInfo && this.hardwareInfo.drivers) {
					this.data = { ...this.hardwareInfo.drivers }
				} else {
					console.warn('No driver information found in hardwareInfo')
					this.data = { missingDrivers: [] } // Default vacío para evitar errores
				}

				// ✅ Validar que `missingDrivers` existe antes de acceder a `.length`
				this.testResult.status = this.data.missingDrivers && this.data.missingDrivers.length === 0
				this.testResult.message = this.testResult.status ? 'Drivers test PASS' : 'Drivers test FAIL'

				this.captureScreenshot().then(() => {
					if (this.testResult.status) {
						this.$emit('input', this.testResult)
					}
				})
			},
		},

		mounted() {
			this.initializeTestResult()
		},
	}
</script>

<style scoped>
	.shadow-box {
		border-radius: 12px;
		box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
	}
</style>

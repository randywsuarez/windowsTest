<template>
	<q-page>
		<div id="battery-capture" class="row q-col-gutter-lg">
			<!-- Columna de la batería -->
			<div class="col-12 col-md-7 flex flex-center">
				<div
					id="battery-capture"
					class="battery-container"
					:class="{ 'battery-disabled': isBatteryInvalid }"
					style="transform: scale(1.5)"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" class="battery-svg">
						<!-- Fondo gris del círculo -->
						<circle
							cx="60"
							cy="75"
							r="50"
							stroke-width="5"
							stroke="gray"
							fill="none"
							stroke-dasharray="314"
							stroke-dashoffset="0"
							stroke-linecap="round"
						/>
						<!-- Círculo animado -->
						<circle
							v-if="!isBatteryInvalid"
							cx="60"
							cy="75"
							r="50"
							stroke-width="5"
							:stroke="batteryColor"
							fill="none"
							stroke-dasharray="314"
							:stroke-dashoffset="batteryDashOffset"
							stroke-linecap="round"
						/>
						<!-- Parte positiva de la batería ajustada -->
						<rect x="53" y="40" width="14" height="8" rx="2" ry="2" fill="gray" />
						<!-- Fondo gris de la batería -->
						<rect x="45" y="45" width="30" height="60" rx="5" ry="5" fill="gray" />
						<!-- Batería interna con bloques -->
						<g v-if="!isBatteryInvalid" v-for="(block, index) in batteryBlocks" :key="index">
							<rect
								x="45"
								:y="105 - (index + 1) * 10"
								width="30"
								height="8"
								rx="2"
								ry="2"
								:fill="block.color"
								:opacity="batteryOpacity"
							/>
						</g>
						<!-- X para indicar batería inválida -->
						<line
							v-if="isBatteryInvalid"
							x1="20"
							y1="50"
							x2="100"
							y2="120"
							stroke="red"
							stroke-width="5"
						/>
						<line
							v-if="isBatteryInvalid"
							x1="100"
							y1="50"
							x2="20"
							y2="120"
							stroke="red"
							stroke-width="5"
						/>
					</svg>
				</div>
			</div>

			<!-- Columna de la información -->
			<div class="col-12 col-md-5">
				<q-card>
					<q-card-section>
						<div class="text-h6">Specifications</div>
					</q-card-section>
					<q-separator />
					<q-card-section>
						<q-list dense>
							<q-item
								v-for="(item, index) in batteryDetails"
								:key="index"
								clickable
								v-ripple
								:class="index % 2 === 0 ? 'bg-grey-2' : ''"
							>
								<q-item-section avatar>
									<q-icon :name="item.icon" color="primary" />
								</q-item-section>
								<q-item-section>
									<q-item-label caption>{{ item.label }}</q-item-label>
									<q-item-label>{{ item.value }}</q-item-label>
								</q-item-section>
							</q-item>
						</q-list>
					</q-card-section>
				</q-card>
			</div>

			<!-- Botones de acción -->
			<div class="col">
				<div id="kb_box_b" class="row justify-between q-pt-md">
					<q-btn color="red" icon="close" label="Fail" @click="captureBatteryStatus('fail')" />
					<q-btn
						color="green"
						icon="check"
						label="Pass"
						:disable="batteryInfo.estimatedLife < minimum"
						@click="captureBatteryStatus('pass')"
					/>
				</div>
			</div>
		</div>
	</q-page>
</template>

<script>
	import html2canvas from 'html2canvas'
	import { mapState } from 'vuex'

	export default {
		name: 'BatteryComponent',
		props: {
			batteryInfo: {
				type: Object,
				required: false,
				default: () => ({
					hasBattery: true,
					cycleCount: 0,
					isCharging: false,
					designedCapacity: 68426,
					maxCapacity: 54923,
					currentCapacity: 54923,
					voltage: 12.582,
					capacityUnit: 'mWh',
					percent: 95,
					timeRemaining: null,
					acConnected: true,
					type: '',
					model: '00020 2023/02/04Hewlett-PackardPrimary',
					manufacturer: '',
					serial: '',
					estimatedLife: 100,
				}),
			},
		},
		computed: {
			...mapState(['informationBios', 'hardwareInfo']),
			isBatteryInvalid() {
				return !this.batteryInfo.hasBattery || this.batteryInfo.estimatedLife > 100
			},
			batteryDetails() {
				return [
					{ label: 'Model', value: this.batteryInfo.model, icon: 'devices' },
					{ label: 'Manufacturer', value: this.batteryInfo.manufacturer || 'N/A', icon: 'factory' },
					{
						label: 'Voltage',
						value: `${this.batteryInfo.voltage} V`,
						icon: 'battery_charging_full',
					},
					{
						label: 'Estimated Life',
						value: `${this.batteryInfo.estimatedLife}%`,
						icon: 'health_and_safety',
					},
					{ label: 'Percent', value: `${this.batteryInfo.percent}%`, icon: 'battery_std' },
					{
						label: 'Charging',
						value: this.batteryInfo.isCharging ? 'Yes' : 'No',
						icon: this.batteryInfo.isCharging ? 'power' : 'power_off',
					},
				]
			},
			batteryColor() {
				const percent = this.batteryInfo.percent
				if (percent > 100) return 'gray'
				if (percent >= 80) return 'green'
				if (percent >= 40) return 'orange'
				return 'red'
			},
			batteryOpacity() {
				const percent = Math.min(this.batteryInfo.estimatedLife, 100)
				return 0.8 + (percent / 100) * 0.2
			},
			batteryBlocks() {
				const blocks = []
				const levels = Math.ceil((this.batteryInfo.estimatedLife / 100) * 6)
				for (let i = 0; i < levels; i++) {
					let color = 'red'
					if (i >= 4) color = 'green'
					else if (i >= 2) color = 'orange'
					blocks.push({ index: i, color })
				}
				return blocks
			},
			batteryDashOffset() {
				const percent = Math.min(this.batteryInfo.percent, 100)
				return 314 - (percent / 100) * 314
			},
		},
		methods: {
			async captureBatteryStatus(status) {
				const element = document.getElementById('battery-capture')
				const canvas = await html2canvas(element)
				const imageData = canvas.toDataURL('image/png')
				const result = {
					base64: imageData,
					ext: 'png',
					type: 'battery',
					status: status === 'pass',
					message: `Battery test ${status.toUpperCase()}`,
				}
				localStorage.setItem('batteryTestState', JSON.stringify(result))
				this.$emit('input', result)
			},
		},
		mounted() {
			//this.batteryInfo = this.hardwareInfo?.battery
		},
	}
</script>

<style scoped>
	.battery-container {
		width: 150px;
		height: 150px;
		transform: scale(1.5);
	}

	.battery-svg {
		width: 100%;
		height: 100%;
	}

	.bg-grey-2 {
		background-color: #f5f5f5;
	}
</style>

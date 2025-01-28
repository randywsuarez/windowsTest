<template>
	<q-page>
		<div class="row q-col-gutter-lg">
			<!-- Columna de la batería -->
			<div class="col-12 col-md-7 flex flex-center">
				<div class="battery-container" style="transform: scale(1.5)">
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
						<g v-for="(block, index) in batteryBlocks" :key="index">
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
					</svg>
				</div>
			</div>

			<!-- Columna de la información -->
			<div class="col-12 col-md-5">
				<q-card>
					<q-card-section> <div class="text-h6">Specifications</div> </q-card-section>
					<q-separator />
					<q-card-section>
						<q-list>
							<q-item clickable v-ripple>
								<q-item-section>
									<q-item-label caption>Model</q-item-label>
									<q-item-label>{{ batteryInfo.model }}</q-item-label>
								</q-item-section>
							</q-item>
							<q-item clickable v-ripple>
								<q-item-section>
									<q-item-label caption>Manufacturer</q-item-label>
									<q-item-label>{{ batteryInfo.manufacturer || 'N/A' }}</q-item-label>
								</q-item-section>
							</q-item>
							<q-item clickable v-ripple>
								<q-item-section>
									<q-item-label caption>Voltage</q-item-label>
									<q-item-label>{{ batteryInfo.voltage }} V</q-item-label>
								</q-item-section>
							</q-item>
							<q-item clickable v-ripple>
								<q-item-section>
									<q-item-label caption>Estimated Life</q-item-label>
									<q-item-label>{{ batteryInfo.estimatedLife }}%</q-item-label>
								</q-item-section>
							</q-item>
							<q-item clickable v-ripple>
								<q-item-section>
									<q-item-label caption>Percent</q-item-label>
									<q-item-label>{{ batteryInfo.percent }}%</q-item-label>
								</q-item-section>
							</q-item>
							<q-item clickable v-ripple>
								<q-item-section>
									<q-item-label caption>Charging</q-item-label>
									<q-item-label>{{ batteryInfo.isCharging ? 'Yes' : 'No' }}</q-item-label>
								</q-item-section>
							</q-item>
						</q-list>
					</q-card-section>
				</q-card>
			</div>
		</div>
	</q-page>
</template>
<script>
	export default {
		name: 'BatteryComponent',
		props: {
			batteryInfo: {
				type: Object,
				required: true,
				default: () => ({
					hasBattery: true,
					cycleCount: 0,
					isCharging: false,
					designedCapacity: 68426,
					maxCapacity: 54923,
					currentCapacity: 54923,
					voltage: 12.582,
					capacityUnit: 'mWh',
					percent: 75,
					timeRemaining: null,
					acConnected: true,
					type: '',
					model: '00020 2023/02/04Hewlett-PackardPrimary',
					manufacturer: '',
					serial: '',
					estimatedLife: 100,
				}),
			},
			minimum: {
				type: Number,
				default: 80,
			},
		},
		computed: {
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

	.green {
		color: green;
	}

	.orange {
		color: orange;
	}

	.red {
		color: red;
	}

	.error {
		color: gray;
	}
</style>
